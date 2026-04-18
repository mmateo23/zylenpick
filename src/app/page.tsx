import type { Metadata } from "next";

import { getCities } from "@/features/cities/services/cities-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";
import { ServiceShowcaseHomeTemplate } from "@/templates/service-showcase/service-showcase-home-template";

export const revalidate = 900;

export const metadata: Metadata = getBaseMetadata({
  title: "Comida local para recoger cerca de ti",
  description:
    "Descubre platos, locales y propuestas visuales para pedir comida local y recogerla sin esperas innecesarias.",
  path: "/",
});

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const [cities, showcase, siteMedia] = await Promise.all([
    configured ? getCities() : Promise.resolve([]),
    configured
      ? getHomeShowcase()
      : Promise.resolve({ featuredItems: [], latestItems: [] }),
    getSiteMediaAssetMap(),
  ]);

  return (
    <ServiceShowcaseHomeTemplate
      cities={cities}
      heroImageUrl={siteMedia.home_hero.imageUrl}
      featuredItems={showcase.featuredItems}
      latestItems={showcase.latestItems}
    />
  );
}
