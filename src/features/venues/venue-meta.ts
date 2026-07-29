type VenueCoordinates = {
  latitude: number;
  longitude: number;
};

type VenueCoordinatesInput = {
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
};

const venueCategoryBySlug: Record<string, string> = {
  "la-comida-de-los-dados": "Comida casera",
  "bendita-burger": "Burgers",
  "burger-mc-queens": "Burgers",
  "godzilla-smash-burger": "Burgers",
  "manhattan-burger": "Burgers",
  "pizzeria-carlos-talavera": "Pizza",
  "sushi-talavera": "Sushi",
};

const venueCoordinatesBySlug: Record<string, VenueCoordinates> = {
  "la-comida-de-los-dados": {
    latitude: 39.9594723,
    longitude: -4.8367632,
  },
  "casco-viejo-bar-kitchen": {
    latitude: 39.9594252,
    longitude: -4.831565,
  },
  "taberna-plaza-mayor": {
    latitude: 39.9586912,
    longitude: -4.8327514,
  },
};

const featuredVenueSlugs = new Set(["la-comida-de-los-dados"]);

export function getVenueCoordinates(venueSlug: string) {
  return venueCoordinatesBySlug[venueSlug.toLocaleLowerCase("es")] ?? null;
}

export function resolveVenueCoordinates({
  slug,
  latitude,
  longitude,
}: VenueCoordinatesInput) {
  if (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return { latitude, longitude };
  }

  return getVenueCoordinates(slug);
}

export function isFeaturedVenue(venueSlug: string) {
  return featuredVenueSlugs.has(venueSlug);
}

export function getVenueCategory(venueSlug: string) {
  return venueCategoryBySlug[venueSlug] ?? "Otros";
}

export function resolveVenueCategory(
  venueSlug: string,
  discoveryCategory?: string | null,
) {
  return discoveryCategory?.trim() || getVenueCategory(venueSlug);
}
