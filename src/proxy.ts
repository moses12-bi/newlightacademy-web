import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * A fast bounce to the sign-in page for portal URLs requested without a
 * session cookie. It only checks that the cookie exists — every portal page and
 * action verifies the session itself (`requireUser`).
 */
const PUBLIC = [/^\/admin\/login$/, /^\/admin\/forgot$/, /^\/admin\/reset\/[^/]+$/, /^\/admin\/invite\/[^/]+$/];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  /* Reached without an account: sign-in, forgotten password, and the links in
     invitation and reset emails. */
  if (PUBLIC.some((pattern) => pattern.test(pathname))) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    /* The token in the URL must not leak to other sites through the Referer
       header. `same-origin`, not `no-referrer`: the latter also blanks the
       Origin of this site's own form posts, and Server Actions then refuse them. */
    response.headers.set("Referrer-Policy", "same-origin");
    return response;
  }
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
