"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { uploadToCloudinary } from "@/lib/admin/upload";

/**
 * Pick several photos at once; each goes straight to Cloudinary, into the
 * gallery's folder. The gallery follows the library, so there is nothing to
 * add afterwards: one Server Action just refreshes the site so the new photos
 * show straight away (first, as the newest uploads).
 */
export default function GalleryUploader({ uploaded }: { uploaded: (count: number) => Promise<void> }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (files: File[]) => {
    setBusy(true);
    setError("");
    let added = 0;
    const failed: string[] = [];
    for (const [index, file] of files.entries()) {
      try {
        const result = await uploadToCloudinary(
          file,
          (percent) => setStatus(`Uploading ${index + 1} of ${files.length} — ${percent}%`),
          "gallery",
        );
        if (result.type === "image") added += 1;
        else failed.push(`${file.name} (not a photo)`);
      } catch (uploadError) {
        failed.push(`${file.name}: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
      }
    }
    if (added) await uploaded(added);
    setStatus(added ? `${added} photo${added === 1 ? "" : "s"} added. Add a description to each below.` : "");
    setError(failed.join(" · "));
    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  };

  return (
    <div className="adm-media">
      <div className="adm-actions">
        <label className="adm-btn">
          {busy ? "Uploading…" : "Upload photos"}
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length) void run(files);
            }}
          />
        </label>
      </div>
      {status ? (
        <p className="adm-small" role="status">
          {status}
        </p>
      ) : null}
      {error ? <p className="adm-flash adm-flash--error">{error}</p> : null}
    </div>
  );
}
