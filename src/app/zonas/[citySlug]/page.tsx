import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoBentoGallery } from "@/components/demo/demo-bento-gallery";
import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { CityLocalStructuredData } from "@/components/seo/local-seo-structured-data";
import {
  getCityBySlug,
  getHomeShowcase,
  getVenuesByCitySlug,
} from "@/features/venues/services/venues-service";
import { getMenuItemDisplayImage } from "@/features/venues/menu-item-media";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";

export const revalidate = 3600;

const talaveraHeroImageSrc = "/home/zonas/talavera-poster-local.webp";

type CityVenuesPageProps = {
  params: {
    citySlug: string;
  };
};

function dedupeItems(items: HomeShowcaseItem[]) {
  const seen = new Set<string>();
  const dedupedItems: HomeShowcaseItem[] = [];

  for (const item of items) {
    const imageUrl = getMenuItemDisplayImage(item.name, item.imageUrl);

    if (seen.has(item.id) || !imageUrl) {
      continue;
    }

    seen.add(item.id);
    dedupedItems.push({ ...item, imageUrl });
  }

  return dedupedItems;
}

export async function generateMetadata({
  params,
}: CityVenuesPageProps): Promise<Metadata> {
  const city = await getCityBySlug(params.citySlug);

  if (!city) {
    return getBaseMetadata({
      title: "Zonas con locales cercanos",
      description:
        "Explora ciudades y zonas activas para descubrir productos y platos destacados de locales cercanos para recoger.",
      path: `/zonas/${params.citySlug}`,
    });
  }

  return getBaseMetadata({
    title: `Comida para recoger en ${city.name}`,
    description: `Descubre comida local, productos y platos destacados de locales cercanos en ${city.name}. Compara opciones y recoge cerca de ti.`,
    path: `/zonas/${city.slug}`,
    image: city.heroImageUrl ?? "/icons/pickyalo-app.svg?v=1",
  });
}

export default async function CityVenuesPage({ params }: CityVenuesPageProps) {
  const city = isSupabaseConfigured()
    ? await getCityBySlug(params.citySlug)
    : null;

  if (!city) {
    notFound();
  }

  const [showcase, venues] = await Promise.all([
    getHomeShowcase(),
    getVenuesByCitySlug(city.slug),
  ]);

  const items = dedupeItems([
    ...showcase.featuredItems,
    ...showcase.latestItems,
    ...showcase.featuredItems,
  ]).filter((item) => item.venue.citySlug === city.slug);

  return (
    <>
      <CityPreferenceSync city={{ slug: city.slug, name: city.name }} />
      <CityLocalStructuredData city={city} venues={venues} />
      <DemoBentoGallery
        items={items}
        mode="zonas"
        variant="public"
        zoneName={city.name}
        zoneHeroImageUrl={
          city.slug === "talavera-de-la-reina"
            ? talaveraHeroImageSrc
            : city.heroImageUrl
        }
        zoneHeroVideoUrl={
          city.slug === "talavera-de-la-reina" ? null : city.heroVideoUrl
        }
      />
    </>
  );
}
