import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminVenueListItem = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  isActive: boolean;
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
  pickupNotes: string;
  pickupEtaMin: string;
  coverUrl: string;
  isActive: boolean;
};

export type AdminCityOption = {
  id: string;
  name: string;
};

function normalizeVenueFormValues(formData: FormData): Omit<AdminVenueFormValues, "id"> {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    cityId: String(formData.get("cityId") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    pickupNotes: String(formData.get("pickupNotes") ?? "").trim(),
    pickupEtaMin: String(formData.get("pickupEtaMin") ?? "").trim(),
    coverUrl: String(formData.get("coverUrl") ?? "").trim(),
    isActive: formData.get("isActive") === "on",
  };
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

export async function getAdminVenues(): Promise<AdminVenueListItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug, email, is_active, cities(name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load admin venues: ${error.message}`);
  }

  return data.map((venue) => ({
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    email: venue.email,
    isActive: venue.is_active,
    cityName: venue.cities?.name ?? null,
  }));
}

export async function getAdminVenueById(venueId: string): Promise<AdminVenueFormValues | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id, name, slug, city_id, description, address, email, pickup_notes, pickup_eta_min, cover_url, is_active",
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
    pickupNotes: data.pickup_notes ?? "",
    pickupEtaMin: data.pickup_eta_min?.toString() ?? "",
    coverUrl: data.cover_url ?? "",
    isActive: data.is_active,
  };
}

export async function createVenueAction(formData: FormData) {
  "use server";

  const values = normalizeVenueFormValues(formData);
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("venues").insert({
    name: values.name,
    slug: values.slug,
    city_id: values.cityId || null,
    description: values.description || null,
    address: values.address || null,
    email: values.email || null,
    pickup_notes: values.pickupNotes || null,
    pickup_eta_min: values.pickupEtaMin ? Number(values.pickupEtaMin) : null,
    cover_url: values.coverUrl || null,
    is_active: values.isActive,
  });

  if (error) {
    throw new Error(`Unable to create venue: ${error.message}`);
  }

  redirect("/panel/locales");
}

export async function updateVenueAction(venueId: string, formData: FormData) {
  "use server";

  const values = normalizeVenueFormValues(formData);
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
      pickup_notes: values.pickupNotes || null,
      pickup_eta_min: values.pickupEtaMin ? Number(values.pickupEtaMin) : null,
      cover_url: values.coverUrl || null,
      is_active: values.isActive,
    })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to update venue: ${error.message}`);
  }

  redirect("/panel/locales");
}
