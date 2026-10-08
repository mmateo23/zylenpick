import type { Metadata } from "next";

import { PickyaloHome } from "@/components/home/pickyalo-home";
import { HomeStructuredData } from "@/components/seo/home-structured-data";
import { madridToday, type HomeResult } from "@/components/home/home-discovery-model";
import { getCities } from "@/features/cities/services/cities-service";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { getHomeCampaignImage, isHomeCampaignActive } from "@/features/design/site-design-config";
import { matchesIntent } from "@/features/discovery/discovery-filters";
import { getUpcomingEvents } from "@/features/events/events";
import { getPublishedExploreMapEntries } from "@/features/explore/services/explore-service";
import { getMapPlaceCategory } from "@/features/map-places/categories";
import { getPublishedMapPlaceCategories } from "@/features/map-places/services/map-place-categories-service";
import { getPublishedMapPlaces } from "@/features/map-places/services/map-places-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getPricePresentation } from "@/features/pricing/price-display";
import { getHomeShowcase, getVenuesByCitySlug } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata: Metadata = getBaseMetadata({
  title: "Comercio local y lugares por descubrir en Talavera",
  description:
    "Platos reales, comercios y rincones de Talavera. Una selección local para elegir con los ojos y salir a descubrir.",
  path: "/",
});

function resolved<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export default async function HomePage({ searchParams = {} }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const configured = isSupabaseConfigured();
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => { if (typeof value === "string") params.set(key, value); });
  // Independent public reads: one failed source must not take down the other paths.
  const [cityRead, foodRead, placeRead, exploreRead, categoryRead, designRead, siteMediaRead] = await Promise.allSettled([
    configured ? getCities() : Promise.resolve([]),
    configured ? getHomeShowcase() : Promise.resolve({ featuredItems: [], latestItems: [] }),
    configured ? getPublishedMapPlaces() : Promise.resolve([]),
    configured ? getPublishedExploreMapEntries() : Promise.resolve([]),
    configured ? getPublishedMapPlaceCategories() : Promise.resolve([]),
    getSiteDesignConfig(),
    getSiteMediaAssetMap(),
  ]);
  const cities = resolved(cityRead, []);
  const city = cities.find((entry) => entry.slug === params.get("ciudad"))
    ?? cities.find((entry) => entry.slug === "talavera-de-la-reina") ?? cities[0];
  const [venueRead] = await Promise.allSettled([city && configured ? getVenuesByCitySlug(city.slug) : Promise.resolve([])]);
  const showcase = resolved(foodRead, { featuredItems: [], latestItems: [] });
  const products = [...showcase.featuredItems, ...showcase.latestItems].filter((item, index, all) =>
    item.venue.citySlug === city?.slug && all.findIndex((other) => other.id === item.id) === index);
  const results: HomeResult[] = products.map((item) => ({
    id: `product-${item.id}`, path: "comer", kind: "product", title: item.name, subtitle: item.venue.name,
    category: item.categoryName?.trim() ?? "", categoryLabel: item.categoryName?.trim() ?? "",
    image: item.imageUrl, href: `/zonas/${item.venue.citySlug}/venues/${item.venue.slug}#plato-${item.id}`,
    cta: "Ver el local", price: getPricePresentation({ ...item, pricesVisible: item.venue.pricesVisible }).label,
    latitude: item.venue.latitude ?? undefined, longitude: item.venue.longitude ?? undefined,
  }));
  // Keep venues without photographed products reachable through their existing ficha.
  resolved(venueRead, []).filter((venue) => matchesIntent(venue.discoveryCategory, "food")
    && !products.some((item) => item.venue.id === venue.id)).forEach((venue) => results.push({
    id: `venue-${venue.id}`, path: "comer", kind: "venue", title: venue.name,
    subtitle: venue.address ?? city?.name ?? "", category: venue.discoveryCategory ?? "", categoryLabel: venue.discoveryCategory ?? "",
    image: venue.coverUrl, href: `/zonas/${city!.slug}/venues/${venue.slug}`, cta: "Ver qué ofrece",
    latitude: venue.latitude ?? undefined, longitude: venue.longitude ?? undefined,
  }));
  const categories = resolved(categoryRead, []);
  const explore = resolved(exploreRead, []);
  resolved(placeRead, []).filter((place) => place.city.slug === city?.slug
    && (place.planRole === "discover" || ["park", "viewpoint"].includes(place.category))).forEach((place) => {
    const point = explore.find((entry) => entry.mapPlaceId === place.id);
    const label = getMapPlaceCategory(place.category, categories).label;
    const workshop = /taller|workshop/i.test(`${place.category} ${label}`);
    results.push({
      id: `place-${place.id}`, path: "descubrir", kind: workshop ? "workshop" : "place", title: place.name,
      subtitle: workshop ? "Taller · consulta su información" : place.description ?? label,
      category: place.category, categoryLabel: label, image: point?.imageUrl || place.coverImageUrl,
      href: point ? `/explora/${point.routeSlug}/${point.pointSlug}?unlock=${encodeURIComponent(point.publicToken)}` : `/mapa?lugar=${encodeURIComponent(place.slug)}`,
      cta: workshop ? "Consultar el taller" : "Descubrir el lugar",
      latitude: place.latitude, longitude: place.longitude,
    });
  });
  const upcomingEvents = getUpcomingEvents().filter((event) => event.city.slug === city?.slug);
  upcomingEvents.forEach((event) => results.push({
    id: `event-${event.slug}`, path: "eventos", kind: "event", title: event.title,
    subtitle: event.summary, category: event.tags[0]?.toLowerCase() ?? "", categoryLabel: event.tags[0] ?? "Evento",
    image: event.homeImageUrl ?? event.imageUrl ?? null, href: `/eventos/${event.slug}`, cta: "Ver el evento",
    startsOn: event.startsOn, endsOn: event.endsOn,
  }));

  // Campaigns remain available for a temporary editorial placement, but only
  // appear inside their configured dates. Development no longer fabricates an
  // active event when the campaign is disabled.
  const campaign = designRead.status === "fulfilled" ? designRead.value.texts.homeCampaign : null;
  const showCampaign = Boolean(campaign && isHomeCampaignActive(campaign));
  if (campaign && showCampaign) results.push({
    id: "home-campaign", path: "eventos", kind: "campaign", title: campaign.title,
    subtitle: campaign.description, category: "", categoryLabel: campaign.eyebrow || "Edición especial",
    image: campaign.backgroundMediaType === "image" && campaign.backgroundMediaUrl
      ? campaign.backgroundMediaUrl : getHomeCampaignImage(campaign, "/qr/ceramica-junto-al-tajo-relieve.png"),
    href: campaign.href || "/mapa", cta: campaign.ctaLabel || "Descubrir",
  });
  const today = madridToday();
  const cityName = city?.name ?? "Tu localidad";
  const siteMedia = resolved(siteMediaRead, null);
  return <>
    <HomeStructuredData items={results} cityName={cityName} today={today} />
    <PickyaloHome
      cities={cities.map(({ slug, name }) => ({ slug, name }))}
      citySlug={city?.slug ?? ""} cityName={cityName}
      items={results} today={today}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      entryImages={{
        commerce: siteMedia?.home_entry_commerce.imageUrl ?? "/home/assets/asset_bocadillo_calamares_transparent.png",
        discover: siteMedia?.home_entry_discover.imageUrl ?? "/home/zonas/talavera-elements/talavera_torre_transparent.png",
        events: siteMedia?.home_entry_events.imageUrl ?? "/home/drive/place-08.png",
      }}
    />
  </>;
}
