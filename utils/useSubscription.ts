import { SubscriptionType } from "../types";
import { useUser } from "./useUser";

export function useSubscription(): SubscriptionType | null {
  const { subscription, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (subscription?.prices?.products?.name === "Chordpic Pro") {
    return SubscriptionType.PRO;
  }

  return SubscriptionType.FREE;
}
