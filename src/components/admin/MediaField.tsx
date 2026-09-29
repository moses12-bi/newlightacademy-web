"use client";

import { useRef, useState } from "react";

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
 * `<name>_width`, `<name>_height`.
 */
export default function MediaField({
  name,
  label,
  accept = "image/*,video/*",
  initial,
  onChange,
  hint,
}: {
  name: string;
  label: string;
  accept?: string;
  initial?: MediaValue;
  onChange?: (value: MediaValue) => void;
  hint?: string;
}) {
  const [value, setValue] = useState<MediaValue>(initial ?? { url: "", type: "none", width: 0, height: 0 });
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const update = (next: MediaValue) => {
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
            // eslint-disable-next-line @next/next/no-img-element -- a preview of an arbitrary upload
            <img src={value.url} alt="" />
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
        </div>
        {error ? <p className="adm-flash adm-flash--error">{error}</p> : null}
        {hint ? <small className="adm-hint">{hint}</small> : null}
      </div>
      <input type="hidden" name={`${name}_url`} value={value.url} />
      <input type="hidden" name={`${name}_type`} value={value.type} />
      <input type="hidden" name={`${name}_width`} value={value.width || ""} />
      <input type="hidden" name={`${name}_height`} value={value.height || ""} />
    </div>
  );
}
