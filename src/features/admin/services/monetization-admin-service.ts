import { revalidatePath } from "next/cache";

import { createAdminMutationClient } from "@/features/admin/services/admin-auth";
import { getAdminSiteChips } from "@/features/admin/services/chips-admin-service";
import { getAdminSiteFunnelSettings } from "@/features/admin/services/funnel-admin-service";
import {
  billingCycles,
  defaultVenueMonetizationPrivileges,
  monetizationPlans,
  type VenueBillingCycle,
  type VenueMonetizationPlan,
  type VenueMonetizationPrivileges,
  type VenueMonetizationSettings,
  type VenueMonetizationUsage,
  type VenueMonetizationWarning,
} from "@/features/monetization/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

type VenueOption = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isPublished: boolean;
};

type MenuItemOption = {
  id: string;
  name: string;
  venueId: string;
};

export type VenueMonetizationAdminRow = {
  venue: VenueOption;
  settings: VenueMonetizationSettings;
  hasPersistedSettings: boolean;
  usage: VenueMonetizationUsage;
  warnings: VenueMonetizationWarning[];
};

export type VenueMonetizationDashboard = {
  rows: VenueMonetizationAdminRow[];
  summary: {
    payingVenues: number;
    free: number;
    basic: number;
    oro: number;
    titanio: number;
    venuesWithActiveVisibility: number;
    openWarnings: number;
  };
};

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getDateTimeOrNull(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function getPlan(formData: FormData): VenueMonetizationPlan {
  const value = getString(formData, "plan") as VenueMonetizationPlan;
  return monetizationPlans.includes(value) ? value : "free";
}

function getBillingCycle(formData: FormData): VenueBillingCycle | null {
  const value = getString(formData, "billingCycle") as VenueBillingCycle;
  return billingCycles.includes(value) ? value : null;
}

function normalizePrivileges(value: unknown): VenueMonetizationPrivileges {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultVenueMonetizationPrivileges;
  }

  const record = value as Partial<Record<keyof VenueMonetizationPrivileges, unknown>>;

  return {
    quickDecision:
      typeof record.quickDecision === "boolean"
        ? record.quickDecision
        : defaultVenueMonetizationPrivileges.quickDecision,
    featuredFeed:
      typeof record.featuredFeed === "boolean"
        ? record.featuredFeed
        : defaultVenueMonetizationPrivileges.featuredFeed,
    promotionalChips:
      typeof record.promotionalChips === "boolean"
        ? record.promotionalChips
        : defaultVenueMonetizationPrivileges.promotionalChips,
  };
}

function createDefaultSettings(venueId: string): VenueMonetizationSettings {
  const now = new Date(0).toISOString();

  return {
    id: "",
    venueId,
    isPaying: false,
    plan: "free",
    billingCycle: null,
    privileges: defaultVenueMonetizationPrivileges,
    startsAt: null,
    endsAt: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
  };
}

function mapSettings(row: {
  id: string;
  venue_id: string;
  is_paying: boolean;
  plan: VenueMonetizationPlan;
  billing_cycle: VenueBillingCycle | null;
  privileges: Json;
  starts_at: string | null;
  ends_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}): VenueMonetizationSettings {
  return {
    id: row.id,
    venueId: row.venue_id,
    isPaying: row.is_paying,
    plan: row.plan,
    billingCycle: row.billing_cycle,
    privileges: normalizePrivileges(row.privileges),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function hasCommercialPrivileges(settings: VenueMonetizationSettings) {
  return (
    settings.privileges.quickDecision ||
    settings.privileges.featuredFeed ||
    settings.privileges.promotionalChips
  );
}

function hasVisibleUsage(usage: VenueMonetizationUsage) {
  return (
    usage.quickDecisionItems.length > 0 ||
    Boolean(usage.featuredFeedItem) ||
    usage.activeChips.length > 0
  );
}

function getWarnings(
  settings: VenueMonetizationSettings,
  usage: VenueMonetizationUsage,
): VenueMonetizationWarning[] {
  const warnings: VenueMonetizationWarning[] = [];
  const commercialPrivileges = hasCommercialPrivileges(settings);
  const visibleUsage = hasVisibleUsage(usage);
  const promotionalChips = usage.activeChips.filter(
    (chip) => chip.chipType === "promocional" || chip.isPaid,
  );

  if (!settings.isPaying && commercialPrivileges) {
    warnings.push({
      code: "non_paying_with_privileges",
      message:
        "Este local no esta marcado como pagador, pero tiene privilegios activos.",
    });
  }

  if (settings.plan === "free" && commercialPrivileges) {
    warnings.push({
      code: "free_with_commercial_privileges",
      message: "El plan free tiene privilegios de visibilidad activa.",
    });
  }

  if (
    usage.quickDecisionItems.length > 0 &&
    !settings.privileges.quickDecision
  ) {
    warnings.push({
      code: "quick_decision_without_privilege",
      message:
        "Este local aparece en Para decidir en segundos, pero no tiene privilegio quickDecision.",
    });
  }

  if (usage.featuredFeedItem && !settings.privileges.featuredFeed) {
    warnings.push({
      code: "featured_without_privilege",
      message:
        "Este local aparece como destacado en el feed, pero no tiene privilegio featuredFeed.",
    });
  }

  if (promotionalChips.length > 0 && !settings.privileges.promotionalChips) {
    warnings.push({
      code: "promotional_chip_without_privilege",
      message:
        "Este local aparece en chips promocionales, pero no tiene privilegio promotionalChips.",
    });
  }

  if (usage.activeChips.some((chip) => chip.isPaid) && !settings.isPaying) {
    warnings.push({
      code: "paid_chip_without_paying_venue",
      message:
        "Hay un chip pagado asociado a un local que no esta marcado como pagador.",
    });
  }

  if (settings.endsAt && new Date(settings.endsAt).getTime() < Date.now()) {
    warnings.push({
      code: "ended_subscription",
      message: "La fecha fin de la suscripcion ya ha pasado.",
    });
  }

  if (settings.isPaying && !settings.billingCycle) {
    warnings.push({
      code: "paying_without_billing_cycle",
      message: "Este local paga, pero no tiene ciclo mensual/anual definido.",
    });
  }

  if (settings.isPaying && !settings.startsAt) {
    warnings.push({
      code: "paying_without_start_date",
      message: "Este local paga, pero no tiene fecha de inicio definida.",
    });
  }

  if (
    (settings.plan === "oro" || settings.plan === "titanio") &&
    !visibleUsage
  ) {
    warnings.push({
      code: "high_plan_without_visibility",
      message:
        "Este local tiene plan oro/titanio, pero no esta usando visibilidad activa.",
    });
  }

  if (visibleUsage && (!settings.isPaying || settings.plan === "free")) {
    warnings.push({
      code: "visibility_without_aligned_plan",
      message:
        "Este local esta usando visibilidad, pero su plan no parece alineado.",
    });
  }

  return warnings;
}

function normalizePayload(formData: FormData) {
  return {
    is_paying: getBoolean(formData, "isPaying"),
    plan: getPlan(formData),
    billing_cycle: getBillingCycle(formData),
    privileges: {
      quickDecision: getBoolean(formData, "quickDecision"),
      featuredFeed: getBoolean(formData, "featuredFeed"),
      promotionalChips: getBoolean(formData, "promotionalChips"),
    } satisfies VenueMonetizationPrivileges,
    starts_at: getDateTimeOrNull(formData, "startsAt"),
    ends_at: getDateTimeOrNull(formData, "endsAt"),
    notes: getString(formData, "notes") || null,
  };
}

function revalidateMonetizationPaths() {
  revalidatePath("/panel/monetizacion");
}

export async function getVenueMonetizationDashboard(): Promise<VenueMonetizationDashboard> {
  const supabase = createSupabaseServerClient();
  const [venuesResult, settingsResult, menuItemsResult, funnel, chips] =
    await Promise.all([
      supabase
        .from("venues")
        .select("id, name, slug, is_active, is_published")
        .order("name", { ascending: true }),
      supabase
        .from("venue_monetization_settings")
        .select(
          "id, venue_id, is_paying, plan, billing_cycle, privileges, starts_at, ends_at, notes, created_at, updated_at",
        ),
      supabase
        .from("menu_items")
        .select("id, name, venue_id")
        .order("name", { ascending: true }),
      getAdminSiteFunnelSettings(),
      getAdminSiteChips(),
    ]);

  const venues: VenueOption[] = venuesResult.error
    ? []
    : venuesResult.data.map((venue) => ({
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        isActive: venue.is_active,
        isPublished: venue.is_published,
      }));
  const settingsByVenueId = new Map(
    settingsResult.error
      ? []
      : settingsResult.data.map((setting) => [
          setting.venue_id,
          mapSettings(setting),
        ]),
  );
  const menuItems: MenuItemOption[] = menuItemsResult.error
    ? []
    : menuItemsResult.data.map((item) => ({
        id: item.id,
        name: item.name,
        venueId: item.venue_id,
      }));
  const itemById = new Map(menuItems.map((item) => [item.id, item]));
  const itemIdsByVenueId = menuItems.reduce<Map<string, Set<string>>>(
    (map, item) => {
      const itemIds = map.get(item.venueId) ?? new Set<string>();
      itemIds.add(item.id);
      map.set(item.venueId, itemIds);
      return map;
    },
    new Map(),
  );

  const rows = venues.map<VenueMonetizationAdminRow>((venue) => {
    const settings = settingsByVenueId.get(venue.id) ?? createDefaultSettings(venue.id);
    const venueItemIds = itemIdsByVenueId.get(venue.id) ?? new Set<string>();
    const quickDecisionItems = funnel.platos.quickDecision.enabled
      ? funnel.platos.quickDecision.itemIds
          .map((itemId) => itemById.get(itemId))
          .filter(
            (item): item is MenuItemOption =>
              item !== undefined && item.venueId === venue.id,
          )
          .map((item) => ({ itemId: item.id, itemName: item.name }))
      : [];
    const featuredItem =
      funnel.platos.featuredFeed.enabled && funnel.platos.featuredFeed.itemId
        ? itemById.get(funnel.platos.featuredFeed.itemId) ?? null
        : null;
    const activeChips = chips
      .filter(
        (chip) =>
          chip.isActive &&
          chip.itemIds.some((itemId) => venueItemIds.has(itemId)),
      )
      .map((chip) => ({
        chipId: chip.id,
        chipName: chip.name,
        chipType: chip.type,
        isPaid: chip.isPaid,
      }));
    const usage: VenueMonetizationUsage = {
      venueId: venue.id,
      venueName: venue.name,
      quickDecisionItems,
      featuredFeedItem:
        featuredItem && featuredItem.venueId === venue.id
          ? { itemId: featuredItem.id, itemName: featuredItem.name }
          : null,
      activeChips,
      ordersCount: 0,
    };

    return {
      venue,
      settings,
      hasPersistedSettings: settingsByVenueId.has(venue.id),
      usage,
      warnings: getWarnings(settings, usage),
    };
  });

  return {
    rows,
    summary: {
      payingVenues: rows.filter((row) => row.settings.isPaying).length,
      free: rows.filter((row) => row.settings.plan === "free").length,
      basic: rows.filter((row) => row.settings.plan === "basic").length,
      oro: rows.filter((row) => row.settings.plan === "oro").length,
      titanio: rows.filter((row) => row.settings.plan === "titanio").length,
      venuesWithActiveVisibility: rows.filter((row) => hasVisibleUsage(row.usage))
        .length,
      openWarnings: rows.reduce(
        (total, row) => total + row.warnings.length,
        0,
      ),
    },
  };
}

export async function updateVenueMonetizationAction(
  venueId: string,
  formData: FormData,
) {
  "use server";

  const payload = normalizePayload(formData);
  const supabase = await createAdminMutationClient();
  const { error } = await supabase.from("venue_monetization_settings").upsert(
    {
      venue_id: venueId,
      ...payload,
      privileges: payload.privileges as unknown as Json,
    },
    { onConflict: "venue_id" },
  );

  if (error) {
    throw new Error(`Unable to update monetization settings: ${error.message}`);
  }

  revalidateMonetizationPaths();
}
