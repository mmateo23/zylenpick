type VenueCoordinates = {
  latitude: number;
  longitude: number;
};

const venueCoordinatesBySlug: Record<string, VenueCoordinates> = {
  "la-comida-de-los-dados": {
    latitude: 39.9636,
    longitude: -4.8304,
  },
  "bendita-burger": {
    latitude: 39.9627,
    longitude: -4.8292,
  },
  "burger-mc-queens": {
    latitude: 39.9641,
    longitude: -4.8286,
  },
  "godzilla-smash-burger": {
    latitude: 39.9651,
    longitude: -4.8322,
  },
  "manhattan-burger": {
    latitude: 39.9617,
    longitude: -4.8275,
  },
  "pizzeria-carlos-talavera": {
    latitude: 39.9609,
    longitude: -4.8331,
  },
  "sushi-talavera": {
    latitude: 39.9648,
    longitude: -4.8269,
  },
};

const featuredVenueSlugs = new Set(["la-comida-de-los-dados"]);

export function getVenueCoordinates(venueSlug: string) {
  return venueCoordinatesBySlug[venueSlug] ?? null;
}

export function isFeaturedVenue(venueSlug: string) {
  return featuredVenueSlugs.has(venueSlug);
}
