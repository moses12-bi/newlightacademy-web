"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { uploadToCloudinary } from "@/lib/admin/upload";

type AddPhotos = (
  photos: { url: string; width: number; height: number; alt: string }[],
  atStart: boolean,
) => Promise<string | null>;

/**
 * Pick several photos at once; each goes straight to Cloudinary, then the batch
 * is added to the gallery in one Server Action.
 */
export default function GalleryUploader({ addPhotos }: { addPhotos: AddPhotos }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [atStart, setAtStart] = useState(true);

  const run = async (files: File[]) => {
    setBusy(true);
    setError("");
    const done: { url: string; width: number; height: number; alt: string }[] = [];
    const failed: string[] = [];
    for (const [index, file] of files.entries()) {
      try {
        const result = await uploadToCloudinary(file, (percent) =>
          setStatus(`Uploading ${index + 1} of ${files.length} — ${percent}%`),
        );
        if (result.type === "image") done.push({ url: result.url, width: result.width, height: result.height, alt: "" });
        else failed.push(`${file.name} (not a photo)`);
      } catch (uploadError) {
        failed.push(`${file.name}: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
      }
    }
    if (done.length) {
      setStatus("Adding to the gallery…");
      const problem = await addPhotos(done, atStart);
      if (problem) failed.push(problem);
    }
    setStatus(done.length ? `${done.length} photo${done.length === 1 ? "" : "s"} added. Add a description to each below.` : "");
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
        <label className="adm-check adm-small">
          <input type="checkbox" checked={atStart} onChange={(event) => setAtStart(event.target.checked)} /> Put new photos first
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
