declare global {
  interface Window {
    rewardful?: (...args: any[]) => void;
    Rewardful?: {
      referral: string | null;
      affiliate?: Record<string, any>;
    };
  }
}

export const getRewardfulReferral = (): string | null =>
  typeof window !== "undefined" ? window.Rewardful?.referral ?? null : null;
