import { revalidatePath } from "next/cache";

import {
  createAdminDataClient,
  createAdminMutationClient,
} from "@/features/admin/services/admin-auth";
import {
  defaultSiteFunnelSettings,
  normalizeSiteFunnelSettings,
  PRICING_OFFER_KEYS,
  type PricingOfferKey,
  type SiteFunnelPlatosConfig,
  type SiteFunnelPricingConfig,
  type SiteFunnelPricingOfferConfig,
  type SiteFunnelSettings,
} from "@/features/funnel/site-funnel-settings";
import type { Json } from "@/types/database";

const FUNNEL_SETTING_KEYS = ["platos", "pricing"] as const;

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getSelectedStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function getPriceCents(formData: FormData, key: string, fallback: number) {
  const value = getString(formData, key).replace(",", ".");
  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0
    ? Math.round(amount * 100)
    : fallback;
}

function getDate(formData: FormData, key: string) {
  const value = getString(formData, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function revalidateFunnelPaths() {
  revalidatePath("/platos");
  revalidatePath("/unete");
  revalidatePath("/panel/funnel");
}

async function upsertFunnelSetting(
  key: (typeof FUNNEL_SETTING_KEYS)[number],
  value: Json,
) {
  const supabase = await createAdminMutationClient();
  const { error } = await supabase.from("site_funnel_settings").upsert(
    {
      key,
      value,
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(`Unable to update funnel setting ${key}: ${error.message}`);
  }

  revalidateFunnelPaths();
}

export type FunnelDishOption = {
  id: string;
  name: string;
  venueName: string;
  cityName: string;
};

export async function getAdminSiteFunnelSettings(): Promise<SiteFunnelSettings> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("site_funnel_settings")
    .select("key, value")
    .in("key", [...FUNNEL_SETTING_KEYS]);

  if (error) {
    return defaultSiteFunnelSettings;
  }

  const rows = data.reduce<Partial<Record<string, Json>>>((map, row) => {
    map[row.key] = row.value;
    return map;
  }, {});

  return normalizeSiteFunnelSettings(rows);
}

export async function getFunnelDishOptions(): Promise<FunnelDishOption[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, name, image_url, is_available, venues!inner(name, is_active, is_published, cities!inner(name))",
    )
    .eq("is_available", true)
    .eq("venues.is_active", true)
    .eq("venues.is_published", true)
    .not("image_url", "is", null)
    .order("name", { ascending: true })
    .limit(120);

  if (error) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    venueName: item.venues.name,
    cityName: item.venues.cities.name,
  }));
}

export async function updateFunnelPlatosAction(formData: FormData) {
  "use server";

  const insertAfter = Number(getString(formData, "featuredFeed.insertAfter"));
  const platos: SiteFunnelPlatosConfig = {
    quickDecision: {
      enabled: getBoolean(formData, "quickDecision.enabled"),
      title:
        getString(formData, "quickDecision.title") ||
        defaultSiteFunnelSettings.platos.quickDecision.title,
      itemIds: getSelectedStrings(formData, "quickDecision.itemIds"),
    },
    featuredFeed: {
      enabled: getBoolean(formData, "featuredFeed.enabled"),
      insertAfter: Number.isFinite(insertAfter)
        ? Math.max(1, Math.floor(insertAfter))
        : defaultSiteFunnelSettings.platos.featuredFeed.insertAfter,
      itemId: getString(formData, "featuredFeed.itemId") || null,
      ctaLabel:
        getString(formData, "featuredFeed.ctaLabel") ||
        defaultSiteFunnelSettings.platos.featuredFeed.ctaLabel,
    },
  };

  await upsertFunnelSetting("platos", platos as unknown as Json);
}

function getPricingOffer(
  formData: FormData,
  key: PricingOfferKey,
): SiteFunnelPricingOfferConfig {
  const fallback = defaultSiteFunnelSettings.pricing[key];
  const prefix = `pricing.${key}`;
  const stripeCouponId = getString(formData, `${prefix}.stripeCouponId`);
  const originalPriceCents = getPriceCents(
    formData,
    `${prefix}.originalPrice`,
    fallback.originalPriceCents,
  );
  const discountedPriceCents = getPriceCents(
    formData,
    `${prefix}.discountedPrice`,
    fallback.discountedPriceCents,
  );
  const enabled = getBoolean(formData, `${prefix}.enabled`) && Boolean(stripeCouponId);

  if (
    enabled &&
    (discountedPriceCents <= 0 || discountedPriceCents >= originalPriceCents)
  ) {
    throw new Error(
      `El precio de lanzamiento de ${key} debe ser mayor que cero y menor que el precio original.`,
    );
  }

  return {
    enabled,
    originalPriceCents,
    discountedPriceCents,
    label: getString(formData, `${prefix}.label`),
    expiresAt: getDate(formData, `${prefix}.expiresAt`),
    stripeCouponId,
    stripePromotionCodeId: getString(
      formData,
      `${prefix}.stripePromotionCodeId`,
    ),
    stripeSyncStatus: stripeCouponId ? "vinculado" : "sin_vincular",
  };
}

export async function updateFunnelPricingAction(formData: FormData) {
  "use server";

  const pricing = Object.fromEntries(
    PRICING_OFFER_KEYS.map((key) => [key, getPricingOffer(formData, key)]),
  ) as SiteFunnelPricingConfig;

  await upsertFunnelSetting("pricing", pricing as unknown as Json);
}
