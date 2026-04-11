export const PLANS = {
  free: {
    name: "Free",
    maxBooks: 3,
    maxSessionsPerMonth: 20,
    maxSessionDurationMinutes: 10,
  },
  pro: {
    name: "Pro",
    maxBooks: 50,
    maxSessionsPerMonth: 500,
    maxSessionDurationMinutes: 60,
  },
  unlimited: {
    name: "Unlimited",
    maxBooks: Infinity,
    maxSessionsPerMonth: Infinity,
    maxSessionDurationMinutes: 120,
  },
} as const;

export type PlanType = keyof typeof PLANS;
