import { SubscriptionType } from "../types";
import { useUser } from "./useUser";

export function useSubscription(): SubscriptionType {
  const { subscription } = useUser();

  if (subscription?.prices?.products?.name === "Chordpic Pro") {
    return SubscriptionType.PRO;
  }

  return SubscriptionType.FREE;
}
