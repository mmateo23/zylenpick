import { revalidatePath } from "next/cache";

import {
  createAdminDataClient,
  createAdminMutationClient,
} from "@/features/admin/services/admin-auth";
import {
  defaultSiteDesignConfig,
  normalizeSiteDesignConfig,
  type HomeCampaignIconMotion,
  type HomeCampaignMediaType,
  type HomeCampaignVisualStyle,
  type SiteDesignConfig,
  type SiteDesignMediaConfig,
  type SiteDesignTextsConfig,
  type SiteDesignZonesConfig,
} from "@/features/design/site-design-config";
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
  revalidatePath("/panel/campana-home");
}

function getCampaignMediaType(formData: FormData): HomeCampaignMediaType {
  const type = getString(formData, "backgroundMediaType");
  return type === "image" || type === "video" ? type : "none";
}

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getCampaignHref(formData: FormData) {
  const href = getString(formData, "href");

  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }

  try {
    const url = new URL(href);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString();
    }
  } catch {
    // The validation error below gives the admin a useful message.
  }

  throw new Error("El destino debe ser una ruta interna o una URL válida.");
}

function getCampaignMediaUrl(
  formData: FormData,
  key: string,
  label = "El recurso",
) {
  const value = getString(formData, key);
  if (!value) return "";

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString();
    }
  } catch {
    // The validation error below gives the admin a useful message.
  }

  throw new Error(`${label} debe usar una ruta interna o una URL válida.`);
}


function getColor(formData: FormData, key: string) {
  const color = getString(formData, key);
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    throw new Error(`El color ${key} no es válido.`);
  }
  return color.toUpperCase();
}

function getPercentage(formData: FormData, key: string, fallback: number) {
  const value = Number(getString(formData, key));
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getVisualStyle(formData: FormData): HomeCampaignVisualStyle {
  const style = getString(formData, "visualStyle");
  return style === "glass" || style === "spotlight" || style === "outline"
    ? style
    : "editorial";
}

function getIconMotion(formData: FormData): HomeCampaignIconMotion {
  const motion = getString(formData, "iconMotion");
  return motion === "float" || motion === "pulse" || motion === "rotate"
    ? motion
    : "none";
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
  const supabase = await createAdminDataClient();
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

  const current = await getAdminSiteDesignConfig();
  const texts: SiteDesignTextsConfig = {
    globalLabels: {
      ...current.texts.globalLabels,
      prepareForPickup: getString(formData, "globalLabels.prepareForPickup"),
      directions: getString(formData, "globalLabels.directions"),
    },
    home: current.texts.home,
    homeCampaign: current.texts.homeCampaign,
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

export async function updateHomeCampaignAction(formData: FormData) {
  "use server";

  const current = await getAdminSiteDesignConfig();
  const enabled = getCheckbox(formData, "enabled");
  const title = getString(formData, "title");
  const ctaLabel = getString(formData, "ctaLabel");
  const startsOn = getString(formData, "startsOn");
  const endsOn = getString(formData, "endsOn");

  if (enabled && (!title || !ctaLabel)) {
    throw new Error("Completa el título y el texto del botón antes de activar la campaña.");
  }

  if (startsOn && endsOn && endsOn < startsOn) {
    throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
  }

  const texts: SiteDesignTextsConfig = {
    ...current.texts,
    homeCampaign: {
      enabled,
      sponsored: getCheckbox(formData, "sponsored"),
      eyebrow: getString(formData, "eyebrow"),
      title,
      description: getString(formData, "description"),
      ctaLabel,
      href: getCampaignHref(formData),
      startsOn,
      endsOn,
      visualStyle: getVisualStyle(formData),
      backgroundColor: getColor(formData, "backgroundColor"),
      textColor: getColor(formData, "textColor"),
      accentColor: getColor(formData, "accentColor"),
      borderColor: getColor(formData, "borderColor"),
      backgroundMediaType: getCampaignMediaType(formData),
      backgroundMediaUrl: getCampaignMediaUrl(
        formData,
        "backgroundMediaUrl",
        "El fondo",
      ),
      backgroundMediaOpacity: getPercentage(
        formData,
        "backgroundMediaOpacity",
        current.texts.homeCampaign.backgroundMediaOpacity,
      ),
      beamEnabled: getCheckbox(formData, "beamEnabled"),
      confettiEnabled: getCheckbox(formData, "confettiEnabled"),
      iconSvgUrl: getCampaignMediaUrl(formData, "iconSvgUrl", "El SVG"),
      iconMotion: getIconMotion(formData),
    },
  };

  await upsertDesignSetting("texts", texts as unknown as Json);
}

export async function updateDesignMediaAction(formData: FormData) {
  "use server";

  const current = await getAdminSiteDesignConfig();
  const media: SiteDesignMediaConfig = {
    ...current.media,
    zonesHeroMediaType: getMediaType(formData, "zonesHeroMediaType"),
    zonesHeroMediaUrl: getString(formData, "zonesHeroMediaUrl"),
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
