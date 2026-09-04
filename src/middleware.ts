import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LIFT_HOST = "lift.ajkhullar.com";

/**
 * Serve project pages from their own subdomains.
 *
 * scribe.ajkhullar.com/  -> rewrites to /scribe  (URL stays on the subdomain)
 * lift.ajkhullar.com/    -> rewrites to /lift-internal (+ apple-app-site-association)
 * ajkhullar.com/scribe   -> still works directly, unchanged
 *
 * Point the DNS + Vercel domain at this project and the same deploy serves all of them.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const { pathname } = req.nextUrl;

  // /lift-internal is an implementation detail of the lift.* rewrite below;
  // never let it be reached directly, on any host.
  if (pathname.startsWith("/lift-internal")) {
    return new NextResponse(null, { status: 404 });
  }

  if (host === LIFT_HOST) {
    const url = req.nextUrl.clone();

    if (
      pathname === "/.well-known/apple-app-site-association" ||
      pathname === "/apple-app-site-association"
    ) {
      url.pathname = "/lift-internal/apple-app-site-association";
      return NextResponse.rewrite(url);
    }

    if (
      pathname === "/" ||
      /^\/p\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/?$/i.test(
        pathname,
      )
    ) {
      url.pathname = "/lift-internal";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  if (host.startsWith("scribe.")) {
    const url = req.nextUrl.clone();
    if (pathname === "/" || pathname === "") {
      url.pathname = "/scribe";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Skip Next internals and static files. Broader than a plain "no dot in
// pathname" exclusion so that /.well-known/apple-app-site-association
// (which contains a dot) still hits the lift rewrite above.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
