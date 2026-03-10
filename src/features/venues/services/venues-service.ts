import { getOpeningStatus, normalizeOpeningHours } from "@/features/venues/opening-hours";
import type {
  HomeShowcaseItem,
  VenueDetails,
  VenueListItem,
  VenueMenuItem,
} from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CitySummary = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  heroImageUrl: string | null;
};

function mapVenueListItem(row: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  address: string | null;
  pickup_eta_min: number | null;
  is_verified: boolean;
  subscription_active: boolean;
}): VenueListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    coverUrl: row.cover_url,
    address: row.address,
    pickupEtaMin: row.pickup_eta_min,
    isVerified: row.is_verified,
    subscriptionActive: row.subscription_active,
  };
}

function mapVenueMenuItem(row: {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  image_url: string | null;
  category_name: string | null;
}): VenueMenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceAmount: row.price_amount,
    currency: row.currency,
    imageUrl: row.image_url,
    categoryName: row.category_name,
  };
}

function mapHomeShowcaseItem(row: {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  image_url: string | null;
  venues: {
    slug: string;
    name: string;
    pickup_eta_min: number | null;
    cities: {
      slug: string;
    };
  };
}): HomeShowcaseItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceAmount: row.price_amount,
    currency: row.currency,
    imageUrl: row.image_url,
    pickupEtaMin: row.venues.pickup_eta_min,
    venue: {
      slug: row.venues.slug,
      name: row.venues.name,
      citySlug: row.venues.cities.slug,
    },
  };
}

export async function getCityBySlug(
  citySlug: string,
): Promise<CitySummary | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, name, region, hero_image_url")
    .eq("slug", citySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load city: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    region: data.region,
    heroImageUrl: data.hero_image_url,
  };
}

export async function getVenuesByCitySlug(
  citySlug: string,
): Promise<VenueListItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id, slug, name, description, cover_url, address, pickup_eta_min, is_verified, subscription_active, cities!inner(slug)",
    )
    .eq("is_active", true)
    .eq("is_published", true)
    .eq("cities.slug", citySlug)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load venues: ${error.message}`);
  }

  return data.map(mapVenueListItem);
}

export async function getVenueDetails(
  citySlug: string,
  venueSlug: string,
): Promise<VenueDetails | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select(
      "id, slug, name, description, cover_url, logo_url, address, email, phone, opening_hours, pickup_notes, pickup_eta_min, is_verified, subscription_active, cities!inner(slug, name)",
    )
    .eq("slug", venueSlug)
    .eq("is_active", true)
    .eq("is_published", true)
    .eq("cities.slug", citySlug)
    .maybeSingle();

  if (venueError) {
    throw new Error(`Unable to load venue: ${venueError.message}`);
  }

  if (!venue) {
    return null;
  }

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select(
      "id, name, description, price_amount, currency, image_url, category_name",
    )
    .eq("venue_id", venue.id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (menuError) {
    throw new Error(`Unable to load menu items: ${menuError.message}`);
  }

  const openingHours = normalizeOpeningHours(venue.opening_hours);
  const openingStatus = getOpeningStatus(openingHours);

  return {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    description: venue.description,
    coverUrl: venue.cover_url,
    logoUrl: venue.logo_url,
    address: venue.address,
    email: venue.email,
    phone: venue.phone,
    pickupNotes: venue.pickup_notes,
    pickupEtaMin: venue.pickup_eta_min,
    isVerified: venue.is_verified,
    subscriptionActive: venue.subscription_active,
    openingHours,
    isOpenNow: openingStatus.isOpenNow,
    city: {
      slug: venue.cities.slug,
      name: venue.cities.name,
    },
    menuItems: menuItems.map(mapVenueMenuItem),
  };
}

export async function getHomeShowcase(): Promise<{
  featuredItems: HomeShowcaseItem[];
  latestItems: HomeShowcaseItem[];
}> {
  if (!isSupabaseConfigured()) {
    return {
      featuredItems: [],
      latestItems: [],
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, name, description, price_amount, currency, image_url, venues!inner(slug, name, pickup_eta_min, is_active, is_published, cities!inner(slug))",
    )
    .eq("is_available", true)
    .eq("venues.is_active", true)
    .eq("venues.is_published", true)
    .not("image_url", "is", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(12);

  if (error) {
    throw new Error(`Unable to load home showcase: ${error.message}`);
  }

  const items = data.map(mapHomeShowcaseItem);
  const featuredItems = items.slice(0, 6);
  const latestItems = items.slice(6, 12);

  return {
    featuredItems,
    latestItems: latestItems.length > 0 ? latestItems : items.slice(0, 6),
  };
}
