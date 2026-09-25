"use client";

import { useRef, useState } from "react";

export interface MediaValue {
  url: string;
  type: "none" | "image" | "video";
  width: number;
  height: number;
}

/**
 * Uploads a photo or video straight from the browser to Cloudinary using a
 * signature from `/api/admin/upload-signature`, then exposes the result to the
 * surrounding form as hidden inputs: `<name>_url`, `<name>_type`,
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
      const signResponse = await fetch("/api/admin/upload-signature", { method: "POST" });
      const sign = await signResponse.json();
      if (!signResponse.ok) throw new Error(sign.error ?? "Could not start the upload.");

      const body = new FormData();
      body.set("file", file);
      body.set("api_key", sign.apiKey);
      body.set("timestamp", String(sign.timestamp));
      body.set("folder", sign.folder);
      body.set("signature", sign.signature);

      /* XHR rather than fetch, for upload progress on large videos. */
      const result = await new Promise<{ secure_url: string; resource_type: string; width?: number; height?: number }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
          };
          xhr.onload = () => {
            const data = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300) resolve(data);
            else reject(new Error(data.error?.message ?? `Upload failed (${xhr.status})`));
          };
          xhr.onerror = () => reject(new Error("Network error during upload."));
          xhr.send(body);
        },
      );

      update({
        url: result.secure_url,
        type: result.resource_type === "video" ? "video" : "image",
        width: result.width ?? 0,
        height: result.height ?? 0,
      });
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
