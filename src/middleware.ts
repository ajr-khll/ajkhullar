import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Serve the scribe project page from the scribe.* subdomain.
 *
 * scribe.ajkhullar.com/  -> rewrites to /scribe  (URL stays on the subdomain)
 * ajkhullar.com/scribe   -> still works directly, unchanged
 *
 * Point the DNS + Vercel domain at this project and the same deploy serves both.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0];

  if (host.startsWith("scribe.")) {
    const url = req.nextUrl.clone();
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/scribe";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Skip Next internals and static files; only real page routes hit the rewrite.
export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
