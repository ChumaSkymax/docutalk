"use client";
import { useAuth } from "@clerk/nextjs";
import {
  PLANS,
  PLAN_LIMITS,
  type PlanLimits,
  type PlanType,
} from "@/lib/subscription-constants";
export function useSubscription(): {
  plan: PlanType | null;
  limits: PlanLimits | null;
  isLoaded: boolean;
} {
  const auth = useAuth();
  if (!auth.isLoaded) {
    return { plan: null, limits: null, isLoaded: false };
  }
  if (!auth.isSignedIn) {
    return {
      plan: PLANS.FREE,
      limits: PLAN_LIMITS[PLANS.FREE],
      isLoaded: true,
    };
  }
  let plan: PlanType = PLANS.FREE;
  if (auth.has({ plan: "pro" })) plan = PLANS.PRO;
  else if (auth.has({ plan: "standard" })) plan = PLANS.STANDARD;
  return { plan, limits: PLAN_LIMITS[plan], isLoaded: true };
}
export default useSubscription;
