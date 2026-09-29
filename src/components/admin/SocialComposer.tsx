"use client";

import { useState } from "react";

import ActionForm, { type FormAction } from "@/components/admin/ActionForm";
import MediaField, { type MediaValue } from "@/components/admin/MediaField";

type Platform = "facebook" | "instagram" | "youtube" | "tiktok";

export interface ComposerPlatform {
  id: Platform;
  label: string;
  connected: boolean;
  accepts: ("none" | "image" | "video")[];
  captionLimit: number;
}

export interface ComposerDraft {
  caption: string;
  title: string;
  link: string;
  media?: MediaValue;
}

function acceptsText(accepts: ComposerPlatform["accepts"]): string {
  const media = accepts.filter((type) => type !== "none");
  if (accepts.includes("none")) return "Text, photo or video";
  return media.length === 2 ? "Photo or video" : "Video only";
}

export default function SocialComposer({
  action,
  platforms,
  draft,
}: {
  action: FormAction;
  platforms: ComposerPlatform[];
  draft: ComposerDraft;
}) {
  const [caption, setCaption] = useState(draft.caption);
  const [media, setMedia] = useState<MediaValue>(draft.media ?? { url: "", type: "none", width: 0, height: 0 });
  const [selected, setSelected] = useState<Set<Platform>>(new Set());
  const [when, setWhen] = useState<"now" | "later">("now");

  const chosen = platforms.filter((platform) => selected.has(platform.id));
  const limit = chosen.length ? Math.min(...chosen.map((platform) => platform.captionLimit)) : 2200;
  const needsTitle = selected.has("youtube");
  const mismatched = chosen.filter((platform) => !platform.accepts.includes(media.type));

  const toggle = (id: Platform, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <ActionForm action={action} submitLabel={when === "later" ? "Schedule" : "Publish now"} pendingLabel="Sending…">
      <fieldset className="adm-field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="adm-label" style={{ marginBottom: 6 }}>
          Post to
        </legend>
        <div className="adm-platforms">
          {platforms.map((platform) => (
            <label key={platform.id} className="adm-platform">
              <input
                type="checkbox"
                name={`platform_${platform.id}`}
                disabled={!platform.connected}
                checked={selected.has(platform.id)}
                onChange={(event) => toggle(platform.id, event.target.checked)}
              />
              <span>
                <b>{platform.label}</b>
                <small>{platform.connected ? acceptsText(platform.accepts) : "Not connected"}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <MediaField
        name="media"
        label="Photo or video"
        initial={draft.media}
        onChange={setMedia}
        hint="Instagram and TikTok need a photo or video; YouTube needs a video. Vertical 9:16 video suits Reels, TikTok and Shorts."
      />
      {mismatched.length ? (
        <p className="adm-flash adm-flash--warn">
          {mismatched.map((platform) => platform.label).join(", ")} {mismatched.length === 1 ? "needs" : "need"}{" "}
          {media.type === "none" ? "a photo or video" : media.type === "image" ? "a video, not a photo" : "a photo, not a video"}.
        </p>
      ) : null}

      {needsTitle ? (
        <label className="adm-field">
          <span>YouTube title</span>
          <input type="text" name="title" defaultValue={draft.title} maxLength={100} required />
        </label>
      ) : (
        <input type="hidden" name="title" value={draft.title} />
      )}

      <label className="adm-field">
        <span>Caption</span>
        <textarea name="caption" rows={6} value={caption} onChange={(event) => setCaption(event.target.value)} />
        <span className={`adm-counter${caption.length > limit ? " is-over" : ""}`}>
          {caption.length} / {limit}
        </span>
      </label>

      <label className="adm-field">
        <span>Link (optional)</span>
        <input type="url" name="link" defaultValue={draft.link} placeholder="https://newlight-academy.rw/blog/…" />
        <small>Facebook shows a link preview. Other networks get the address added to the caption.</small>
      </label>

      <fieldset className="adm-field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="adm-label" style={{ marginBottom: 6 }}>
          When
        </legend>
        <div className="adm-actions">
          <label className="adm-check">
            <input type="radio" name="when" value="now" checked={when === "now"} onChange={() => setWhen("now")} /> Now
          </label>
          <label className="adm-check">
            <input type="radio" name="when" value="later" checked={when === "later"} onChange={() => setWhen("later")} /> Later
          </label>
          {when === "later" ? (
            <input type="datetime-local" name="scheduled_at" aria-label="Date and time (Kigali time)" style={{ maxWidth: 240 }} />
          ) : null}
        </div>
        {when === "later" ? <small className="adm-hint">Kigali time.</small> : null}
      </fieldset>
    </ActionForm>
  );
}
