import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type VenueMapItem = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  city: {
    slug: string;
    name: string;
  };
};

type VenueMapRow = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cities: {
    slug: string;
    name: string;
  };
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

const geocoderUserAgent =
  "ZylenPick map prototype (contact: studio@zylenpick.com)";

function normalizeAddressQuery(row: VenueMapRow) {
  const address = row.address
    ?.replace(/\bPl\.\s*/i, "Plaza ")
    .replace(/\bPadre J\.\s*de Mariana\b/i, "Padre Juan de Mariana")
    .replace(/\b45600,?\s*/g, "")
    .trim();

  if (!address) {
    return null;
  }

  return `${address}, ${row.cities.name}, Toledo, Spain`;
}

function parseMapboxCenter(center: [number, number] | undefined) {
  if (!center) {
    return null;
  }

  const [longitude, latitude] = center;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

async function geocodeWithNominatim(query: string): Promise<Coordinates | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "es,en;q=0.8",
        "User-Agent": geocoderUserAgent,
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
    }>;
    const result = payload[0];

    if (!result?.lat || !result.lon) {
      return null;
    }

    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
}

async function geocodeWithMapbox(query: string): Promise<Coordinates | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("country", "es");
  url.searchParams.set("language", "es");
  url.searchParams.set("limit", "3");

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      features?: Array<{
        center?: [number, number];
        place_name?: string;
        properties?: {
          accuracy?: string;
        };
      }>;
    };
    const feature = payload.features?.find((candidate) => {
      const placeName = candidate.place_name?.toLowerCase() ?? "";
      const accuracy = candidate.properties?.accuracy;

      return (
        accuracy === "rooftop" ||
        accuracy === "street" ||
        (!placeName.startsWith("45600") &&
          !placeName.includes("talavera de la reina, provincia de toledo"))
      );
    });

    return parseMapboxCenter(feature?.center);
  } catch {
    return null;
  }
}

async function geocodeVenueAddress(row: VenueMapRow) {
  const query = normalizeAddressQuery(row);

  if (!query) {
    return null;
  }

  return (await geocodeWithNominatim(query)) ?? geocodeWithMapbox(query);
}

async function mapVenueMapItem(row: VenueMapRow): Promise<VenueMapItem | null> {
  const coordinates =
    row.latitude !== null && row.longitude !== null
      ? { latitude: row.latitude, longitude: row.longitude }
      : await geocodeVenueAddress(row);

  if (!coordinates) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    address: row.address,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    city: {
      slug: row.cities.slug,
      name: row.cities.name,
    },
  };
}

export async function getVenuesForMap(): Promise<VenueMapItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id, slug, name, address, latitude, longitude, cities!inner(slug, name)",
    )
    .eq("is_active", true)
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load map venues: ${error.message}`);
  }

  const venues = await Promise.all(data.map(mapVenueMapItem));

  return venues.filter((venue): venue is VenueMapItem => Boolean(venue));
}
