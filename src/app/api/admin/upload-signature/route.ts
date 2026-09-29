import { currentUser } from "@/lib/server/auth";
import { mediaConfigured, signUpload } from "@/lib/server/media";

/** Signs a direct browser → Cloudinary upload for a signed-in staff member. */
export async function POST() {
  if (!(await currentUser())) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!mediaConfigured()) {
    return Response.json({ error: "Cloudinary is not configured (Settings → Integrations)." }, { status: 400 });
  }
  return Response.json(signUpload());
}
