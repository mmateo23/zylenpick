import type { Metadata } from "next";

import { getActiveSiteChips } from "@/features/chips/services/site-chips-service";
import { getSiteFunnelSettings } from "@/features/funnel/services/site-funnel-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getMenuItemDisplayImage } from "@/features/venues/menu-item-media";
import { getHomeShowcase, getVenuesByCitySlug } from "@/features/venues/services/venues-service";
import { getPublishedExploreMapEntries } from "@/features/explore/services/explore-service";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { discoverySources, resolveDiscoveryShots } from "@/features/discovery/discovery-content";
import { emptyDiscovery } from "@/features/discovery/discovery-config";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { resolveVenueCoordinates } from "@/features/venues/venue-meta";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";
import { ServiceShowcaseDishesTemplate } from "@/templates/service-showcase/service-showcase-dishes-template";

export const revalidate = 900;

export const metadata: Metadata = getBaseMetadata({
  title: "Productos, platos y packs de Talavera",
  description:
    "Descubre productos, platos y packs de locales de Talavera. Un escaparate visual para conocer qué ofrecen y dónde encontrarlos.",
  path: "/platos",
});

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

export default async function DishesPage() {
  const [showcase, funnelSettings, chips, siteMedia, venueRows, exploreEntries, design] = await Promise.all([
    isSupabaseConfigured()
      ? getHomeShowcase()
      : Promise.resolve({ featuredItems: [], latestItems: [] }),
    getSiteFunnelSettings(),
    getActiveSiteChips(),
    getSiteMediaAssetMap(),
    getVenuesByCitySlug("talavera-de-la-reina"),
    isSupabaseConfigured() ? getPublishedExploreMapEntries() : Promise.resolve([]),
    getSiteDesignConfig(),
  ]);

  const items = dedupeItems([
    ...showcase.featuredItems,
    ...showcase.latestItems,
  ]);
  const venues = venueRows.map(venue => ({ ...venue, citySlug: "talavera-de-la-reina", cityName: "Talavera de la Reina" }));
  const mappedVenueCoordinates = venues.flatMap((venue) => {
    const coordinates = resolveVenueCoordinates(venue);
    return coordinates ? [coordinates] : [];
  });
  const locationPickerCenter = mappedVenueCoordinates.length > 0
    ? {
        latitude: mappedVenueCoordinates.reduce((total, point) => total + point.latitude, 0) / mappedVenueCoordinates.length,
        longitude: mappedVenueCoordinates.reduce((total, point) => total + point.longitude, 0) / mappedVenueCoordinates.length,
      }
    : { latitude: 39.9592, longitude: -4.8335 };
  const shots = resolveDiscoveryShots(funnelSettings.platos.discovery ?? emptyDiscovery, discoverySources(exploreEntries, venues, items, design.texts.homeCampaign));

  return (
    <ServiceShowcaseDishesTemplate
      items={items}
      venues={venues}
      shots={shots}
      funnelSettings={funnelSettings}
      chips={chips}
      heroImageUrl={siteMedia.dishes_hero.imageUrl}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      locationPickerCenter={locationPickerCenter}
    />
  );
}
