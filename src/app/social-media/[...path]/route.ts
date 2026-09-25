import { cloudinaryCloud } from "@/lib/server/media";

/**
 * Serves the school's Cloudinary media from this site's own domain. TikTok
 * only pulls photos from a domain verified in its developer portal, and
 * res.cloudinary.com cannot be verified — newlight-academy.rw can.
 * Only files in the school's own cloud are reachable.
 */
export async function GET(_request: Request, ctx: RouteContext<"/social-media/[...path]">) {
  const { path } = await ctx.params;
  const cloud = cloudinaryCloud();
  if (!cloud || path.some((part) => part === ".." || part === "")) return new Response("Not found", { status: 404 });
  const upstream = await fetch(`https://res.cloudinary.com/${cloud}/${path.map(encodeURIComponent).join("/")}`, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
