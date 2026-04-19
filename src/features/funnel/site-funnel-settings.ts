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

export type SiteFunnelSettings = {
  platos: SiteFunnelPlatosConfig;
};

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

export function normalizeSiteFunnelSettings(
  rows: Partial<Record<string, Json>>,
): SiteFunnelSettings {
  return {
    platos: normalizePlatosConfig(rows.platos),
  };
}
