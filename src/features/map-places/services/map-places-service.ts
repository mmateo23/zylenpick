import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDefaultMapPlacePlanRole } from "@/features/map-places/categories";
import type { PublicMapPlace } from "@/features/map-places/types";

function isMissingMapPlacesTable(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("map_places") && normalized.includes("schema cache");
}

function isMissingEditorialColumns(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("cover_image_url") ||
    normalized.includes("opening_hours_note") ||
    normalized.includes("source_label")
  );
}

function isMissingPlanColumns(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("plan_role") || normalized.includes("is_plan_candidate");
}

export async function getPublishedMapPlaces(): Promise<PublicMapPlace[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("map_places")
    .select(
      "id, slug, name, description, category, icon_name, latitude, longitude, amenities, is_accessible, cover_image_url, story, opening_hours_note, accessibility_note, source_label, source_url, plan_role, is_plan_candidate, cities!inner(slug, name)",
    )
    .eq("status", "published")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error && isMissingPlanColumns(error.message)) {
    const prePlanResult = await supabase
      .from("map_places")
      .select(
        "id, slug, name, description, category, icon_name, latitude, longitude, amenities, is_accessible, cover_image_url, story, opening_hours_note, accessibility_note, source_label, source_url, cities!inner(slug, name)",
      )
      .eq("status", "published")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!prePlanResult.error) {
      return prePlanResult.data.map((place) => ({
        id: place.id,
        slug: place.slug,
        name: place.name,
        description: place.description,
        category: place.category,
        iconName: place.icon_name,
        latitude: place.latitude,
        longitude: place.longitude,
        amenities: place.amenities ?? [],
        isAccessible: place.is_accessible,
        coverImageUrl: place.cover_image_url,
        story: place.story,
        openingHoursNote: place.opening_hours_note,
        accessibilityNote: place.accessibility_note,
        sourceLabel: place.source_label,
        sourceUrl: place.source_url,
        planRole: getDefaultMapPlacePlanRole(place.category),
        isPlanCandidate: false,
        city: { slug: place.cities.slug, name: place.cities.name },
      }));
    }

    if (!isMissingEditorialColumns(prePlanResult.error.message)) {
      if (isMissingMapPlacesTable(prePlanResult.error.message)) return [];
      throw new Error(`Unable to load map places: ${prePlanResult.error.message}`);
    }
  }

  if (error && (isMissingEditorialColumns(error.message) || isMissingPlanColumns(error.message))) {
    const legacyResult = await supabase
      .from("map_places")
      .select(
        "id, slug, name, description, category, icon_name, latitude, longitude, amenities, is_accessible, cities!inner(slug, name)",
      )
      .eq("status", "published")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (legacyResult.error) {
      if (isMissingMapPlacesTable(legacyResult.error.message)) return [];
      throw new Error(`Unable to load map places: ${legacyResult.error.message}`);
    }

    return legacyResult.data.map((place) => ({
      id: place.id,
      slug: place.slug,
      name: place.name,
      description: place.description,
      category: place.category,
      iconName: place.icon_name,
      latitude: place.latitude,
      longitude: place.longitude,
      amenities: place.amenities ?? [],
      isAccessible: place.is_accessible,
      coverImageUrl: null,
      story: null,
      openingHoursNote: null,
      accessibilityNote: null,
      sourceLabel: null,
      sourceUrl: null,
      planRole: getDefaultMapPlacePlanRole(place.category),
      isPlanCandidate: false,
      city: {
        slug: place.cities.slug,
        name: place.cities.name,
      },
    }));
  }

  if (error) {
    if (isMissingMapPlacesTable(error.message)) {
      return [];
    }

    throw new Error(`Unable to load map places: ${error.message}`);
  }

  return data.map((place) => ({
    id: place.id,
    slug: place.slug,
    name: place.name,
    description: place.description,
    category: place.category,
    iconName: place.icon_name,
    latitude: place.latitude,
    longitude: place.longitude,
    amenities: place.amenities ?? [],
    isAccessible: place.is_accessible,
    coverImageUrl: place.cover_image_url,
    story: place.story,
    openingHoursNote: place.opening_hours_note,
    accessibilityNote: place.accessibility_note,
    sourceLabel: place.source_label,
    sourceUrl: place.source_url,
    planRole: place.plan_role,
    isPlanCandidate: place.is_plan_candidate,
    city: {
      slug: place.cities.slug,
      name: place.cities.name,
    },
  }));
}
