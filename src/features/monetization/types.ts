export type VenueMonetizationPlan = "free" | "basic" | "oro" | "titanio";

export type VenueBillingCycle = "monthly" | "annual";

export type VenueMonetizationPrivileges = {
  quickDecision: boolean;
  featuredFeed: boolean;
  promotionalChips: boolean;
};

export type VenueMonetizationSettings = {
  id: string;
  venueId: string;
  isPaying: boolean;
  plan: VenueMonetizationPlan;
  billingCycle: VenueBillingCycle | null;
  privileges: VenueMonetizationPrivileges;
  startsAt: string | null;
  endsAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VenueMonetizationUsage = {
  venueId: string;
  venueName: string;
  quickDecisionItems: Array<{
    itemId: string;
    itemName: string;
  }>;
  featuredFeedItem: {
    itemId: string;
    itemName: string;
  } | null;
  activeChips: Array<{
    chipId: string;
    chipName: string;
    chipType: "editorial" | "promocional" | "temporal";
    isPaid: boolean;
  }>;
  ordersCount: number;
};

export type VenueMonetizationWarning = {
  code:
    | "non_paying_with_privileges"
    | "free_with_commercial_privileges"
    | "quick_decision_without_privilege"
    | "featured_without_privilege"
    | "promotional_chip_without_privilege"
    | "paid_chip_without_paying_venue"
    | "ended_subscription"
    | "paying_without_billing_cycle"
    | "paying_without_start_date"
    | "high_plan_without_visibility"
    | "visibility_without_aligned_plan";
  message: string;
};

export const monetizationPlans: VenueMonetizationPlan[] = [
  "free",
  "basic",
  "oro",
  "titanio",
];

export const billingCycles: VenueBillingCycle[] = ["monthly", "annual"];

export const defaultVenueMonetizationPrivileges: VenueMonetizationPrivileges = {
  quickDecision: false,
  featuredFeed: false,
  promotionalChips: false,
};
