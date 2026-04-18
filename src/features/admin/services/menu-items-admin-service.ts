import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { createAdminMutationClient } from "@/features/admin/services/admin-auth";
import type { MenuItemAllergen } from "@/features/venues/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminVenueContext = {
  id: string;
  name: string;
  slug: string;
};

export type AdminMenuItemListItem = {
  id: string;
  name: string;
  venueId: string;
  venueName: string | null;
  cityId: string | null;
  cityName: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  priceAmount: number;
  currency: string;
  sortOrder: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isHomeFeatured: boolean;
  isPickupMonthHighlight: boolean;
};

export type AdminHighlightedVenueListItem = {
  id: string;
  name: string;
  slug: string;
  coverUrl: string | null;
  cityId: string | null;
  cityName: string | null;
  isFeatured: boolean;
};

export type AdminMenuItemFormValues = {
  id: string;
  venueId: string;
  name: string;
  description: string;
  price: string;
  categoryName: string;
  imageUrl: string;
  sortOrder: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isHomeFeatured: boolean;
  isPickupMonthHighlight: boolean;
  allergens: MenuItemAllergen[];
};

type NormalizedMenuItemFormValues = Omit<AdminMenuItemFormValues, "id" | "venueId">;

type PublicVenuePathContext = {
  citySlug: string;
  venueSlug: string;
};

function isMissingFeaturedColumnError(message: string) {
  return message.toLowerCase().includes("menu_items.is_featured");
}

function isMissingPickupMonthHighlightColumnError(message: string) {
  return message
    .toLowerCase()
    .includes("menu_items.is_pickup_month_highlight");
}

function isMissingHomeFeaturedColumnError(message: string) {
  return message.toLowerCase().includes("menu_items.is_home_featured");
}

function isMissingMenuItemAllergensColumnError(message: string) {
  return message.toLowerCase().includes("menu_items.allergens");
}

function isMissingHighlightColumnError(message: string) {
  return (
    isMissingFeaturedColumnError(message) ||
    isMissingHomeFeaturedColumnError(message) ||
    isMissingPickupMonthHighlightColumnError(message)
  );
}

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

function normalizeMenuItemAllergens(values: FormDataEntryValue[]) {
  return values
    .map((value) => String(value))
    .filter((value): value is MenuItemAllergen =>
      knownMenuItemAllergens.has(value as MenuItemAllergen),
    );
}

function parsePriceToMinorUnits(price: string) {
  const normalizedValue = price.replace(",", ".").trim();

  if (!normalizedValue) {
    throw new Error("El precio es obligatorio.");
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error("El precio no es válido.");
  }

  return Math.round(parsedValue * 100);
}

function normalizeMenuItemFormValues(formData: FormData): NormalizedMenuItemFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    categoryName: String(formData.get("categoryName") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    sortOrder: String(formData.get("sortOrder") ?? "").trim(),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isHomeFeatured: formData.get("isHomeFeatured") === "on",
    isPickupMonthHighlight: formData.get("isPickupMonthHighlight") === "on",
    allergens: normalizeMenuItemAllergens(formData.getAll("allergens")),
  };
}

async function getPublicVenuePathContextById(
  venueId: string,
): Promise<PublicVenuePathContext | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select("slug, cities!inner(slug)")
    .eq("id", venueId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load public venue path: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    citySlug: data.cities.slug,
    venueSlug: data.slug,
  };
}

function revalidatePublicVenuePaths(pathContext: PublicVenuePathContext | null) {
  if (!pathContext) {
    revalidatePath("/");
    return;
  }

  revalidatePath("/");
  revalidatePath("/zonas");
  revalidatePath(`/zonas/${pathContext.citySlug}`);
  revalidatePath(`/zonas/${pathContext.citySlug}/venues/${pathContext.venueSlug}`);
}

export async function getAdminVenueContext(
  venueId: string,
): Promise<AdminVenueContext | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug")
    .eq("id", venueId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load admin venue context: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
  };
}

export async function getAdminMenuItemsByVenueId(
  venueId: string,
): Promise<AdminMenuItemListItem[]> {
  const supabase = createSupabaseServerClient();
  const baseQuery = supabase
    .from("menu_items")
    .select(
      "id, venue_id, name, category_name, image_url, price_amount, currency, sort_order, is_available, is_featured, is_home_featured, is_pickup_month_highlight, venues(name, city_id, cities(name))",
    )
    .eq("venue_id", venueId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const { data, error } = await baseQuery;

  if (error && isMissingHighlightColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("menu_items")
      .select(
        "id, venue_id, name, category_name, image_url, price_amount, currency, sort_order, is_available, venues(name, city_id, cities(name))",
      )
      .eq("venue_id", venueId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (fallbackError) {
      throw new Error(`Unable to load admin menu items: ${fallbackError.message}`);
    }

    return fallbackData.map((item) => ({
      id: item.id,
      name: item.name,
      venueId: item.venue_id,
      venueName: item.venues?.name ?? null,
      cityId: item.venues?.city_id ?? null,
      cityName: item.venues?.cities?.name ?? null,
      categoryName: item.category_name,
      imageUrl: item.image_url,
      priceAmount: item.price_amount,
      currency: item.currency,
      sortOrder: item.sort_order,
      isAvailable: item.is_available,
      isFeatured: false,
      isHomeFeatured: false,
      isPickupMonthHighlight: false,
    }));
  }

  if (error) {
    throw new Error(`Unable to load admin menu items: ${error.message}`);
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    venueId: item.venue_id,
    venueName: item.venues?.name ?? null,
    cityId: item.venues?.city_id ?? null,
    cityName: item.venues?.cities?.name ?? null,
    categoryName: item.category_name,
    imageUrl: item.image_url,
    priceAmount: item.price_amount,
    currency: item.currency,
    sortOrder: item.sort_order,
    isAvailable: item.is_available,
    isFeatured: item.is_featured,
    isHomeFeatured: item.is_home_featured,
    isPickupMonthHighlight: item.is_pickup_month_highlight,
  }));
}

export async function getAdminMenuItemById(
  venueId: string,
  menuItemId: string,
): Promise<AdminMenuItemFormValues | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, venue_id, name, description, price_amount, category_name, image_url, allergens, sort_order, is_available, is_featured, is_home_featured, is_pickup_month_highlight",
    )
    .eq("venue_id", venueId)
    .eq("id", menuItemId)
    .maybeSingle();

  if (error && isMissingMenuItemAllergensColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("menu_items")
      .select(
        "id, venue_id, name, description, price_amount, category_name, image_url, sort_order, is_available, is_featured, is_home_featured, is_pickup_month_highlight",
      )
      .eq("venue_id", venueId)
      .eq("id", menuItemId)
      .maybeSingle();

    if (fallbackError) {
      throw new Error(`Unable to load admin menu item: ${fallbackError.message}`);
    }

    if (!fallbackData) {
      return null;
    }

    return {
      id: fallbackData.id,
      venueId: fallbackData.venue_id,
      name: fallbackData.name,
      description: fallbackData.description ?? "",
      price: (fallbackData.price_amount / 100).toFixed(2).replace(".", ","),
      categoryName: fallbackData.category_name ?? "",
      imageUrl: fallbackData.image_url ?? "",
      sortOrder: fallbackData.sort_order.toString(),
      isAvailable: fallbackData.is_available,
      isFeatured: fallbackData.is_featured,
      isHomeFeatured: fallbackData.is_home_featured,
      isPickupMonthHighlight: fallbackData.is_pickup_month_highlight,
      allergens: [],
    };
  }

  if (error && isMissingHighlightColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("menu_items")
      .select(
        "id, venue_id, name, description, price_amount, category_name, image_url, sort_order, is_available",
      )
      .eq("venue_id", venueId)
      .eq("id", menuItemId)
      .maybeSingle();

    if (fallbackError) {
      throw new Error(`Unable to load admin menu item: ${fallbackError.message}`);
    }

    if (!fallbackData) {
      return null;
    }

    return {
      id: fallbackData.id,
      venueId: fallbackData.venue_id,
      name: fallbackData.name,
      description: fallbackData.description ?? "",
      price: (fallbackData.price_amount / 100).toFixed(2).replace(".", ","),
      categoryName: fallbackData.category_name ?? "",
      imageUrl: fallbackData.image_url ?? "",
      sortOrder: fallbackData.sort_order.toString(),
      isAvailable: fallbackData.is_available,
      isFeatured: false,
      isHomeFeatured: false,
      isPickupMonthHighlight: false,
      allergens: [],
    };
  }

  if (error) {
    throw new Error(`Unable to load admin menu item: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    venueId: data.venue_id,
    name: data.name,
    description: data.description ?? "",
    price: (data.price_amount / 100).toFixed(2).replace(".", ","),
    categoryName: data.category_name ?? "",
    imageUrl: data.image_url ?? "",
    sortOrder: data.sort_order.toString(),
    isAvailable: data.is_available,
    isFeatured: data.is_featured,
    isHomeFeatured: data.is_home_featured,
    isPickupMonthHighlight: data.is_pickup_month_highlight,
    allergens: normalizeMenuItemAllergens(data.allergens ?? []),
  };
}

export async function createMenuItemAction(venueId: string, formData: FormData) {
  "use server";

  const values = normalizeMenuItemFormValues(formData);
  const priceAmount = parsePriceToMinorUnits(values.price);
  const supabase = await createAdminMutationClient();
  const publicPath = await getPublicVenuePathContextById(venueId);

  const { error } = await supabase.from("menu_items").insert({
    venue_id: venueId,
    name: values.name,
    description: values.description || null,
    price_amount: priceAmount,
    currency: "EUR",
    image_url: values.imageUrl || null,
    category_name: values.categoryName || null,
    allergens: values.allergens,
    sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
    is_available: values.isAvailable,
    is_featured: values.isFeatured,
    is_home_featured: values.isHomeFeatured,
    is_pickup_month_highlight: values.isPickupMonthHighlight,
  });

  if (error && isMissingMenuItemAllergensColumnError(error.message)) {
    const { error: fallbackError } = await supabase.from("menu_items").insert({
      venue_id: venueId,
      name: values.name,
      description: values.description || null,
      price_amount: priceAmount,
      currency: "EUR",
      image_url: values.imageUrl || null,
      category_name: values.categoryName || null,
      sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
      is_available: values.isAvailable,
      is_featured: values.isFeatured,
      is_home_featured: values.isHomeFeatured,
      is_pickup_month_highlight: values.isPickupMonthHighlight,
    });

    if (fallbackError) {
      throw new Error(`Unable to create menu item: ${fallbackError.message}`);
    }

    revalidatePublicVenuePaths(publicPath);
    redirect(`/panel/locales/${venueId}/platos`);
  }

  if (error && isMissingHighlightColumnError(error.message)) {
    const { error: fallbackError } = await supabase.from("menu_items").insert({
      venue_id: venueId,
      name: values.name,
      description: values.description || null,
      price_amount: priceAmount,
      currency: "EUR",
      image_url: values.imageUrl || null,
      category_name: values.categoryName || null,
      sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
      is_available: values.isAvailable,
    });

    if (fallbackError) {
      throw new Error(`Unable to create menu item: ${fallbackError.message}`);
    }

    revalidatePublicVenuePaths(publicPath);
    redirect(`/panel/locales/${venueId}/platos`);
  }

  if (error) {
    throw new Error(`Unable to create menu item: ${error.message}`);
  }

  revalidatePublicVenuePaths(publicPath);
  redirect(`/panel/locales/${venueId}/platos`);
}

export async function updateMenuItemAction(
  venueId: string,
  menuItemId: string,
  formData: FormData,
) {
  "use server";

  const values = normalizeMenuItemFormValues(formData);
  const priceAmount = parsePriceToMinorUnits(values.price);
  const supabase = await createAdminMutationClient();
  const publicPath = await getPublicVenuePathContextById(venueId);

  const { error } = await supabase
    .from("menu_items")
    .update({
      name: values.name,
      description: values.description || null,
      price_amount: priceAmount,
      image_url: values.imageUrl || null,
      category_name: values.categoryName || null,
      allergens: values.allergens,
      sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
      is_available: values.isAvailable,
      is_featured: values.isFeatured,
      is_home_featured: values.isHomeFeatured,
      is_pickup_month_highlight: values.isPickupMonthHighlight,
    })
    .eq("venue_id", venueId)
    .eq("id", menuItemId);

  if (error && isMissingMenuItemAllergensColumnError(error.message)) {
    const { error: fallbackError } = await supabase
      .from("menu_items")
      .update({
        name: values.name,
        description: values.description || null,
        price_amount: priceAmount,
        image_url: values.imageUrl || null,
        category_name: values.categoryName || null,
        sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
        is_available: values.isAvailable,
        is_featured: values.isFeatured,
        is_home_featured: values.isHomeFeatured,
        is_pickup_month_highlight: values.isPickupMonthHighlight,
      })
      .eq("venue_id", venueId)
      .eq("id", menuItemId);

    if (fallbackError) {
      throw new Error(`Unable to update menu item: ${fallbackError.message}`);
    }

    revalidatePublicVenuePaths(publicPath);
    redirect(`/panel/locales/${venueId}/platos`);
  }

  if (error && isMissingHighlightColumnError(error.message)) {
    const { error: fallbackError } = await supabase
      .from("menu_items")
      .update({
        name: values.name,
        description: values.description || null,
        price_amount: priceAmount,
        image_url: values.imageUrl || null,
        category_name: values.categoryName || null,
        sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
        is_available: values.isAvailable,
      })
      .eq("venue_id", venueId)
      .eq("id", menuItemId);

    if (fallbackError) {
      throw new Error(`Unable to update menu item: ${fallbackError.message}`);
    }

    revalidatePublicVenuePaths(publicPath);
    redirect(`/panel/locales/${venueId}/platos`);
  }

  if (error) {
    throw new Error(`Unable to update menu item: ${error.message}`);
  }

  revalidatePublicVenuePaths(publicPath);
  redirect(`/panel/locales/${venueId}/platos`);
}

export async function toggleMenuItemAvailabilityAction(
  venueId: string,
  menuItemId: string,
  nextAvailability: boolean,
) {
  "use server";

  const supabase = await createAdminMutationClient();
  const publicPath = await getPublicVenuePathContextById(venueId);
  const { error } = await supabase
    .from("menu_items")
    .update({
      is_available: nextAvailability,
    })
    .eq("venue_id", venueId)
    .eq("id", menuItemId);

  if (error) {
    throw new Error(`Unable to toggle menu item availability: ${error.message}`);
  }

  revalidatePublicVenuePaths(publicPath);
  redirect(`/panel/locales/${venueId}/platos`);
}

async function getMenuItemPublicPathContext(
  menuItemId: string,
): Promise<PublicVenuePathContext | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("venues!inner(slug, cities!inner(slug))")
    .eq("id", menuItemId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load menu item public path: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    citySlug: data.venues.cities.slug,
    venueSlug: data.venues.slug,
  };
}

export async function toggleMenuItemFeaturedAction(
  menuItemId: string,
  nextFeaturedState: boolean,
) {
  "use server";

  const supabase = await createAdminMutationClient();
  const publicPath = await getMenuItemPublicPathContext(menuItemId);
  const { error } = await supabase
    .from("menu_items")
    .update({
      is_featured: nextFeaturedState,
    })
    .eq("id", menuItemId);

  if (error) {
    throw new Error(`Unable to toggle menu item featured state: ${error.message}`);
  }

  revalidatePublicVenuePaths(publicPath);
  revalidatePath("/panel/destacados");
}

export async function toggleMenuItemHomeFeaturedAction(
  menuItemId: string,
  nextHomeFeaturedState: boolean,
) {
  "use server";

  const supabase = await createAdminMutationClient();
  const publicPath = await getMenuItemPublicPathContext(menuItemId);
  const { error } = await supabase
    .from("menu_items")
    .update({
      is_home_featured: nextHomeFeaturedState,
    })
    .eq("id", menuItemId);

  if (error) {
    throw new Error(
      `Unable to toggle menu item home featured state: ${error.message}`,
    );
  }

  revalidatePublicVenuePaths(publicPath);
  revalidatePath("/panel/destacados");
}

export async function toggleMenuItemPickupMonthHighlightAction(
  menuItemId: string,
  nextPickupMonthHighlightState: boolean,
) {
  "use server";

  const supabase = await createAdminMutationClient();
  const publicPath = await getMenuItemPublicPathContext(menuItemId);
  const { error } = await supabase
    .from("menu_items")
    .update({
      is_pickup_month_highlight: nextPickupMonthHighlightState,
    })
    .eq("id", menuItemId);

  if (error) {
    throw new Error(
      `Unable to toggle menu item pickup month highlight state: ${error.message}`,
    );
  }

  revalidatePublicVenuePaths(publicPath);
  revalidatePath("/panel/destacados");
}

export async function toggleVenueFeaturedAction(
  venueId: string,
  nextFeaturedState: boolean,
) {
  "use server";

  const supabase = await createAdminMutationClient();
  const publicPath = await getPublicVenuePathContextById(venueId);
  const { error } = await supabase
    .from("venues")
    .update({
      is_featured: nextFeaturedState,
    })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to toggle venue featured state: ${error.message}`);
  }

  revalidatePublicVenuePaths(publicPath);
  revalidatePath("/panel/destacados");
}

export async function getAdminMenuItemsByCityId(
  cityId: string,
): Promise<AdminMenuItemListItem[]> {
  const supabase = createSupabaseServerClient();
  const baseQuery = supabase
    .from("menu_items")
    .select(
      "id, venue_id, name, category_name, image_url, price_amount, currency, sort_order, is_available, is_featured, is_home_featured, is_pickup_month_highlight, venues!inner(name, city_id, cities!inner(id, name))",
    )
    .eq("venues.city_id", cityId)
    .order("is_home_featured", { ascending: false })
    .order("is_pickup_month_highlight", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const { data, error } = await baseQuery;

  if (error && isMissingHighlightColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("menu_items")
      .select(
        "id, venue_id, name, category_name, image_url, price_amount, currency, sort_order, is_available, venues!inner(name, city_id, cities!inner(id, name))",
      )
      .eq("venues.city_id", cityId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (fallbackError) {
      throw new Error(
        `Unable to load admin highlighted menu items: ${fallbackError.message}`,
      );
    }

    return fallbackData.map((item) => ({
      id: item.id,
      name: item.name,
      venueId: item.venue_id,
      venueName: item.venues?.name ?? null,
      cityId: item.venues?.city_id ?? null,
      cityName: item.venues?.cities?.name ?? null,
      categoryName: item.category_name,
      imageUrl: item.image_url,
      priceAmount: item.price_amount,
      currency: item.currency,
      sortOrder: item.sort_order,
      isAvailable: item.is_available,
      isFeatured: false,
      isHomeFeatured: false,
      isPickupMonthHighlight: false,
    }));
  }

  if (error) {
    throw new Error(`Unable to load admin highlighted menu items: ${error.message}`);
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    venueId: item.venue_id,
    venueName: item.venues?.name ?? null,
    cityId: item.venues?.city_id ?? null,
    cityName: item.venues?.cities?.name ?? null,
    categoryName: item.category_name,
    imageUrl: item.image_url,
    priceAmount: item.price_amount,
    currency: item.currency,
    sortOrder: item.sort_order,
    isAvailable: item.is_available,
    isFeatured: item.is_featured,
    isHomeFeatured: item.is_home_featured,
    isPickupMonthHighlight: item.is_pickup_month_highlight,
  }));
}

export async function getAdminHighlightedVenuesByCityId(
  cityId: string,
): Promise<AdminHighlightedVenueListItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug, cover_url, is_featured, city_id, cities(name)")
    .eq("city_id", cityId)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load admin highlighted venues: ${error.message}`);
  }

  return data.map((venue) => ({
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    coverUrl: venue.cover_url,
    cityId: venue.city_id,
    cityName: venue.cities?.name ?? null,
    isFeatured: venue.is_featured,
  }));
}

export async function requireAdminVenueContext(venueId: string) {
  const venue = await getAdminVenueContext(venueId);

  if (!venue) {
    notFound();
  }

  return venue;
}
