import { getPublishedExploreMapEntries } from "@/features/explore/services/explore-service";
import { getPublishedMapPlaces } from "@/features/map-places/services/map-places-service";
import type { VenueQrSponsor } from "@/features/venues/qr-sponsor-config";
import { resolveVenueCoordinates } from "@/features/venues/venue-meta";
import type { VenueDetails } from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type VenueQrNearbyCard = {
  id: string;
  kind: "place" | "route";
  title: string;
  eyebrow: string;
  description: string;
  imageUrl: string;
  href: string;
  distanceMeters: number;
};

export async function getVenueQrSponsor(
  venueId: string,
  venueSlug: string,
): Promise<VenueQrSponsor | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venue_qr_promotions")
    .select(
      "id, brand_name, headline, description, image_url, related_menu_item_id, starts_at, ends_at",
    )
    .eq("venue_id", venueId)
    .eq("is_enabled", true)
    .maybeSingle();

  // Promotions are optional and must never prevent the QR menu from loading.
  if (error || !data) return null;

  return {
    id: data.id,
    venueSlug,
    brandName: data.brand_name,
    headline: data.headline,
    description: data.description,
    productImageUrl: data.image_url,
    relatedMenuItemId: data.related_menu_item_id,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    href: null,
  };
}

function getDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = ((latitudeB - latitudeA) * Math.PI) / 180;
  const longitudeDelta = ((longitudeB - longitudeA) * Math.PI) / 180;
  const normalizedLatitudeA = (latitudeA * Math.PI) / 180;
  const normalizedLatitudeB = (latitudeB * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(normalizedLatitudeA) *
      Math.cos(normalizedLatitudeB) *
      Math.sin(longitudeDelta / 2) ** 2;

  return Math.round(
    2 *
      earthRadiusMeters *
      Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)),
  );
}

export async function getVenueQrNearby(
  venue: Pick<
    VenueDetails,
    "slug" | "latitude" | "longitude" | "city"
  >,
): Promise<VenueQrNearbyCard[]> {
  const coordinates = resolveVenueCoordinates(venue);
  if (!coordinates) return [];

  const [placesResult, exploreResult] = await Promise.allSettled([
    getPublishedMapPlaces(),
    getPublishedExploreMapEntries(),
  ]);
  if (placesResult.status === "rejected") return [];

  const places = placesResult.value
    .filter(
      (place) =>
        place.city.slug === venue.city.slug &&
        Boolean(place.coverImageUrl) &&
        Boolean(place.description || place.story),
    )
    .map((place) => ({
      place,
      distanceMeters: getDistanceMeters(
        coordinates.latitude,
        coordinates.longitude,
        place.latitude,
        place.longitude,
      ),
    }))
    .filter((entry) => entry.distanceMeters <= 5_000)
    .sort((first, second) => first.distanceMeters - second.distanceMeters);

  const exploreEntries =
    exploreResult.status === "fulfilled" ? exploreResult.value : [];
  const exploreByPlaceId = new Map(
    exploreEntries.map((entry) => [entry.mapPlaceId, entry]),
  );
  const routeCandidate = places.find(({ place }) =>
    exploreByPlaceId.has(place.id),
  );
  const placeCandidate = places.find(
    ({ place }) => place.id !== routeCandidate?.place.id,
  );
  const cards: VenueQrNearbyCard[] = [];

  if (placeCandidate?.place.coverImageUrl) {
    cards.push({
      id: placeCandidate.place.id,
      kind: "place",
      title: placeCandidate.place.name,
      eyebrow: "A un paseo",
      description:
        placeCandidate.place.description ?? placeCandidate.place.story ?? "",
      imageUrl: placeCandidate.place.coverImageUrl,
      href: `/mapa?lugar=${encodeURIComponent(placeCandidate.place.slug)}`,
      distanceMeters: placeCandidate.distanceMeters,
    });
  }

  if (routeCandidate) {
    const route = exploreByPlaceId.get(routeCandidate.place.id);
    if (route) {
      cards.push({
        id: `${route.routeSlug}:${route.pointSlug}`,
        kind: "route",
        title: route.routeName,
        eyebrow: "Explora la ciudad",
        description: route.introduction,
        imageUrl: route.imageUrl,
        href: `/explora/${route.routeSlug}/${route.pointSlug}?unlock=${encodeURIComponent(route.publicToken)}`,
        distanceMeters: routeCandidate.distanceMeters,
      });
    }
  }

  return cards.slice(0, 2);
}
