"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";

import { uploadToCloudinary } from "@/lib/admin/upload";

export interface MediaValue {
  url: string;
  type: "none" | "image" | "video";
  width: number;
  height: number;
}

/**
 * Uploads a photo or video straight from the browser to Cloudinary (see
 * `lib/admin/upload.ts`), then exposes the result to the surrounding form as
 * hidden inputs: `<name>_url`, `<name>_type`,
 * `<name>_width`, `<name>_height` — and, with `focus`, `<name>_focus`: the point
 * of the photo that must stay in view when the website crops it (clicked on the
 * preview, stored as a CSS object-position such as "50% 20%").
 */
export default function MediaField({
  name,
  label,
  accept = "image/*,video/*",
  initial,
  onChange,
  hint,
  focus,
  cropAspect = "5 / 3",
}: {
  name: string;
  label: string;
  accept?: string;
  initial?: MediaValue;
  onChange?: (value: MediaValue) => void;
  hint?: string;
  /** Enables the focal-point picker; the value is the saved focus ("" = automatic). */
  focus?: string;
  /** Shape of the crop preview shown with the focal-point picker. */
  cropAspect?: string;
}) {
  const [focusPoint, setFocusPoint] = useState(focus ?? "");
  const [value, setValue] = useState<MediaValue>(initial ?? { url: "", type: "none", width: 0, height: 0 });
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  /* Automatic framing: portrait photos from near the top, others from the middle. */
  const effectiveFocus = focusPoint || (value.height > value.width ? "50% 20%" : "50% 50%");

  const pickFocus = (event: MouseEvent<HTMLImageElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - box.left) / box.width) * 100);
    const y = Math.round(((event.clientY - box.top) / box.height) * 100);
    setFocusPoint(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  };

  const update = (next: MediaValue) => {
    setFocusPoint("");
    setValue(next);
    onChange?.(next);
  };

  const upload = async (file: File) => {
    setError("");
    setProgress(0);
    try {
      update(await uploadToCloudinary(file, setProgress));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : String(uploadError));
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="adm-field">
      <span>{label}</span>
      <div className="adm-media">
        {value.url ? (
          value.type === "video" ? (
            <video src={value.url} controls preload="metadata" />
          ) : (
            focus !== undefined ? (
              <div className="adm-focus">
                <div className="adm-focus__pick">
                  {/* eslint-disable-next-line @next/next/no-img-element -- click-to-pick is a pointer convenience; framing also works automatically */}
                  <img src={value.url} alt="" onClick={pickFocus} title="Click the part of the photo that must stay visible" />
                  <span
                    className="adm-focus__dot"
                    style={{ left: effectiveFocus.split(" ")[0], top: effectiveFocus.split(" ")[1] }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <small className="adm-hint">How the blog card shows it</small>
                  <div className="adm-focus__crop" style={{ aspectRatio: cropAspect }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- crop preview */}
                    <img src={value.url} alt="" style={{ objectPosition: effectiveFocus }} />
                  </div>
                  <small className="adm-hint">
                    Click the photo on the left on the part that must stay visible — a face, for example.
                    {focusPoint ? (
                      <>
                        {" "}
                        <button type="button" className="adm-linkbtn" onClick={() => setFocusPoint("")}>
                          Reset to automatic
                        </button>
                      </>
                    ) : null}
                  </small>
                </div>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- a preview of an arbitrary upload
              <img src={value.url} alt="" />
            )
          )
        ) : null}
        {progress !== null ? (
          <div className="adm-progress" aria-label={`Uploading ${progress}%`}>
            <div style={{ width: `${progress}%` }} />
          </div>
        ) : null}
        <div className="adm-actions">
          <label className="adm-btn adm-btn--ghost adm-btn--sm">
            {value.url ? "Replace" : "Upload"}
            <input
              ref={input}
              type="file"
              accept={accept}
              className="sr-only"
              disabled={progress !== null}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
          {value.url ? (
            <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => update({ url: "", type: "none", width: 0, height: 0 })}>
              Remove
            </button>
          ) : null}
          {progress !== null ? <span className="adm-small adm-muted">Uploading… {progress}%</span> : null}
        </div>
        {!value.url && focus !== undefined ? (
          <small className="adm-hint">No photo — press Save to keep it that way. The website shows the school crest in its place.</small>
        ) : null}
        {error ? <p className="adm-flash adm-flash--error">{error}</p> : null}
        {hint ? <small className="adm-hint">{hint}</small> : null}
      </div>
      <input type="hidden" name={`${name}_url`} value={value.url} />
      <input type="hidden" name={`${name}_type`} value={value.type} />
      <input type="hidden" name={`${name}_width`} value={value.width || ""} />
      <input type="hidden" name={`${name}_height`} value={value.height || ""} />
      {focus !== undefined ? <input type="hidden" name={`${name}_focus`} value={value.url ? focusPoint : ""} /> : null}
    </div>
  );
}
