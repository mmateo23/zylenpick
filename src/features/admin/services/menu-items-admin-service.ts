import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { createAdminMutationClient } from "@/features/admin/services/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminVenueContext = {
  id: string;
  name: string;
  slug: string;
};

export type AdminMenuItemListItem = {
  id: string;
  name: string;
  categoryName: string | null;
  imageUrl: string | null;
  priceAmount: number;
  currency: string;
  sortOrder: number;
  isAvailable: boolean;
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
};

type NormalizedMenuItemFormValues = Omit<AdminMenuItemFormValues, "id" | "venueId">;

type PublicVenuePathContext = {
  citySlug: string;
  venueSlug: string;
};

function isMissingFeaturedColumnError(message: string) {
  return message.toLowerCase().includes("menu_items.is_featured");
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
  revalidatePath("/cities");
  revalidatePath(`/cities/${pathContext.citySlug}`);
  revalidatePath(`/cities/${pathContext.citySlug}/venues/${pathContext.venueSlug}`);
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
      "id, name, category_name, image_url, price_amount, currency, sort_order, is_available, is_featured",
    )
    .eq("venue_id", venueId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const { data, error } = await baseQuery;

  if (error && isMissingFeaturedColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("menu_items")
      .select(
        "id, name, category_name, image_url, price_amount, currency, sort_order, is_available",
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
      categoryName: item.category_name,
      imageUrl: item.image_url,
      priceAmount: item.price_amount,
      currency: item.currency,
      sortOrder: item.sort_order,
      isAvailable: item.is_available,
      isFeatured: false,
    }));
  }

  if (error) {
    throw new Error(`Unable to load admin menu items: ${error.message}`);
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    categoryName: item.category_name,
    imageUrl: item.image_url,
    priceAmount: item.price_amount,
    currency: item.currency,
    sortOrder: item.sort_order,
    isAvailable: item.is_available,
    isFeatured: item.is_featured,
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
      "id, venue_id, name, description, price_amount, category_name, image_url, sort_order, is_available, is_featured",
    )
    .eq("venue_id", venueId)
    .eq("id", menuItemId)
    .maybeSingle();

  if (error && isMissingFeaturedColumnError(error.message)) {
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
    sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
    is_available: values.isAvailable,
    is_featured: values.isFeatured,
  });

  if (error && isMissingFeaturedColumnError(error.message)) {
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
      sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
      is_available: values.isAvailable,
      is_featured: values.isFeatured,
    })
    .eq("venue_id", venueId)
    .eq("id", menuItemId);

  if (error && isMissingFeaturedColumnError(error.message)) {
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

export async function requireAdminVenueContext(venueId: string) {
  const venue = await getAdminVenueContext(venueId);

  if (!venue) {
    notFound();
  }

  return venue;
}
