import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * A fast bounce to the sign-in page for portal URLs requested without a
 * session cookie. It only checks that the cookie exists — every portal page and
 * action verifies the session itself (`requireUser`).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.has("nla_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  const response = NextResponse.next();
  /* The portal is never for search engines. */
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
