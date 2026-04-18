import type { Metadata } from "next";

import { getCities } from "@/features/cities/services/cities-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ServiceShowcaseHomeTemplate } from "@/templates/service-showcase/service-showcase-home-template";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Demo Home | ZylenPick",
  description: "Ruta de demo para diseñar la home y explorar bloques visuales.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DemoHomePage() {
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
