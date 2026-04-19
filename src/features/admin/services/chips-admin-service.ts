import { revalidatePath } from "next/cache";

import { createAdminMutationClient } from "@/features/admin/services/admin-auth";
import type { SiteChip, SiteChipType } from "@/features/chips/types";
import { siteChipTypes } from "@/features/chips/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ChipDishOption = {
  id: string;
  name: string;
  venueName: string;
  cityName: string;
};

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getNumber(formData: FormData, key: string, fallback: number) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? Math.floor(value) : fallback;
}

function getStringArray(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function getWeekdays(formData: FormData) {
  return getStringArray(formData, "weekdays")
    .map(Number)
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7);
}

function getDateTimeOrNull(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function getTimeOrNull(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value || null;
}

function getChipType(formData: FormData): SiteChipType {
  const value = getString(formData, "type") as SiteChipType;
  return siteChipTypes.includes(value) ? value : "editorial";
}

function revalidateChipPaths() {
  revalidatePath("/platos");
  revalidatePath("/panel/chips");
}

function mapSiteChip(row: {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  type: SiteChipType;
  item_ids: string[];
  starts_at: string | null;
  ends_at: string | null;
  weekdays: number[];
  start_time: string | null;
  end_time: string | null;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}): SiteChip {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    type: row.type,
    itemIds: row.item_ids,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    weekdays: row.weekdays,
    startTime: row.start_time,
    endTime: row.end_time,
    isPaid: row.is_paid,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeChipPayload(formData: FormData) {
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");

  if (!name) {
    throw new Error("El nombre del chip es obligatorio.");
  }

  if (!slug) {
    throw new Error("El slug del chip es obligatorio.");
  }

  return {
    name,
    slug,
    is_active: getBoolean(formData, "isActive"),
    sort_order: getNumber(formData, "sortOrder", 100),
    type: getChipType(formData),
    item_ids: getStringArray(formData, "itemIds"),
    starts_at: getDateTimeOrNull(formData, "startsAt"),
    ends_at: getDateTimeOrNull(formData, "endsAt"),
    weekdays: getWeekdays(formData),
    start_time: getTimeOrNull(formData, "startTime"),
    end_time: getTimeOrNull(formData, "endTime"),
    is_paid: getBoolean(formData, "isPaid"),
  };
}

export async function getAdminSiteChips(): Promise<SiteChip[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_chips")
    .select(
      "id, name, slug, is_active, sort_order, type, item_ids, starts_at, ends_at, weekdays, start_time, end_time, is_paid, created_at, updated_at",
    )
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return data.map(mapSiteChip);
}

export async function getChipDishOptions(): Promise<ChipDishOption[]> {
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
    .limit(160);

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

export async function createSiteChipAction(formData: FormData) {
  "use server";

  const payload = normalizeChipPayload(formData);
  const supabase = await createAdminMutationClient();
  const { error } = await supabase.from("site_chips").insert(payload);

  if (error) {
    throw new Error(`Unable to create chip: ${error.message}`);
  }

  revalidateChipPaths();
}

export async function updateSiteChipAction(chipId: string, formData: FormData) {
  "use server";

  const payload = normalizeChipPayload(formData);
  const supabase = await createAdminMutationClient();
  const { error } = await supabase
    .from("site_chips")
    .update(payload)
    .eq("id", chipId);

  if (error) {
    throw new Error(`Unable to update chip: ${error.message}`);
  }

  revalidateChipPaths();
}
