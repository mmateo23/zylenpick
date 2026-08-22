import type { Metadata } from "next";

import { getCities } from "@/features/cities/services/cities-service";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { isHomeCampaignActive } from "@/features/design/site-design-config";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";
import { ServiceShowcaseHomeTemplate } from "@/templates/service-showcase/service-showcase-home-template";

export const revalidate = 900;

export const metadata: Metadata = getBaseMetadata({
  title: "Platos reales cerca de ti para recoger",
  description:
    "Descubre platos reales de locales cercanos, recógelos sin dar vueltas y explora tu ciudad con el mapa de Pickyalo.",
  path: "/",
});

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const [cities, showcase, siteMedia, design] = await Promise.all([
    configured ? getCities() : Promise.resolve([]),
    configured
      ? getHomeShowcase()
      : Promise.resolve({ featuredItems: [], latestItems: [] }),
    getSiteMediaAssetMap(),
    getSiteDesignConfig(),
  ]);
  const homeDesign = {
    ...design,
    texts: {
      ...design.texts,
      homeCampaign: {
        ...design.texts.homeCampaign,
        enabled:
          process.env.NODE_ENV === "development" ||
          isHomeCampaignActive(design.texts.homeCampaign),
      },
    },
  };

  return (
    <ServiceShowcaseHomeTemplate
      cities={cities}
      heroImageUrl={siteMedia.home_hero.imageUrl}
      design={homeDesign}
      featuredItems={showcase.featuredItems}
      latestItems={showcase.latestItems}
    />
  );
}
