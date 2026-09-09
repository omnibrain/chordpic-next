/**
 * Ad serving is controlled by one global mode plus a stable per-visitor bucket.
 *
 * The mode lives in NEXT_PUBLIC_ADS_MODE, so changing it needs a redeploy. Moving
 * it to Vercel Edge Config later means rewriting readAdsMode() in middleware.ts
 * and nothing else: the cookie contract below is what the client reads, and it
 * stays the same either way.
 *
 * This module runs in the edge runtime as well as the browser, so it must stay
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

export function randomBucket(): number {
  return Math.floor(Math.random() * BUCKET_COUNT);
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
