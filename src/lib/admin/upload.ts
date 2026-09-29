/**
 * Browser-side upload to Cloudinary with a signature from
 * `/api/admin/upload-signature`. The file goes straight to Cloudinary, so large
 * videos never pass through this server.
 */
export interface UploadResult {
  url: string;
  type: "image" | "video";
  width: number;
  height: number;
}

export async function uploadToCloudinary(file: File, onProgress?: (percent: number) => void): Promise<UploadResult> {
  const signResponse = await fetch("/api/admin/upload-signature", { method: "POST" });
  const sign = await signResponse.json();
  if (!signResponse.ok) throw new Error(sign.error ?? "Could not start the upload.");

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", sign.apiKey);
  body.set("timestamp", String(sign.timestamp));
  body.set("folder", sign.folder);
  body.set("signature", sign.signature);

  /* XHR rather than fetch, for upload progress on large files. */
  const result = await new Promise<{ secure_url: string; resource_type: string; width?: number; height?: number }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
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

  return {
    url: result.secure_url,
    type: result.resource_type === "video" ? "video" : "image",
    width: result.width ?? 0,
    height: result.height ?? 0,
  };
}
