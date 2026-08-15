import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { VenuesMap } from "@/components/venues-map/venues-map";
import { getPublishedMapPlaces } from "@/features/map-places/services/map-places-service";
import { getVenuesForMap } from "@/features/venues/services/venues-map-service";
import { getNoIndexMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata: Metadata = getNoIndexMetadata({
  title: "Mapa de locales | Pickyalo",
  description: "Ruta aislada para probar un mapa visual de locales.",
});

type MapaPageProps = {
  searchParams?: { lugar?: string };
};

export default async function MapaPage({ searchParams }: MapaPageProps) {
  const [venues, places] = await Promise.all([
    getVenuesForMap(),
    getPublishedMapPlaces(),
  ]);

  return (
    <div className="public-light-theme min-h-screen bg-[#FFF7E8]">
      <SiteHeader />
      <VenuesMap
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
        venues={venues}
        places={places}
        initialPlaceSlug={searchParams?.lugar}
        withSiteHeader
      />
    </div>
  );
}
