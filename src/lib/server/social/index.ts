/**
 * The social publishing queue.
 *
 * A composed post becomes one `social_posts` row plus one `social_targets` row
 * per network. `runDueSocialPosts()` publishes whatever is due; it is kicked
 * straight after "Publish now", and a timer started in `src/instrumentation.ts`
 * sweeps every minute for scheduled posts.
 */
import { db, logActivity, now } from "../db";

import { describeMeta, facebookStatus, instagramStatus, publishFacebook, publishInstagram } from "./meta";
import { describeTiktok, publishTiktok, tiktokStatus } from "./tiktok";
import type { MediaType, Platform, PlatformStatus, PublishResult, SocialJob } from "./types";
import { PLATFORM_LABELS, PLATFORM_MEDIA } from "./types";
import { describeYoutube, publishYoutube, youtubeStatus } from "./youtube";

export * from "./types";

const PUBLISHERS: Record<Platform, (job: SocialJob) => Promise<PublishResult>> = {
  facebook: publishFacebook,
  instagram: publishInstagram,
  youtube: publishYoutube,
  tiktok: publishTiktok,
};

export function platformStatus(platform: Platform): PlatformStatus {
  switch (platform) {
    case "facebook":
      return facebookStatus();
    case "instagram":
      return instagramStatus();
    case "youtube":
      return youtubeStatus();
    case "tiktok":
      return tiktokStatus();
  }
}

/** Asks each network who we are connected as. Errors are returned, not thrown. */
export async function describeAccounts(): Promise<Record<Platform, { ok: boolean; text: string }>> {
  const out = {} as Record<Platform, { ok: boolean; text: string }>;
  const settle = async (platform: Platform, fn: () => Promise<string>) => {
    if (!platformStatus(platform).configured) {
      out[platform] = { ok: false, text: "Not connected" };
      return;
    }
    try {
      out[platform] = { ok: true, text: await fn() };
    } catch (error) {
      out[platform] = { ok: false, text: error instanceof Error ? error.message : String(error) };
    }
  };
  const meta = describeMeta().catch((error: unknown) => ({ error }));
  await Promise.all([
    settle("facebook", async () => {
      const result = await meta;
      if ("error" in result) throw result.error;
      return result.page ?? "";
    }),
    settle("instagram", async () => {
      const result = await meta;
      if ("error" in result) throw result.error;
      return result.instagram ?? "";
    }),
    settle("youtube", describeYoutube),
    settle("tiktok", describeTiktok),
  ]);
  return out;
}

export interface SocialPostRow {
  id: number;
  caption: string;
  title: string;
  link: string;
  media_url: string;
  media_type: MediaType;
  scheduled_at: string;
  status: "scheduled" | "publishing" | "done" | "partial" | "failed" | "cancelled";
  created_by: number | null;
  created_at: string;
}

export interface SocialTargetRow {
  id: number;
  social_post_id: number;
  platform: Platform;
  status: "pending" | "done" | "failed" | "cancelled";
  remote_id: string;
  remote_url: string;
  error: string;
  attempted_at: string | null;
}

export function validateSocialPost(job: SocialJob, platforms: Platform[]): string | null {
  if (platforms.length === 0) return "Choose at least one network.";
  if (!job.caption.trim() && job.mediaType === "none") return "Write a caption or add a photo or video.";
  for (const platform of platforms) {
    if (!PLATFORM_MEDIA[platform].includes(job.mediaType)) {
      const needs = PLATFORM_MEDIA[platform].filter((type) => type !== "none").join(" or ");
      return `${PLATFORM_LABELS[platform]} needs a ${needs}.`;
    }
    if (!platformStatus(platform).configured) return `${PLATFORM_LABELS[platform]} is not connected yet (Social → Accounts).`;
  }
  if (platforms.includes("youtube") && !job.title.trim()) return "YouTube needs a video title.";
  return null;
}

export function queueSocialPost(job: SocialJob, platforms: Platform[], scheduledAt: string, userId: number): number {
  const handle = db();
  handle.exec("BEGIN");
  try {
    const result = handle
      .prepare(
        "INSERT INTO social_posts (caption, title, link, media_url, media_type, scheduled_at, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)",
      )
      .run(job.caption, job.title, job.link, job.mediaUrl, job.mediaType, scheduledAt, userId, now());
    const id = Number(result.lastInsertRowid);
    const insert = handle.prepare("INSERT INTO social_targets (social_post_id, platform) VALUES (?, ?)");
    for (const platform of platforms) insert.run(id, platform);
    handle.exec("COMMIT");
    return id;
  } catch (error) {
    handle.exec("ROLLBACK");
    throw error;
  }
}

export function listSocialPosts(limit = 100): (SocialPostRow & { targets: SocialTargetRow[] })[] {
  const posts = db().prepare("SELECT * FROM social_posts ORDER BY scheduled_at DESC LIMIT ?").all(limit) as unknown as SocialPostRow[];
  const targets = db().prepare("SELECT * FROM social_targets WHERE social_post_id = ?");
  return posts.map((post) => ({ ...post, targets: targets.all(post.id) as unknown as SocialTargetRow[] }));
}

export function cancelSocialPost(id: number): void {
  db().prepare("UPDATE social_posts SET status = 'cancelled' WHERE id = ? AND status = 'scheduled'").run(id);
  db().prepare("UPDATE social_targets SET status = 'cancelled' WHERE social_post_id = ? AND status = 'pending'").run(id);
}

/** Put failed networks back in the queue for another attempt. */
export function retrySocialPost(id: number): void {
  const changed = db()
    .prepare("UPDATE social_targets SET status = 'pending', error = '' WHERE social_post_id = ? AND status = 'failed'")
    .run(id);
  if (Number(changed.changes) > 0) {
    db().prepare("UPDATE social_posts SET status = 'scheduled', scheduled_at = ? WHERE id = ?").run(now(), id);
  }
}

let running = false;

export async function runDueSocialPosts(): Promise<void> {
  if (running) return;
  running = true;
  try {
    for (;;) {
      /* Claim one post at a time; the status flip is the lock. */
      const post = db()
        .prepare("SELECT * FROM social_posts WHERE status = 'scheduled' AND scheduled_at <= ? ORDER BY scheduled_at LIMIT 1")
        .get(now()) as SocialPostRow | undefined;
      if (!post) break;
      const claimed = db().prepare("UPDATE social_posts SET status = 'publishing' WHERE id = ? AND status = 'scheduled'").run(post.id);
      if (Number(claimed.changes) === 0) continue;

      const job: SocialJob = {
        caption: post.caption,
        title: post.title,
        link: post.link,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
      };
      const targets = db()
        .prepare("SELECT * FROM social_targets WHERE social_post_id = ? AND status = 'pending'")
        .all(post.id) as unknown as SocialTargetRow[];

      await Promise.all(
        targets.map(async (target) => {
          try {
            const result = await PUBLISHERS[target.platform](job);
            db()
              .prepare("UPDATE social_targets SET status = 'done', remote_id = ?, remote_url = ?, error = '', attempted_at = ? WHERE id = ?")
              .run(result.remoteId, result.remoteUrl, now(), target.id);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[social] ${target.platform} failed for post ${post.id}: ${message}`);
            db()
              .prepare("UPDATE social_targets SET status = 'failed', error = ?, attempted_at = ? WHERE id = ?")
              .run(message.slice(0, 1000), now(), target.id);
          }
        }),
      );

      const all = db().prepare("SELECT status FROM social_targets WHERE social_post_id = ?").all(post.id) as { status: string }[];
      const done = all.filter((row) => row.status === "done").length;
      const status = done === all.length ? "done" : done === 0 ? "failed" : "partial";
      db().prepare("UPDATE social_posts SET status = ? WHERE id = ?").run(status, post.id);
      logActivity(post.created_by, `social post ${status}`, post.caption.slice(0, 80));
    }
  } finally {
    running = false;
  }
}

/** Posts left 'publishing' by a restart mid-run go back in the queue. */
export function recoverInterruptedPosts(): void {
  db().prepare("UPDATE social_posts SET status = 'scheduled' WHERE status = 'publishing'").run();
}
