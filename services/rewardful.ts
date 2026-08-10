declare global {
  interface Window {
    rewardful?: (...args: any[]) => void;
    Rewardful?: {
      referral: string | null;
      coupon?: string | null;
      affiliate?: Record<string, any>;
    };
  }
}

export const getRewardfulReferral = (): string | null =>
  typeof window !== "undefined" ? window.Rewardful?.referral ?? null : null;

// Empty when the visitor isn't a referral or the campaign has no
// double-sided coupon configured.
export const getRewardfulCoupon = (): string | null =>
  typeof window !== "undefined" ? window.Rewardful?.coupon ?? null : null;
