import { cache } from "react";

import { getUpcomingEvents as selectUpcomingEvents, getMadridDate, type EventScheduleItem, type PublicEvent } from "@/features/events/events";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

type EventRow = Database["public"]["Tables"]["events"]["Row"] & {
  cities: { name: string; slug: string };
};

function parseSchedule(value: Json): EventScheduleItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)
      || typeof item.date !== "string" || typeof item.label !== "string" || typeof item.title !== "string") return [];
    return [{
      date: item.date, label: item.label, title: item.title,
      description: typeof item.description === "string" ? item.description : undefined,
      time: typeof item.time === "string" ? item.time : undefined,
      location: typeof item.location === "string" ? item.location : undefined,
    }];
  });
}

function toPublicEvent(row: EventRow): PublicEvent {
  return {
    slug: row.slug, title: row.title, shortTitle: row.short_title,
    eyebrow: row.eyebrow, summary: row.summary, description: row.description,
    startsOn: row.starts_on, endsOn: row.ends_on, city: row.cities,
    locationLabel: row.location_label, venueNote: row.venue_note ?? undefined,
    accessLabel: row.access_label, accessNote: row.access_note ?? undefined,
    organizer: row.organizer, websiteUrl: row.website_url,
    sourceUrl: row.source_url, sourceLabel: row.source_label, verifiedOn: row.verified_on,
    ticketsUrl: row.tickets_url ?? undefined, directionsUrl: row.directions_url ?? undefined,
    imageUrl: row.image_url ?? undefined, homeImageUrl: row.home_image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined, tags: row.tags, highlights: row.highlights,
    schedule: parseSchedule(row.schedule),
  };
}

// React cache deduplicates metadata/page reads within one request only.
// No static catalogue or cross-request cache: publication changes need no build.
export const getPublishedEvents = cache(async (): Promise<PublicEvent[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("events")
    .select("*, cities!inner(name, slug)")
    .eq("status", "published")
    .order("starts_on", { ascending: true })
    .order("slug", { ascending: true });
  if (error) throw new Error(`Unable to load events: ${error.message}`);
  return data.map(toPublicEvent);
});

export async function getUpcomingEvents(today = getMadridDate()) {
  return selectUpcomingEvents(await getPublishedEvents(), today);
}

export async function getEventBySlug(slug: string) {
  return (await getPublishedEvents()).find((event) => event.slug === slug) ?? null;
}
