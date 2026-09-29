import Link from "next/link";

import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import SocialComposer, { type ComposerDraft } from "@/components/admin/SocialComposer";
import { formatDateTime } from "@/lib/admin/format";
import { getJob } from "@/lib/server/jobs";
import { getPostById } from "@/lib/server/posts";
import { siteUrl } from "@/lib/server/settings";
import { listSocialPosts, PLATFORM_LABELS, PLATFORM_MEDIA, PLATFORMS, platformStatus } from "@/lib/server/social";

import { cancelSocialPostAction, createSocialPostAction, retrySocialPostAction } from "../../actions";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "Social media" };

/* Caption limits: Instagram 2,200; TikTok 2,200 for video titles; YouTube 5,000; Facebook ~63,000. */
const CAPTION_LIMIT = { facebook: 5000, instagram: 2200, youtube: 5000, tiktok: 2200 } as const;

const STATUS_PILL: Record<string, string> = {
  done: "adm-pill--ok",
  partial: "adm-pill--warn",
  failed: "adm-pill--bad",
  scheduled: "adm-pill--new",
  publishing: "adm-pill--warn",
  pending: "adm-pill--new",
};

export default async function SocialPage({ searchParams }: PageProps<"/admin/social">) {
  await requireUser();
  const params = await searchParams;
  const platforms = PLATFORMS.map((id) => ({
    id,
    label: PLATFORM_LABELS[id],
    connected: platformStatus(id).configured,
    accepts: PLATFORM_MEDIA[id],
    captionLimit: CAPTION_LIMIT[id],
  }));

  /* "Save & share" from the blog editor arrives with the post pre-filled. */
  let draft: ComposerDraft = { caption: "", title: "", link: "" };
  const fromPost = typeof params.from_post === "string" ? getPostById(Number(params.from_post)) : undefined;
  if (fromPost) {
    draft = {
      caption: [fromPost.title, fromPost.excerpt].filter(Boolean).join("\n\n"),
      title: fromPost.title,
      link: `${siteUrl()}/blog/${fromPost.slug}`,
      media: fromPost.image_url
        ? { url: fromPost.image_url, type: "image", width: fromPost.image_width, height: fromPost.image_height }
        : undefined,
    };
  }

  const fromJob = typeof params.from_job === "string" ? getJob(Number(params.from_job)) : undefined;
  if (fromJob) {
    draft = {
      caption: [`We're hiring: ${fromJob.title} (${fromJob.job_type})`, fromJob.summary, "Apply on our website:"].filter(Boolean).join("\n\n"),
      title: `We're hiring: ${fromJob.title}`,
      link: `${siteUrl()}/careers/${fromJob.slug}`,
    };
  }

  const history = listSocialPosts();
  const anyConnected = platforms.some((platform) => platform.connected);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Social media</h1>
          <p>Write once, publish to Facebook, Instagram, YouTube and TikTok.</p>
        </div>
        <Link href="/admin/social/accounts" className="adm-btn adm-btn--ghost">
          Accounts
        </Link>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {fromPost ? <p className="adm-flash adm-flash--ok">Blog post saved. Choose where to share it.</p> : null}
      {fromJob ? (
        <p className="adm-flash adm-flash--ok">
          Vacancy saved. Instagram and TikTok need a picture — add one, or post to Facebook with the link alone.
        </p>
      ) : null}
      {!anyConnected ? (
        <p className="adm-flash adm-flash--warn">
          No network is connected yet. <Link href="/admin/social/accounts">Connect the school&apos;s accounts</Link> to start
          posting.
        </p>
      ) : null}

      <div className="adm-grid-2">
        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>New post</h2>
          <SocialComposer action={createSocialPostAction} platforms={platforms} draft={draft} />
        </section>

        <section className="adm-stack">
          <h2>Recent &amp; scheduled</h2>
          {history.length === 0 ? <div className="adm-card adm-empty">Nothing posted yet.</div> : null}
          {history.map((post) => (
            <article key={post.id} className="adm-card adm-stack">
              <div className="adm-actions" style={{ justifyContent: "space-between" }}>
                <span className={`adm-pill ${STATUS_PILL[post.status] ?? ""}`}>{post.status}</span>
                <span className="adm-muted adm-small">{formatDateTime(post.scheduled_at)}</span>
              </div>
              <p className="adm-small" style={{ whiteSpace: "pre-wrap" }}>
                {post.caption.length > 220 ? `${post.caption.slice(0, 220)}…` : post.caption || <i>(no caption)</i>}
              </p>
              <ul className="adm-stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {post.targets.map((target) => (
                  <li key={target.id} className="adm-small">
                    <span className={`adm-pill ${STATUS_PILL[target.status] ?? ""}`}>{PLATFORM_LABELS[target.platform]}</span>{" "}
                    {target.remote_url ? (
                      <a href={target.remote_url} target="_blank" rel="noreferrer">
                        View ↗
                      </a>
                    ) : null}
                    {target.error ? <span style={{ color: "var(--adm-red)" }}> {target.error}</span> : null}
                  </li>
                ))}
              </ul>
              <div className="adm-actions">
                {post.status === "scheduled" ? (
                  <form action={cancelSocialPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <ConfirmSubmit message="Cancel this scheduled post?" className="adm-btn adm-btn--danger adm-btn--sm">
                      Cancel
                    </ConfirmSubmit>
                  </form>
                ) : null}
                {post.status === "failed" || post.status === "partial" ? (
                  <form action={retrySocialPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
                      Retry failed
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
