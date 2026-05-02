import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoBentoGallery } from "@/components/demo/demo-bento-gallery";
import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import {
  getCityBySlug,
  getHomeShowcase,
} from "@/features/venues/services/venues-service";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";

export const revalidate = 3600;

const talaveraHeroImageSrc =
  "/zones/talavera/talavera_de_la_reina_emerald.svg";

type CityVenuesPageProps = {
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
}: CityVenuesPageProps): Promise<Metadata> {
  const city = await getCityBySlug(params.citySlug);

  if (!city) {
    return getBaseMetadata({
      title: "Zonas de comida local",
      description:
        "Explora ciudades y zonas activas para descubrir locales de comida local y pedir para recoger.",
      path: `/zonas/${params.citySlug}`,
    });
  }

  return getBaseMetadata({
    title: `Qué comer en ${city.name} | ZylenPick`,
    description: `Descubre platos y sitios donde comer en ${city.name}. Elige rápido qué pedir y recoger sin complicaciones.`,
    path: `/zonas/${city.slug}`,
    image: city.heroImageUrl ?? "/logo/ZylenPick_LOGO.png?v=1",
  });
}

export default async function CityVenuesPage({ params }: CityVenuesPageProps) {
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
    <>
      <CityPreferenceSync city={{ slug: city.slug, name: city.name }} />
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
