import { currentUser } from "@/lib/server/auth";
import { mediaConfigured, signUpload } from "@/lib/server/media";

/**
 * Signs a direct browser → Cloudinary upload for a signed-in staff member.
 * `{ "purpose": "gallery" }` files the photo in the gallery's folder; anything
 * else goes to the portal's own folder (portraits, covers, social posts).
 */
export async function POST(request: Request) {
  if (!(await currentUser())) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!mediaConfigured()) {
    return Response.json({ error: "Cloudinary is not configured (Settings → Integrations)." }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as { purpose?: unknown } | null;
  return Response.json(signUpload(body?.purpose === "gallery" ? "gallery" : "media"));
}
