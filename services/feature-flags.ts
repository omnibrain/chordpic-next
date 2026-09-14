/**
 * Ad serving is controlled by one global mode plus a stable per-visitor bucket.
 *
 * The mode lives in NEXT_PUBLIC_ADS_MODE, so changing it needs a redeploy. Moving
 * it to Vercel Edge Config later means rewriting readAdsMode() in proxy.ts
 * and nothing else: the cookie contract below is what the client reads, and it
 * stays the same either way.
 *
 * This module runs in the browser as well as on the server, so it must stay
 * free of DOM and Node APIs.
 */

/** Stable randomisation unit, reused by any future split. */
export const BUCKET_COOKIE = "cp_bucket";

/** The resolved decision for this visitor, recomputed on every request. */
export const ADS_COOKIE = "cp_ads";

export const BUCKET_COUNT = 100;

/** Buckets 0..n-1 keep seeing ads while the split is running. */
export const ADS_ON_BUCKETS = 50;

export type AdsMode = "on" | "off" | "split";
export type AdsArm = "on" | "off";

/** Anything unrecognised falls back to "on" — never silently stop earning. */
export function parseAdsMode(raw: string | undefined): AdsMode {
  return raw === "off" || raw === "split" ? raw : "on";
}

export function parseBucket(raw: string | undefined): number | null {
  if (!raw) {
    return null;
  }

  const bucket = Number(raw);

  return Number.isInteger(bucket) && bucket >= 0 && bucket < BUCKET_COUNT
    ? bucket
    : null;
}

export function parseAdsArm(raw: string | undefined): AdsArm | null {
  return raw === "on" || raw === "off" ? raw : null;
}

export function randomBucket(): number {
  return Math.floor(Math.random() * BUCKET_COUNT);
}

/**
 * Stamped onto anything a visitor buys, so a paid conversion can be traced back
 * to the arm without a join through GA4 — which has no key for it.
 *
 * The arm is read rather than recomputed on purpose: it is derived per request
 * from the current mode, so this records what the buyer actually saw, not what
 * the mode happens to say when the number is read back. The bucket rides along
 * because it is the stable unit and survives a lost `cp_ads`.
 */
export function adsAssignmentMetadata(
  cookies: Record<string, string | undefined>,
): Record<string, string> {
  const arm = parseAdsArm(cookies[ADS_COOKIE]);
  const bucket = parseBucket(cookies[BUCKET_COOKIE]);

  return {
    ...(arm === null ? {} : { adsArm: arm }),
    ...(bucket === null ? {} : { adsBucket: String(bucket) }),
  };
}

export function resolveAdsArm(mode: AdsMode, bucket: number): AdsArm {
  switch (mode) {
    case "off":
      return "off";
    case "split":
      return bucket < ADS_ON_BUCKETS ? "on" : "off";
    case "on":
    default:
      return "on";
  }
}
