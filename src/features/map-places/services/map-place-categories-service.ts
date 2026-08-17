import { mapPlaceCategories, type MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPublishedMapPlaceCategories(): Promise<MapPlaceCategoryDefinition[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("map_place_categories")
    .select("slug, name, icon_name, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) return mapPlaceCategories;

  return data.map((category) => ({
    value: category.slug,
    label: category.name,
    shortLabel: category.name,
    iconName: category.icon_name,
    isActive: category.is_active,
    sortOrder: category.sort_order,
  }));
}
