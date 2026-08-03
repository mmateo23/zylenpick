import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicMapPlace } from "@/features/map-places/types";

function isMissingMapPlacesTable(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("map_places") && normalized.includes("schema cache");
}

export async function getPublishedMapPlaces(): Promise<PublicMapPlace[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("map_places")
    .select(
      "id, name, description, category, icon_name, latitude, longitude, amenities, is_accessible, cities!inner(slug, name)",
    )
    .eq("status", "published")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (isMissingMapPlacesTable(error.message)) {
      return [];
    }

    throw new Error(`Unable to load map places: ${error.message}`);
  }

  return data.map((place) => ({
    id: place.id,
    name: place.name,
    description: place.description,
    category: place.category,
    iconName: place.icon_name,
    latitude: place.latitude,
    longitude: place.longitude,
    amenities: place.amenities ?? [],
    isAccessible: place.is_accessible,
    city: {
      slug: place.cities.slug,
      name: place.cities.name,
    },
  }));
}
