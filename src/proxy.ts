import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COMING_SOON, PRE_LAUNCH_HIDDEN } from "@/lib/launch";

/**
 * Launch gates for the phased rollout.
 *
 * The store and the blog are both built and DB-backed, but neither ships in
 * this phase. Leaving the routes deployed but unlinked isn't enough — they
 * answer to anyone who types the URL, and /api/orders would write a real
 * StoreOrder we can't fulfil yet. So the gates live here, in front of the
 * routes themselves.
 *
 * To open one: set STORE_LIVE / BLOG_LIVE to "true" in the Vercel project env
 * and redeploy. When a section is live for good, drop its entry below, its
 * disallow line in robots.ts, and restore its link in site-footer.tsx.
 */
const GATES = [
  { live: process.env.STORE_LIVE === "true", paths: ["/store", "/api/orders"] },
  { live: process.env.BLOG_LIVE === "true", paths: ["/blog"] },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Before launch the splash at / stands in for the whole site, so the inner
  // pages go back to it rather than being reachable by typed URL.
  if (
    COMING_SOON &&
    PRE_LAUNCH_HIDDEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const blocked = GATES.some(
    (gate) =>
      !gate.live &&
      gate.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`)),
  );

  if (!blocked) return NextResponse.next();

  // The order API is the one path that writes. Answer it in kind — a browser
  // redirect here would hand fetch() an HTML body it can't parse.
  if (pathname.startsWith("/api/orders")) {
    return NextResponse.json({ error: "Not available yet." }, { status: 404 });
  }

  // Pages: send visitors to the site rather than a dead end.
  return NextResponse.redirect(new URL("/", request.url));
}

// Matcher values must be static constants — they're analysed at build time.
export const config = {
  matcher: [
    "/store",
    "/store/:path*",
    "/blog",
    "/blog/:path*",
    "/api/orders",
    "/api/orders/:path*",
    // Pre-launch only; inert once COMING_SOON is unset.
    "/about",
    "/services",
    "/products",
    "/gallery",
    "/gallery/:path*",
    "/podcast",
    "/podcast/:path*",
    "/contact",
  ],
};
