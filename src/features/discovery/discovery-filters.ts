import { getDistanceInKm, type UserLocation } from "@/features/location/browser-location";
import type { HomeShowcaseItem } from "@/features/venues/types";
export type DiscoveryIntent = "all" | "food" | "local";
export type DiscoveryJourney = {
  distanceKm: number;
  minutes: number;
  mode: "walking" | "driving";
  timeLabel: string;
  quip: string;
};

const ROUTE_DISTANCE_FACTOR = 1.3;
const WALKING_SPEED_KMH = 4.8;
const CITY_DRIVING_SPEED_KMH = 28;
// Use existing categories, never infer the nature of a product from its photograph.
const foodCategory = /comida|casera|española|burger|pizza|sushi|entrante|postre|plato|restaur|bar\b|panader|pasteler|aliment|miel|bebida|gourmet|queso|café|cafeter|tapa|carne|pescado|arroz|ensalada|bocadillo/i;
export function matchesIntent(category: string | null | undefined, intent: DiscoveryIntent) {
  if (intent === "all") return true;
  return intent === "food" ? foodCategory.test(category ?? "") : Boolean(category && !foodCategory.test(category));
}
export function productCategory(item: HomeShowcaseItem) { return item.categoryName?.trim() || "Otros"; }

export function getDiscoveryJourney(
  point: { latitude: number | null; longitude: number | null },
  location: UserLocation | null,
): DiscoveryJourney | null {
  if (
    !location ||
    point.latitude === null ||
    point.longitude === null ||
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude)
  ) {
    return null;
  }

  const distanceKm =
    getDistanceInKm(
      location.latitude,
      location.longitude,
      point.latitude,
      point.longitude,
    ) * ROUTE_DISTANCE_FACTOR;
  const walkingMinutes = Math.max(
    1,
    Math.ceil((distanceKm / WALKING_SPEED_KMH) * 60),
  );

  if (walkingMinutes <= 20) {
    return {
      distanceKm,
      minutes: walkingMinutes,
      mode: "walking",
      timeLabel: `${walkingMinutes} min andando`,
      quip:
        walkingMinutes <= 1
          ? "Aquí al lado"
          : walkingMinutes <= 5
            ? "A un paseo"
            : walkingMinutes <= 12
              ? "Cerquita"
              : "Uf, coge la bici",
    };
  }

  const drivingMinutes = Math.max(
    2,
    Math.ceil((distanceKm / CITY_DRIVING_SPEED_KMH) * 60),
  );

  return {
    distanceKm,
    minutes: drivingMinutes,
    mode: "driving",
    timeLabel: `${drivingMinutes} min en coche`,
    quip: "Mejor con ruedas",
  };
}

export function discoveryDistance(point: { latitude: number | null; longitude: number | null }, location: UserLocation | null) {
  const journey = getDiscoveryJourney(point, location);
  if (!journey) return null;
  const km = journey.distanceKm;
  return km < 1 ? `A ${Math.max(10, Math.round(km * 100) * 10)} m aprox.` : `A ${km.toLocaleString("es-ES", { maximumFractionDigits: 1 })} km aprox.`;
}
