import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { City } from "@/features/cities/types";

function mapCity(row: {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  hero_image_url: string | null;
  hero_video_url?: string | null;
}): City {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.region,
    heroImageUrl: row.hero_image_url,
    heroVideoUrl: row.hero_video_url ?? null,
  };
}

export async function getCities(): Promise<City[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, name, region, hero_image_url, hero_video_url")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error && error.message.toLowerCase().includes("hero_video_url")) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("cities")
      .select("id, slug, name, region, hero_image_url")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (fallbackError) {
      throw new Error(`Unable to load cities: ${fallbackError.message}`);
    }

    return fallbackData.map((city) =>
      mapCity({
        ...city,
        hero_video_url: null,
      }),
    );
  }

  if (error) {
    throw new Error(`Unable to load cities: ${error.message}`);
  }

  return data.map(mapCity);
}
