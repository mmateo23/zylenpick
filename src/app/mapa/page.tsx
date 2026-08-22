import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { VenuesMap } from "@/components/venues-map/venues-map";
import { getPublishedMapPlaces } from "@/features/map-places/services/map-places-service";
import { getPublishedMapPlaceCategories } from "@/features/map-places/services/map-place-categories-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getVenuesForMap } from "@/features/venues/services/venues-map-service";
import { getNoIndexMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata: Metadata = getNoIndexMetadata({
  title: "Mapa de locales | Pickyalo",
  description: "Ruta aislada para probar un mapa visual de locales.",
});

type MapaPageProps = {
  searchParams?: { lugar?: string; localizar?: string };
};

export default async function MapaPage({ searchParams }: MapaPageProps) {
  const [venues, places, categories, siteMedia] = await Promise.all([
    getVenuesForMap(),
    getPublishedMapPlaces(),
    getPublishedMapPlaceCategories(),
    getSiteMediaAssetMap(),
  ]);

  return (
    <div className="public-light-theme min-h-screen bg-[#FFF7E8]">
      <SiteHeader />
      <VenuesMap
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
        venues={venues}
        places={places}
        categories={categories}
        heroImageUrl={siteMedia.map_hero.imageUrl}
        initialPlaceSlug={searchParams?.lugar}
        autoLocate={searchParams?.localizar === "1"}
        withSiteHeader
      />
      <ZylenPickFooter theme="light" />
    </div>
  );
}
