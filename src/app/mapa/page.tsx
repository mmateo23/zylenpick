import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { VenuesMap } from "@/components/venues-map/venues-map";
import { getPublishedExploreMapEntries } from "@/features/explore/services/explore-service";
import { getPublishedMapPlaces } from "@/features/map-places/services/map-places-service";
import { getPublishedMapPlaceCategories } from "@/features/map-places/services/map-place-categories-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getCurrentWeather } from "@/features/weather/current-weather";
import { getBaseMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata: Metadata = getBaseMetadata({
  title: "Mapa de Talavera: monumentos y servicios útiles",
  description: "Explora monumentos, parques, puntos útiles y paradas con horarios de autobús en el mapa de Talavera de Pickyalo.",
  path: "/mapa",
});

type MapaPageProps = {
  searchParams?: {
    lugar?: string;
    localizar?: string;
    explora?: string;
    filtro?: string;
    linea?: string;
    direccion?: string;
    desde?: string;
    hasta?: string;
  };
};

export default async function MapaPage({ searchParams }: MapaPageProps) {
  const [places, categories, siteMedia, exploreEntries, weather] = await Promise.all([
    getPublishedMapPlaces(),
    getPublishedMapPlaceCategories(),
    getSiteMediaAssetMap(),
    getPublishedExploreMapEntries(),
    getCurrentWeather({ latitude: 39.9609, longitude: -4.8306 }),
  ]);
  const exploreByPlaceId = new Map(
    exploreEntries.map((entry) => [entry.mapPlaceId, entry]),
  );
  const placesWithExplore = places.map((place) => {
    const entry = exploreByPlaceId.get(place.id);
    return {
      ...place,
      explore: entry
        ? {
            routeSlug: entry.routeSlug,
            routeName: entry.routeName,
            pointSlug: entry.pointSlug,
            pointTitle: entry.pointTitle,
            publicToken: entry.publicToken,
          }
        : null,
    };
  });

  return (
    <div className="public-light-theme pickyalo-public-canvas min-h-screen">
      <SiteHeader />
      <VenuesMap
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
        venues={[]}
        places={placesWithExplore}
        categories={categories}
        heroImageUrl={siteMedia.map_hero.imageUrl}
        weather={weather}
        initialPlaceSlug={searchParams?.lugar}
        initialFilter={searchParams?.filtro}
        autoLocate={searchParams?.localizar === "1"}
        initialExploreOnly={searchParams?.explora === "1"}
        initialTransitLine={searchParams?.linea}
        initialTransitDirection={searchParams?.direccion}
        initialTransitFrom={searchParams?.desde}
        initialTransitTo={searchParams?.hasta}
        withSiteHeader
        guidedDiscovery
      />
      <ZylenPickFooter theme="light" />
    </div>
  );
}
