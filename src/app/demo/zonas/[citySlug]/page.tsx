import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoBentoGallery } from "@/components/demo/demo-bento-gallery";
import {
  getCityBySlug,
  getHomeShowcase,
} from "@/features/venues/services/venues-service";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const revalidate = 900;
const talaveraDemoVideoSrc = "https://cdn.pixabay.com/video/2026/04/02/344075.mp4";

type DemoZonePageProps = {
  params: {
    citySlug: string;
  };
};

function dedupeItems(items: HomeShowcaseItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id) || !item.imageUrl) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export async function generateMetadata({
  params,
}: DemoZonePageProps): Promise<Metadata> {
  const fallbackTitle = "Demo Zonas | ZylenPick";

  if (!isSupabaseConfigured()) {
    return {
      title: fallbackTitle,
      description:
        "Ruta de demo para explorar una zona con una composici\u00f3n visual editorial.",
      robots: { index: false, follow: false },
    };
  }

  const city = await getCityBySlug(params.citySlug);

  return {
    title: city ? `${city.name} | Demo Zonas | ZylenPick` : fallbackTitle,
    description: city
      ? `Ruta de demo para explorar ${city.name} con una composici\u00f3n visual editorial.`
      : "Ruta de demo para explorar una zona con una composici\u00f3n visual editorial.",
    robots: { index: false, follow: false },
  };
}

export default async function DemoZonePage({ params }: DemoZonePageProps) {
  const city = isSupabaseConfigured()
    ? await getCityBySlug(params.citySlug)
    : null;

  if (!city) {
    notFound();
  }

  const showcase = isSupabaseConfigured()
    ? await getHomeShowcase()
    : { featuredItems: [], latestItems: [] };

  const items = dedupeItems([
    ...showcase.featuredItems,
    ...showcase.latestItems,
    ...showcase.featuredItems,
  ]).filter((item) => item.venue.citySlug === city.slug);

  return (
    <DemoBentoGallery
      items={items}
      mode="zonas"
      zoneName={city.name}
      zoneHeroImageUrl={city.heroImageUrl}
      zoneHeroVideoUrl={
        city.heroVideoUrl ??
        (city.slug === "talavera-de-la-reina" ? talaveraDemoVideoSrc : null)
      }
    />
  );
}
