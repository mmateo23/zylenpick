import type { Json } from "@/types/database";

export type SiteFunnelPlatosConfig = {
  quickDecision: {
    enabled: boolean;
    title: string;
    itemIds: string[];
  };
  featuredFeed: {
    enabled: boolean;
    insertAfter: number;
    itemId: string | null;
    ctaLabel: string;
  };
};

export const PRICING_OFFER_KEYS = [
  "basic",
  "oro",
  "titanio",
  "professional_onboarding",
] as const;

export type PricingOfferKey = (typeof PRICING_OFFER_KEYS)[number];
export type StripePricingSyncStatus = "vinculado" | "sin_vincular";

export type SiteFunnelPricingOfferConfig = {
  enabled: boolean;
  originalPriceCents: number;
  discountedPriceCents: number;
  label: string;
  expiresAt: string;
  stripeCouponId: string;
  stripePromotionCodeId: string;
  stripeSyncStatus: StripePricingSyncStatus;
};

export type SiteFunnelPricingConfig = Record<
  PricingOfferKey,
  SiteFunnelPricingOfferConfig
>;

export type SiteFunnelSettings = {
  platos: SiteFunnelPlatosConfig;
  pricing: SiteFunnelPricingConfig;
};

const createDefaultPricingOffer = (
  originalPriceCents: number,
): SiteFunnelPricingOfferConfig => ({
  enabled: false,
  originalPriceCents,
  discountedPriceCents: originalPriceCents,
  label: "",
  expiresAt: "",
  stripeCouponId: "",
  stripePromotionCodeId: "",
  stripeSyncStatus: "sin_vincular",
});

export const defaultSiteFunnelSettings: SiteFunnelSettings = {
  platos: {
    quickDecision: {
      enabled: true,
      title: "Para decidir en segundos",
      itemIds: [],
    },
    featuredFeed: {
      enabled: true,
      insertAfter: 8,
      itemId: null,
      ctaLabel: "Añadir y recoger",
    },
  },
  pricing: {
    basic: createDefaultPricingOffer(900),
    oro: createDefaultPricingOffer(1900),
    titanio: createDefaultPricingOffer(3900),
    professional_onboarding: createDefaultPricingOffer(9900),
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizePlatosConfig(value: unknown): SiteFunnelPlatosConfig {
  const fallback = defaultSiteFunnelSettings.platos;

  if (!isPlainObject(value)) {
    return fallback;
  }

  const quickDecision = isPlainObject(value.quickDecision)
    ? value.quickDecision
    : {};
  const featuredFeed = isPlainObject(value.featuredFeed)
    ? value.featuredFeed
    : {};
  const insertAfter =
    typeof featuredFeed.insertAfter === "number" && featuredFeed.insertAfter >= 1
      ? Math.floor(featuredFeed.insertAfter)
      : fallback.featuredFeed.insertAfter;

  return {
    quickDecision: {
      enabled:
        typeof quickDecision.enabled === "boolean"
          ? quickDecision.enabled
          : fallback.quickDecision.enabled,
      title:
        typeof quickDecision.title === "string" && quickDecision.title.trim()
          ? quickDecision.title.trim()
          : fallback.quickDecision.title,
      itemIds: normalizeStringArray(quickDecision.itemIds),
    },
    featuredFeed: {
      enabled:
        typeof featuredFeed.enabled === "boolean"
          ? featuredFeed.enabled
          : fallback.featuredFeed.enabled,
      insertAfter,
      itemId:
        typeof featuredFeed.itemId === "string" && featuredFeed.itemId.trim()
          ? featuredFeed.itemId.trim()
          : null,
      ctaLabel:
        typeof featuredFeed.ctaLabel === "string" && featuredFeed.ctaLabel.trim()
          ? featuredFeed.ctaLabel.trim()
          : fallback.featuredFeed.ctaLabel,
    },
  };
}

function normalizePriceCents(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : fallback;
}

function normalizePricingOffer(
  value: unknown,
  fallback: SiteFunnelPricingOfferConfig,
): SiteFunnelPricingOfferConfig {
  const offer = isPlainObject(value) ? value : {};
  const stripeCouponId =
    typeof offer.stripeCouponId === "string" ? offer.stripeCouponId.trim() : "";

  return {
    enabled: offer.enabled === true && Boolean(stripeCouponId),
    originalPriceCents: normalizePriceCents(
      offer.originalPriceCents,
      fallback.originalPriceCents,
    ),
    discountedPriceCents: normalizePriceCents(
      offer.discountedPriceCents,
      fallback.discountedPriceCents,
    ),
    label: typeof offer.label === "string" ? offer.label.trim() : "",
    expiresAt:
      typeof offer.expiresAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(offer.expiresAt)
        ? offer.expiresAt
        : "",
    stripeCouponId,
    stripePromotionCodeId:
      typeof offer.stripePromotionCodeId === "string"
        ? offer.stripePromotionCodeId.trim()
        : "",
    stripeSyncStatus: stripeCouponId ? "vinculado" : "sin_vincular",
  };
}

function normalizePricingConfig(value: unknown): SiteFunnelPricingConfig {
  const pricing = isPlainObject(value) ? value : {};
  const fallback = defaultSiteFunnelSettings.pricing;

  return {
    basic: normalizePricingOffer(pricing.basic, fallback.basic),
    oro: normalizePricingOffer(pricing.oro, fallback.oro),
    titanio: normalizePricingOffer(pricing.titanio, fallback.titanio),
    professional_onboarding: normalizePricingOffer(
      pricing.professional_onboarding,
      fallback.professional_onboarding,
    ),
  };
}

export function isLaunchPriceActive(
  offer: SiteFunnelPricingOfferConfig,
  now = new Date(),
) {
  if (!offer.enabled || !offer.stripeCouponId) {
    return false;
  }

  if (!offer.expiresAt) {
    return true;
  }

  const madridDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return madridDate <= offer.expiresAt;
}

export function normalizeSiteFunnelSettings(
  rows: Partial<Record<string, Json>>,
): SiteFunnelSettings {
  return {
    platos: normalizePlatosConfig(rows.platos),
    pricing: normalizePricingConfig(rows.pricing),
  };
}
