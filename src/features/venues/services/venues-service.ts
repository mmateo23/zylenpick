import { getOpeningStatus, normalizeOpeningHours } from "@/features/venues/opening-hours";
import type {
  HomeShowcaseItem,
  MenuItemAllergen,
  VenueDetails,
  VenueListItem,
  VenueMenuItem,
} from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isMissingVenueFeaturedColumnError(message: string) {
  return message.toLowerCase().includes("venues.is_featured");
}

function isMissingHomeFeaturedColumnError(message: string) {
  return message.toLowerCase().includes("menu_items.is_home_featured");
}

function isMissingMenuItemAllergensColumnError(message: string) {
  return message.toLowerCase().includes("menu_items.allergens");
}

function isMissingSubscriptionTierColumnError(message: string) {
  return message.toLowerCase().includes("subscription_tier");
}

function isMissingCityHeroVideoColumnError(message: string) {
  return message.toLowerCase().includes("hero_video_url");
}

export type CitySummary = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
};

const knownMenuItemAllergens = new Set<MenuItemAllergen>([
  "gluten",
  "crustaceos",
  "huevo",
  "pescado",
  "cacahuetes",
  "soja",
  "leche",
  "frutos_de_cascara",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuces",
  "moluscos",
]);

function mapMenuItemAllergens(value?: string[] | null): MenuItemAllergen[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((allergen): allergen is MenuItemAllergen =>
    knownMenuItemAllergens.has(allergen as MenuItemAllergen),
  );
}

function mapVenueListItem(row: {
  id: string;
  slug: string;
  name: string;
  discovery_category: string | null;
  description: string | null;
  cover_url: string | null;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
  pickup_eta_min: number | null;
  is_featured: boolean;
  is_verified: boolean;
  subscription_active: boolean;
  subscription_tier?: "basic" | "oro" | "titanio" | null;
}): VenueListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    discoveryCategory: row.discovery_category,
    description: row.description,
    coverUrl: row.cover_url,
    address: row.address,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    pickupEtaMin: row.pickup_eta_min,
    isFeatured: row.is_featured,
    isVerified: row.is_verified,
    subscriptionActive: row.subscription_active,
    subscriptionTier: row.subscription_tier ?? "basic",
  };
}

function mapVenueMenuItem(row: {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  image_url: string | null;
  allergens?: string[] | null;
  category_name: string | null;
  is_featured: boolean;
  is_home_featured: boolean;
  is_pickup_month_highlight: boolean;
}): VenueMenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceAmount: row.price_amount,
    currency: row.currency,
    imageUrl: row.image_url,
    categoryName: row.category_name,
    allergens: mapMenuItemAllergens(row.allergens),
    isFeatured: row.is_featured,
    isHomeFeatured: row.is_home_featured,
    isPickupMonthHighlight: row.is_pickup_month_highlight,
  };
}

function mapHomeShowcaseItem(row: {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  image_url: string | null;
  allergens?: string[] | null;
  category_name: string | null;
  is_featured: boolean;
  is_home_featured: boolean;
  is_pickup_month_highlight: boolean;
  venues: {
    id: string;
    slug: string;
    name: string;
    address: string | null;
    latitude?: number | null;
    longitude?: number | null;
    cover_url: string | null;
    pickup_eta_min: number | null;
    subscription_active: boolean;
    subscription_tier?: "basic" | "oro" | "titanio" | null;
    cities: {
      slug: string;
      name: string;
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
    categoryName: row.category_name,
    allergens: mapMenuItemAllergens(row.allergens),
    pickupEtaMin: row.venues.pickup_eta_min,
    isFeatured: row.is_featured,
    isHomeFeatured: row.is_home_featured,
    isPickupMonthHighlight: row.is_pickup_month_highlight,
    venue: {
      id: row.venues.id,
      slug: row.venues.slug,
      name: row.venues.name,
      address: row.venues.address,
      latitude: row.venues.latitude ?? null,
      longitude: row.venues.longitude ?? null,
      coverUrl: row.venues.cover_url,
      citySlug: row.venues.cities.slug,
      cityName: row.venues.cities.name,
      subscriptionActive: row.venues.subscription_active,
      subscriptionTier: row.venues.subscription_tier ?? "basic",
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
    .select("id, slug, name, region, hero_image_url, hero_video_url")
    .eq("slug", citySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error && isMissingCityHeroVideoColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("cities")
      .select("id, slug, name, region, hero_image_url")
      .eq("slug", citySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (fallbackError) {
      throw new Error(`Unable to load city: ${fallbackError.message}`);
    }

    if (!fallbackData) {
      return null;
    }

    return {
      id: fallbackData.id,
      slug: fallbackData.slug,
      name: fallbackData.name,
      region: fallbackData.region,
      heroImageUrl: fallbackData.hero_image_url,
      heroVideoUrl: null,
    };
  }

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
    heroVideoUrl: data.hero_video_url ?? null,
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
      "id, slug, name, discovery_category, description, cover_url, address, latitude, longitude, pickup_eta_min, is_featured, is_verified, subscription_active, subscription_tier, cities!inner(slug)",
    )
    .eq("is_active", true)
    .eq("is_published", true)
    .eq("cities.slug", citySlug)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (
    error &&
    (isMissingVenueFeaturedColumnError(error.message) ||
      isMissingSubscriptionTierColumnError(error.message))
  ) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("venues")
      .select(
        "id, slug, name, discovery_category, description, cover_url, address, latitude, longitude, pickup_eta_min, is_verified, subscription_active, cities!inner(slug)",
      )
      .eq("is_active", true)
      .eq("is_published", true)
      .eq("cities.slug", citySlug)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });

    if (fallbackError) {
      throw new Error(`Unable to load venues: ${fallbackError.message}`);
    }

    return fallbackData.map((venue) =>
      mapVenueListItem({
        ...venue,
        is_featured: false,
        subscription_tier: "basic",
      }),
    );
  }

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
      "id, slug, name, description, cover_url, logo_url, address, latitude, longitude, email, phone, website, opening_hours, pickup_notes, pickup_eta_min, is_verified, subscription_active, subscription_tier, cities!inner(slug, name)",
    )
    .eq("slug", venueSlug)
    .eq("is_active", true)
    .eq("is_published", true)
    .eq("cities.slug", citySlug)
    .maybeSingle();

  if (venueError && isMissingSubscriptionTierColumnError(venueError.message)) {
    const { data: fallbackVenue, error: fallbackVenueError } = await supabase
      .from("venues")
      .select(
        "id, slug, name, description, cover_url, logo_url, address, latitude, longitude, email, phone, website, opening_hours, pickup_notes, pickup_eta_min, is_verified, subscription_active, cities!inner(slug, name)",
      )
      .eq("slug", venueSlug)
      .eq("is_active", true)
      .eq("is_published", true)
      .eq("cities.slug", citySlug)
      .maybeSingle();

    if (fallbackVenueError) {
      throw new Error(`Unable to load venue: ${fallbackVenueError.message}`);
    }

    if (!fallbackVenue) {
      return null;
    }

    const { data: menuItems, error: menuError } = await supabase
      .from("menu_items")
      .select(
        "id, name, description, price_amount, currency, image_url, allergens, category_name, is_featured, is_home_featured, is_pickup_month_highlight",
      )
      .eq("venue_id", fallbackVenue.id)
      .eq("is_available", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (
      menuError &&
      (isMissingHomeFeaturedColumnError(menuError.message) ||
        isMissingMenuItemAllergensColumnError(menuError.message))
    ) {
      const { data: fallbackMenuItems, error: fallbackMenuError } = await supabase
        .from("menu_items")
        .select(
          "id, name, description, price_amount, currency, image_url, category_name, is_featured, is_pickup_month_highlight",
        )
        .eq("venue_id", fallbackVenue.id)
        .eq("is_available", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (fallbackMenuError) {
        throw new Error(`Unable to load menu items: ${fallbackMenuError.message}`);
      }

      const openingHours = normalizeOpeningHours(fallbackVenue.opening_hours);
      const openingStatus = getOpeningStatus(openingHours);

      return {
        id: fallbackVenue.id,
        slug: fallbackVenue.slug,
        name: fallbackVenue.name,
        description: fallbackVenue.description,
        coverUrl: fallbackVenue.cover_url,
        logoUrl: fallbackVenue.logo_url,
        address: fallbackVenue.address,
        latitude: fallbackVenue.latitude ?? null,
        longitude: fallbackVenue.longitude ?? null,
        email: fallbackVenue.email,
        phone: fallbackVenue.phone,
        website: fallbackVenue.website,
        pickupNotes: fallbackVenue.pickup_notes,
        pickupEtaMin: fallbackVenue.pickup_eta_min,
        isVerified: fallbackVenue.is_verified,
        subscriptionActive: fallbackVenue.subscription_active,
        subscriptionTier: "basic",
        openingHours,
        isOpenNow: openingStatus.isOpenNow,
        city: {
          slug: fallbackVenue.cities.slug,
          name: fallbackVenue.cities.name,
        },
        menuItems: fallbackMenuItems.map((item) =>
          mapVenueMenuItem({
            ...item,
            is_home_featured: false,
            allergens: [],
          }),
        ),
      };
    }

    if (menuError) {
      throw new Error(`Unable to load menu items: ${menuError.message}`);
    }

    const openingHours = normalizeOpeningHours(fallbackVenue.opening_hours);
    const openingStatus = getOpeningStatus(openingHours);

    return {
      id: fallbackVenue.id,
      slug: fallbackVenue.slug,
      name: fallbackVenue.name,
      description: fallbackVenue.description,
      coverUrl: fallbackVenue.cover_url,
      logoUrl: fallbackVenue.logo_url,
      address: fallbackVenue.address,
      latitude: fallbackVenue.latitude ?? null,
      longitude: fallbackVenue.longitude ?? null,
      email: fallbackVenue.email,
      phone: fallbackVenue.phone,
      website: fallbackVenue.website,
      pickupNotes: fallbackVenue.pickup_notes,
      pickupEtaMin: fallbackVenue.pickup_eta_min,
      isVerified: fallbackVenue.is_verified,
      subscriptionActive: fallbackVenue.subscription_active,
      subscriptionTier: "basic",
      openingHours,
      isOpenNow: openingStatus.isOpenNow,
      city: {
        slug: fallbackVenue.cities.slug,
        name: fallbackVenue.cities.name,
      },
      menuItems: menuItems.map(mapVenueMenuItem),
    };
  }

  if (venueError) {
    throw new Error(`Unable to load venue: ${venueError.message}`);
  }

  if (!venue) {
    return null;
  }

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select(
      "id, name, description, price_amount, currency, image_url, allergens, category_name, is_featured, is_home_featured, is_pickup_month_highlight",
    )
    .eq("venue_id", venue.id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (
    menuError &&
    (isMissingHomeFeaturedColumnError(menuError.message) ||
      isMissingMenuItemAllergensColumnError(menuError.message))
  ) {
    const { data: fallbackMenuItems, error: fallbackMenuError } = await supabase
      .from("menu_items")
      .select(
        "id, name, description, price_amount, currency, image_url, category_name, is_featured, is_pickup_month_highlight",
      )
      .eq("venue_id", venue.id)
      .eq("is_available", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (fallbackMenuError) {
      throw new Error(`Unable to load menu items: ${fallbackMenuError.message}`);
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
      latitude: venue.latitude ?? null,
      longitude: venue.longitude ?? null,
      email: venue.email,
      phone: venue.phone,
      website: venue.website,
      pickupNotes: venue.pickup_notes,
      pickupEtaMin: venue.pickup_eta_min,
      isVerified: venue.is_verified,
      subscriptionActive: venue.subscription_active,
      subscriptionTier: venue.subscription_tier ?? "basic",
      openingHours,
      isOpenNow: openingStatus.isOpenNow,
      city: {
        slug: venue.cities.slug,
        name: venue.cities.name,
      },
      menuItems: fallbackMenuItems.map((item) =>
        mapVenueMenuItem({
          ...item,
          is_home_featured: false,
          allergens: [],
        }),
      ),
    };
  }

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
    latitude: venue.latitude ?? null,
    longitude: venue.longitude ?? null,
    email: venue.email,
    phone: venue.phone,
    website: venue.website,
    pickupNotes: venue.pickup_notes,
      pickupEtaMin: venue.pickup_eta_min,
      isVerified: venue.is_verified,
      subscriptionActive: venue.subscription_active,
      subscriptionTier: venue.subscription_tier ?? "basic",
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
      "id, name, description, price_amount, currency, image_url, allergens, category_name, is_featured, is_home_featured, is_pickup_month_highlight, venues!inner(id, slug, name, address, latitude, longitude, cover_url, pickup_eta_min, subscription_active, subscription_tier, is_active, is_published, cities!inner(slug, name))",
    )
    .eq("is_available", true)
    .eq("venues.is_active", true)
    .eq("venues.is_published", true)
    .not("image_url", "is", null)
    .order("is_home_featured", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(60);

  if (
    error &&
    (isMissingHomeFeaturedColumnError(error.message) ||
      isMissingMenuItemAllergensColumnError(error.message) ||
      isMissingSubscriptionTierColumnError(error.message))
  ) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("menu_items")
      .select(
        "id, name, description, price_amount, currency, image_url, category_name, is_featured, is_pickup_month_highlight, venues!inner(id, slug, name, address, latitude, longitude, cover_url, pickup_eta_min, subscription_active, is_active, is_published, cities!inner(slug, name))",
      )
      .eq("is_available", true)
      .eq("venues.is_active", true)
      .eq("venues.is_published", true)
      .not("image_url", "is", null)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(60);

    if (fallbackError) {
      throw new Error(`Unable to load home showcase: ${fallbackError.message}`);
    }

    const featuredRows = fallbackData.filter((item) => item.is_featured);
    const regularRows = fallbackData.filter((item) => !item.is_featured);
    const featuredItems = [...featuredRows, ...regularRows].map((item) =>
        mapHomeShowcaseItem({
          ...item,
          allergens: [],
          is_home_featured: false,
          venues: {
            ...item.venues,
            subscription_tier: "basic",
          },
        }),
      );
    const latestItems = regularRows.map((item) =>
      mapHomeShowcaseItem({
        ...item,
        allergens: [],
        is_home_featured: false,
        venues: {
          ...item.venues,
          subscription_tier: "basic",
        },
      }),
    );

    return {
      featuredItems,
      latestItems:
        latestItems.length > 0 ? latestItems : featuredItems.slice(0, 6),
    };
  }

  if (error) {
    throw new Error(`Unable to load home showcase: ${error.message}`);
  }

  const homeFeaturedRows = data.filter((item) => item.is_home_featured);
  const featuredRows = data.filter(
    (item) => !item.is_home_featured && item.is_featured,
  );
  const regularRows = data.filter(
    (item) => !item.is_home_featured && !item.is_featured,
  );

  // Priorizamos los platos de home y completamos con destacados y resto si faltan.
  const featuredItems = [...homeFeaturedRows, ...featuredRows, ...regularRows].map(
    mapHomeShowcaseItem,
  );
  const latestItems = regularRows.map(mapHomeShowcaseItem);

  return {
    featuredItems,
    latestItems:
      latestItems.length > 0 ? latestItems : featuredItems.slice(0, 6),
  };
}
