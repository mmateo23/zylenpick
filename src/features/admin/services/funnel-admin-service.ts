import { revalidatePath } from "next/cache";

import { createAdminMutationClient } from "@/features/admin/services/admin-auth";
import {
  defaultSiteFunnelSettings,
  normalizeSiteFunnelSettings,
  type SiteFunnelPlatosConfig,
  type SiteFunnelSettings,
} from "@/features/funnel/site-funnel-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const FUNNEL_SETTING_KEYS = ["platos"] as const;

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

function revalidateFunnelPaths() {
  revalidatePath("/platos");
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
  const supabase = createSupabaseServerClient();
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
  const supabase = createSupabaseServerClient();
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
