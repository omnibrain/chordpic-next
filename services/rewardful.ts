declare global {
  interface Window {
    rewardful?: (...args: any[]) => void;
    Rewardful?: {
      referral: string | null;
      // Rewardful exposes the full coupon record here, not just its id.
      coupon?: { id: string; [key: string]: any } | null;
      affiliate?: Record<string, any>;
    };
  }
}

export const getRewardfulReferral = (): string | null =>
  typeof window !== "undefined" ? window.Rewardful?.referral ?? null : null;

// Empty when the visitor isn't a referral or the campaign has no
// double-sided coupon configured. Stripe's coupon APIs take the coupon id,
// not the full Rewardful coupon record.
export const getRewardfulCoupon = (): string | null =>
  typeof window !== "undefined" ? window.Rewardful?.coupon?.id ?? null : null;

// Rewardful's rw.js only auto-tracks the referral token from the `?via=`
// query string. Our affiliate links use a `#via=` hash fragment instead (the
// site uses hash-based routing), so rw.js never sees it. We forward the
// token manually via Rewardful's documented `rewardful('source', token)` API
// -- which stores it the same way a query-string referral would, so it
// survives navigation (e.g. to /signin and back) -- then strip the hash from
// the address bar since the app doesn't need it there anymore.
export const applyHashReferral = (): void => {
  if (typeof window === "undefined") return;

  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const via = new URLSearchParams(hash).get("via");
  if (!via) return;

  window.rewardful?.("source", via);
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
};
