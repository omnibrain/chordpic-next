import { NextResponse, type NextRequest } from "next/server";
import {
  ADS_COOKIE,
  BUCKET_COOKIE,
  parseAdsMode,
  parseBucket,
  randomBucket,
  resolveAdsArm,
} from "./services/feature-flags";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * The single seam between "which mode are we in" and everything else. Swap the
 * body for an Edge Config lookup to flip ads without redeploying; nothing
 * downstream needs to change.
 */
function readAdsMode() {
  return parseAdsMode(process.env.NEXT_PUBLIC_ADS_MODE);
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set-Cookie from the server, never document.cookie: Safari's ITP caps
  // script-written cookies at seven days, which would re-randomise visitors
  // mid-experiment and pull any real effect towards zero.
  const existingBucket = parseBucket(request.cookies.get(BUCKET_COOKIE)?.value);
  const bucket = existingBucket ?? randomBucket();

  if (existingBucket === null) {
    response.cookies.set(BUCKET_COOKIE, String(bucket), {
      maxAge: ONE_YEAR,
      path: "/",
      sameSite: "lax",
    });
  }

  // Derived fresh every request rather than persisted, so flipping the mode
  // takes effect immediately instead of waiting out a year-old cookie.
  response.cookies.set(ADS_COOKIE, resolveAdsArm(readAdsMode(), bucket), {
    maxAge: ONE_YEAR,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  // Pages only. API routes, Next internals and anything with a file extension
  // are left alone.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
