import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createDefaultOpeningHours,
  normalizeOpeningHours,
  openingHourDayOrder,
  type OpeningHoursValue,
} from "@/features/venues/opening-hours";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminVenueListItem = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  isPublished: boolean;
  isVerified: boolean;
  subscriptionActive: boolean;
  cityName: string | null;
};

export type AdminVenueFormValues = {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  pickupNotes: string;
  pickupEtaMin: string;
  coverUrl: string;
  isActive: boolean;
  isPublished: boolean;
  isVerified: boolean;
  subscriptionActive: boolean;
  sortOrder: string;
  openingHours: OpeningHoursValue;
};

export type AdminJoinRequestPrefill = {
  id: string;
  venueName: string;
  businessType: string | null;
  area: string | null;
  address: string | null;
  venuePhone: string | null;
  venueEmail: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  serviceType: string | null;
  message: string | null;
};

export type AdminCityOption = {
  id: string;
  name: string;
};

type NormalizedVenueFormValues = Omit<AdminVenueFormValues, "id" | "openingHours"> & {
  openingHours: OpeningHoursValue;
};

function buildOpeningHoursFromFormData(formData: FormData): OpeningHoursValue {
  const openingHours = createDefaultOpeningHours();

  for (const dayKey of openingHourDayOrder) {
    openingHours[dayKey] = {
      isOpen: formData.get(`openingHours.${dayKey}.isOpen`) === "on",
      firstOpen: String(formData.get(`openingHours.${dayKey}.firstOpen`) ?? "").trim(),
      firstClose: String(formData.get(`openingHours.${dayKey}.firstClose`) ?? "").trim(),
      secondOpen: String(formData.get(`openingHours.${dayKey}.secondOpen`) ?? "").trim(),
      secondClose: String(formData.get(`openingHours.${dayKey}.secondClose`) ?? "").trim(),
    };
  }

  return openingHours;
}

function normalizeVenueFormValues(
  formData: FormData,
): NormalizedVenueFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    cityId: String(formData.get("cityId") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    pickupNotes: String(formData.get("pickupNotes") ?? "").trim(),
    pickupEtaMin: String(formData.get("pickupEtaMin") ?? "").trim(),
    coverUrl: String(formData.get("coverUrl") ?? "").trim(),
    isActive: formData.get("isActive") === "on",
    isPublished: formData.get("isPublished") === "on",
    isVerified: formData.get("isVerified") === "on",
    subscriptionActive: formData.get("subscriptionActive") === "on",
    sortOrder: String(formData.get("sortOrder") ?? "").trim(),
    openingHours: buildOpeningHoursFromFormData(formData),
  };
}

function validateVenueFormValues(values: NormalizedVenueFormValues) {
  if (!values.name) {
    throw new Error("El nombre del local es obligatorio.");
  }

  if (!values.slug) {
    throw new Error("El slug del local es obligatorio.");
  }

  if (!values.cityId) {
    throw new Error("La ciudad del local es obligatoria.");
  }

  if (!values.phone) {
    throw new Error("El teléfono del local es obligatorio.");
  }

  if (!values.email) {
    throw new Error("El email del local es obligatorio.");
  }
}

async function ensureUniqueVenueSlug(slug: string, currentVenueId?: string) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("venues").select("id").eq("slug", slug);

  if (currentVenueId) {
    query = query.neq("id", currentVenueId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw new Error(`Unable to validate venue slug: ${error.message}`);
  }

  if (data.length > 0) {
    throw new Error("Ya existe un local con ese slug.");
  }
}

type PublicVenuePathContext = {
  citySlug: string;
  venueSlug: string;
};

async function getCitySlugById(cityId: string) {
  if (!cityId) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("slug")
    .eq("id", cityId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load city slug: ${error.message}`);
  }

  return data?.slug ?? null;
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

function revalidatePublicVenuePaths(paths: Array<PublicVenuePathContext | null>) {
  const uniquePaths = new Set<string>();

  for (const pathContext of paths) {
    if (!pathContext) {
      continue;
    }

    uniquePaths.add(`/cities/${pathContext.citySlug}`);
    uniquePaths.add(
      `/cities/${pathContext.citySlug}/venues/${pathContext.venueSlug}`,
    );
  }

  uniquePaths.add("/");
  uniquePaths.add("/cities");

  for (const path of Array.from(uniquePaths)) {
    revalidatePath(path);
  }
}

export async function getAdminCities(): Promise<AdminCityOption[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load admin cities: ${error.message}`);
  }

  return data.map((city) => ({
    id: city.id,
    name: city.name,
  }));
}

export function buildVenueInitialValuesFromJoinRequest(
  cities: AdminCityOption[],
  joinRequest: AdminJoinRequestPrefill,
): AdminVenueFormValues {
  const matchingCity =
    cities.find(
      (city) =>
        city.name.trim().toLowerCase() === joinRequest.area?.trim().toLowerCase(),
    ) ?? null;

  return {
    id: "",
    name: joinRequest.venueName,
    slug: joinRequest.venueName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    cityId: matchingCity?.id ?? "",
    description: "",
    address: joinRequest.address ?? "",
    email: joinRequest.venueEmail ?? "",
    phone: joinRequest.venuePhone ?? "",
    pickupNotes: "",
    pickupEtaMin: "",
    coverUrl: "",
    isActive: true,
    isPublished: true,
    isVerified: false,
    subscriptionActive: false,
    sortOrder: "",
    openingHours: createDefaultOpeningHours(),
  };
}

export async function getAdminVenues(): Promise<AdminVenueListItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id, name, slug, email, phone, is_active, is_published, is_verified, subscription_active, cities(name)",
    )
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load admin venues: ${error.message}`);
  }

  return data.map((venue) => ({
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    email: venue.email,
    phone: venue.phone,
    isActive: venue.is_active,
    isPublished: venue.is_published,
    isVerified: venue.is_verified,
    subscriptionActive: venue.subscription_active,
    cityName: venue.cities?.name ?? null,
  }));
}

export async function getAdminVenueById(
  venueId: string,
): Promise<AdminVenueFormValues | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id, name, slug, city_id, description, address, email, phone, pickup_notes, pickup_eta_min, cover_url, is_active, is_published, is_verified, subscription_active, sort_order, opening_hours",
    )
    .eq("id", venueId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load admin venue: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    cityId: data.city_id ?? "",
    description: data.description ?? "",
    address: data.address ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    pickupNotes: data.pickup_notes ?? "",
    pickupEtaMin: data.pickup_eta_min?.toString() ?? "",
    coverUrl: data.cover_url ?? "",
    isActive: data.is_active,
    isPublished: data.is_published,
    isVerified: data.is_verified,
    subscriptionActive: data.subscription_active,
    sortOrder: data.sort_order?.toString() ?? "",
    openingHours: normalizeOpeningHours(data.opening_hours),
  };
}

export async function createVenueAction(formData: FormData) {
  "use server";

  const values = normalizeVenueFormValues(formData);
  const linkedRequestId = String(formData.get("linkedRequestId") ?? "").trim();
  validateVenueFormValues(values);
  await ensureUniqueVenueSlug(values.slug);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .insert({
      name: values.name,
      slug: values.slug,
      city_id: values.cityId || null,
      description: values.description || null,
      address: values.address || null,
      email: values.email || null,
      phone: values.phone || null,
      pickup_notes: values.pickupNotes || null,
      pickup_eta_min: values.pickupEtaMin ? Number(values.pickupEtaMin) : null,
      cover_url: values.coverUrl || null,
      is_active: values.isActive,
      is_published: values.isPublished,
      is_verified: values.isVerified,
      subscription_active: values.subscriptionActive,
      sort_order: values.sortOrder ? Number(values.sortOrder) : null,
      opening_hours: values.openingHours,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create venue: ${error.message}`);
  }

  if (linkedRequestId) {
    const { error: linkError } = await supabase
      .from("join_requests")
      .update({
        linked_venue_id: data.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkedRequestId);

    if (linkError) {
      throw new Error(`Unable to link join request: ${linkError.message}`);
    }
  }

  const nextCitySlug = await getCitySlugById(values.cityId);

  revalidatePublicVenuePaths([
    nextCitySlug
      ? {
          citySlug: nextCitySlug,
          venueSlug: values.slug,
        }
      : null,
  ]);

  redirect("/panel/locales");
}

export async function updateVenueAction(venueId: string, formData: FormData) {
  "use server";

  const previousPublicPath = await getPublicVenuePathContextById(venueId);
  const values = normalizeVenueFormValues(formData);
  validateVenueFormValues(values);
  await ensureUniqueVenueSlug(values.slug, venueId);

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("venues")
    .update({
      name: values.name,
      slug: values.slug,
      city_id: values.cityId || null,
      description: values.description || null,
      address: values.address || null,
      email: values.email || null,
      phone: values.phone || null,
      pickup_notes: values.pickupNotes || null,
      pickup_eta_min: values.pickupEtaMin ? Number(values.pickupEtaMin) : null,
      cover_url: values.coverUrl || null,
      is_active: values.isActive,
      is_published: values.isPublished,
      is_verified: values.isVerified,
      subscription_active: values.subscriptionActive,
      sort_order: values.sortOrder ? Number(values.sortOrder) : null,
      opening_hours: values.openingHours,
    })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to update venue: ${error.message}`);
  }

  const nextCitySlug = await getCitySlugById(values.cityId);

  revalidatePublicVenuePaths([
    previousPublicPath,
    nextCitySlug
      ? {
          citySlug: nextCitySlug,
          venueSlug: values.slug,
        }
      : null,
  ]);

  redirect("/panel/locales");
}
