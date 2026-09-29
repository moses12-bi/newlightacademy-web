import { currentUser } from "@/lib/server/auth";
import { getAttachment, readAttachment } from "@/lib/server/files";

/** Downloads an application file. Staff only; files are never on a public URL. */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/files/[id]">) {
  if (!(await currentUser())) return new Response("Not signed in", { status: 401 });
  const { id } = await ctx.params;
  const row = getAttachment(Number(id));
  if (!row) return new Response("Not found", { status: 404 });
  let bytes: Buffer;
  try {
    bytes = readAttachment(row);
  } catch {
    return new Response("The file is missing from the server.", { status: 404 });
  }
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.mime,
      "Content-Disposition": `attachment; filename="${row.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
