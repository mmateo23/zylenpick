import { revalidatePath } from "next/cache";

import { createAdminMutationClient } from "@/features/admin/services/admin-auth";
import {
  defaultSiteDesignConfig,
  normalizeSiteDesignConfig,
  type SiteDesignConfig,
  type SiteDesignMediaConfig,
  type SiteDesignTextsConfig,
  type SiteDesignZonesConfig,
} from "@/features/design/site-design-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const DESIGN_SETTING_KEYS = ["texts", "media", "zones"] as const;

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getMediaType(formData: FormData, key: string): "image" | "video" {
  return getString(formData, key) === "image" ? "image" : "video";
}

function revalidateDesignPaths() {
  revalidatePath("/");
  revalidatePath("/zonas");
  revalidatePath("/cart");
  revalidatePath("/checkout/success/[orderId]", "page");
  revalidatePath("/panel/diseno");
}

async function upsertDesignSetting(
  key: (typeof DESIGN_SETTING_KEYS)[number],
  value: Json,
) {
  const supabase = await createAdminMutationClient();
  const { error } = await supabase.from("site_design_settings").upsert(
    {
      key,
      value,
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(`Unable to update design setting ${key}: ${error.message}`);
  }

  revalidateDesignPaths();
}

export async function getAdminSiteDesignConfig(): Promise<SiteDesignConfig> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_design_settings")
    .select("key, value")
    .in("key", [...DESIGN_SETTING_KEYS]);

  if (error) {
    return defaultSiteDesignConfig;
  }

  const rows = data.reduce<Partial<Record<string, Json>>>((map, row) => {
    map[row.key] = row.value;
    return map;
  }, {});

  return normalizeSiteDesignConfig(rows);
}

export async function updateDesignTextsAction(formData: FormData) {
  "use server";

  const texts: SiteDesignTextsConfig = {
    globalLabels: {
      viewMenu: getString(formData, "globalLabels.viewMenu"),
      viewDetail: getString(formData, "globalLabels.viewDetail"),
      addForPickup: getString(formData, "globalLabels.addForPickup"),
      prepareForPickup: getString(formData, "globalLabels.prepareForPickup"),
      directions: getString(formData, "globalLabels.directions"),
    },
    home: {
      heroTitle: getString(formData, "home.heroTitle"),
      heroSubtitle: getString(formData, "home.heroSubtitle"),
    },
    cart: {
      emptyTitle: getString(formData, "cart.emptyTitle"),
      emptySubtitle: getString(formData, "cart.emptySubtitle"),
      emptyCta: getString(formData, "cart.emptyCta"),
      filledTitle: getString(formData, "cart.filledTitle"),
      filledSubtitle: getString(formData, "cart.filledSubtitle"),
      ctaMicrocopy: getString(formData, "cart.ctaMicrocopy"),
    },
    success: {
      heroTitle: getString(formData, "success.heroTitle"),
      heroSubtitle: getString(formData, "success.heroSubtitle"),
      nextStepTitle: getString(formData, "success.nextStepTitle"),
      nextStepMicrocopy: getString(formData, "success.nextStepMicrocopy"),
      primaryCta: getString(formData, "success.primaryCta"),
    },
  };

  await upsertDesignSetting("texts", texts as unknown as Json);
}

export async function updateDesignMediaAction(formData: FormData) {
  "use server";

  const media: SiteDesignMediaConfig = {
    homeHeroMediaType: getMediaType(formData, "homeHeroMediaType"),
    homeHeroMediaUrl: getString(formData, "homeHeroMediaUrl"),
    zonesHeroMediaType: getMediaType(formData, "zonesHeroMediaType"),
    zonesHeroMediaUrl: getString(formData, "zonesHeroMediaUrl"),
    cartEmptyImageUrl: getString(formData, "cartEmptyImageUrl"),
  };

  await upsertDesignSetting("media", media as unknown as Json);
}

export async function updateDesignZonesAction(formData: FormData) {
  "use server";

  const zones: SiteDesignZonesConfig = {
    title: getString(formData, "title"),
    subtitle: getString(formData, "subtitle"),
    sectionTitle: getString(formData, "sectionTitle"),
    cardMicrocopy: getString(formData, "cardMicrocopy"),
    cardCtaLabel: getString(formData, "cardCtaLabel"),
  };

  await upsertDesignSetting("zones", zones as unknown as Json);
}
