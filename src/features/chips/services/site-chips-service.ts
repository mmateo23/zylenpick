import type { SiteChip, SiteChipType } from "@/features/chips/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapSiteChip(row: {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  type: string;
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
    type: row.type as SiteChipType,
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

function getMadridWeekday(date: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Europe/Madrid",
  }).format(date);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return map[weekday] ?? 1;
}

function getMadridTime(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Madrid",
  }).format(date);
}

function isChipCurrentlyVisible(chip: SiteChip, now = new Date()) {
  if (!chip.isActive || chip.itemIds.length === 0) {
    return false;
  }

  if (chip.startsAt && new Date(chip.startsAt) > now) {
    return false;
  }

  if (chip.endsAt && new Date(chip.endsAt) < now) {
    return false;
  }

  if (chip.weekdays.length > 0 && !chip.weekdays.includes(getMadridWeekday(now))) {
    return false;
  }

  const currentTime = getMadridTime(now);

  if (chip.startTime && currentTime < chip.startTime.slice(0, 5)) {
    return false;
  }

  if (chip.endTime && currentTime > chip.endTime.slice(0, 5)) {
    return false;
  }

  return true;
}

export async function getActiveSiteChips(): Promise<SiteChip[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_chips")
    .select(
      "id, name, slug, is_active, sort_order, type, item_ids, starts_at, ends_at, weekdays, start_time, end_time, is_paid, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return data.map(mapSiteChip).filter((chip) => isChipCurrentlyVisible(chip));
}
