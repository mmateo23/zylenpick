import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { mapPlaceCategories } from "@/features/map-places/categories";
import type {
  AdminMapPlace,
  MapPlaceCategory,
  MapPlacePlanRole,
  MapPlaceSource,
  MapPlaceStatus,
} from "@/features/map-places/types";
import { requireAuthorizedAdminSession } from "@/features/admin/services/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type MapPlaceCityOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminMapPlaceFormValues = {
  id: string;
  cityId: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  story: string;
  openingHoursNote: string;
  accessibilityNote: string;
  sourceLabel: string;
  sourceUrl: string;
  planRole: MapPlacePlanRole;
  isPlanCandidate: boolean;
  category: MapPlaceCategory;
  latitude: string;
  longitude: string;
  locationAccuracyM: string;
  amenities: string;
  isAccessible: boolean;
  source: MapPlaceSource;
  sourceNote: string;
  status: MapPlaceStatus;
  isActive: boolean;
  sortOrder: string;
};

const validCategories = new Set(mapPlaceCategories.map((category) => category.value));
const validSources = new Set<MapPlaceSource>([
  "field",
  "municipal",
  "openstreetmap",
  "manual",
]);
const validStatuses = new Set<MapPlaceStatus>(["draft", "review", "published"]);
const validPlanRoles = new Set<MapPlacePlanRole>(["discover", "enjoy", "support"]);

function isMissingTableError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("map_places") && normalized.includes("schema cache");
}

async function createAdminReadClient(): Promise<SupabaseClient<Database>> {
  await requireAuthorizedAdminSession();
  return isSupabaseAdminConfigured()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();
}

function parseNumber(value: string, label: string, min: number, max: number) {
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} debe estar entre ${min} y ${max}.`);
  }
  return parsed;
}

function parseOptionalPositiveNumber(value: string) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function validateOptionalUrl(value: string, label: string, allowLocalPath = false) {
  if (!value || (allowLocalPath && value.startsWith("/"))) return;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error(`${label} debe ser una URL http(s) válida.`);
  }
}

function normalizeFormData(formData: FormData): AdminMapPlaceFormValues {
  const category = String(formData.get("category") ?? "park") as MapPlaceCategory;
  const source = String(formData.get("source") ?? "field") as MapPlaceSource;
  const status = String(formData.get("status") ?? "draft") as MapPlaceStatus;
  const planRole = String(formData.get("planRole") ?? "support") as MapPlacePlanRole;

  return {
    id: "",
    cityId: String(formData.get("cityId") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim(),
    story: String(formData.get("story") ?? "").trim(),
    openingHoursNote: String(formData.get("openingHoursNote") ?? "").trim(),
    accessibilityNote: String(formData.get("accessibilityNote") ?? "").trim(),
    sourceLabel: String(formData.get("sourceLabel") ?? "").trim(),
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim(),
    planRole,
    isPlanCandidate: formData.get("isPlanCandidate") === "on",
    category,
    latitude: String(formData.get("latitude") ?? "").trim(),
    longitude: String(formData.get("longitude") ?? "").trim(),
    locationAccuracyM: String(formData.get("locationAccuracyM") ?? "").trim(),
    amenities: String(formData.get("amenities") ?? "").trim(),
    isAccessible: formData.get("isAccessible") === "on",
    source,
    sourceNote: String(formData.get("sourceNote") ?? "").trim(),
    status,
    isActive: formData.get("isActive") === "on",
    sortOrder: String(formData.get("sortOrder") ?? "").trim(),
  };
}

function validateValues(values: AdminMapPlaceFormValues) {
  if (!values.name) throw new Error("El nombre del lugar es obligatorio.");
  if (!values.slug) throw new Error("El slug del lugar es obligatorio.");
  if (!values.cityId) throw new Error("Selecciona una ciudad.");
  if (!validCategories.has(values.category)) throw new Error("Categoría no válida.");
  if (!validSources.has(values.source)) throw new Error("Fuente no válida.");
  if (!validStatuses.has(values.status)) throw new Error("Estado no válido.");

  if (!validPlanRoles.has(values.planRole)) {
    throw new Error("La función del lugar en el plan no es válida.");
  }

  validateOptionalUrl(values.coverImageUrl, "La imagen principal", true);
  validateOptionalUrl(values.sourceUrl, "El enlace oficial");

  parseNumber(values.latitude, "La latitud", -90, 90);
  parseNumber(values.longitude, "La longitud", -180, 180);

  if (values.status === "published" && values.source === "manual" && !values.sourceNote) {
    throw new Error("Indica cómo se comprobó el punto antes de publicarlo.");
  }
}

function toPayload(values: AdminMapPlaceFormValues) {
  const category = mapPlaceCategories.find((item) => item.value === values.category)!;
  const amenities = values.amenities
    .split(",")
    .map((amenity) => amenity.trim())
    .filter(Boolean);

  return {
    city_id: values.cityId,
    slug: values.slug,
    name: values.name,
    description: values.description || null,
    cover_image_url: values.coverImageUrl || null,
    story: values.story || null,
    opening_hours_note: values.openingHoursNote || null,
    accessibility_note: values.accessibilityNote || null,
    source_label: values.sourceLabel || null,
    source_url: values.sourceUrl || null,
    plan_role: values.planRole,
    is_plan_candidate: values.isPlanCandidate,
    category: values.category,
    icon_name: category.iconName,
    geometry_type: "point" as const,
    latitude: parseNumber(values.latitude, "La latitud", -90, 90),
    longitude: parseNumber(values.longitude, "La longitud", -180, 180),
    location_accuracy_m: parseOptionalPositiveNumber(values.locationAccuracyM),
    amenities,
    is_accessible: values.isAccessible,
    source: values.source,
    source_note: values.sourceNote || null,
    status: values.status,
    is_active: values.isActive,
    verified_at: values.status === "published" ? new Date().toISOString() : null,
    sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
  };
}

async function ensureUniqueSlug(
  supabase: SupabaseClient<Database>,
  cityId: string,
  slug: string,
  currentId?: string,
) {
  let query = supabase
    .from("map_places")
    .select("id")
    .eq("city_id", cityId)
    .eq("slug", slug);
  if (currentId) query = query.neq("id", currentId);
  const { data, error } = await query.limit(1);
  if (error) throw new Error(`No se pudo comprobar el slug: ${error.message}`);
  if (data.length > 0) throw new Error("Ya existe un lugar con ese slug en la ciudad.");
}

export async function getMapPlaceCities(): Promise<MapPlaceCityOption[]> {
  const supabase = await createAdminReadClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug")
    .order("name");
  if (error) throw new Error(`No se pudieron cargar las ciudades: ${error.message}`);
  return data;
}

export async function getAdminMapPlaces(): Promise<AdminMapPlace[]> {
  const supabase = await createAdminReadClient();
  const { data, error } = await supabase
    .from("map_places")
    .select(
      "id, city_id, slug, name, description, category, icon_name, latitude, longitude, location_accuracy_m, amenities, is_accessible, cover_image_url, story, opening_hours_note, accessibility_note, source_label, source_url, plan_role, is_plan_candidate, source, source_note, status, is_active, sort_order, verified_at, cities!inner(slug, name)",
    )
    .order("sort_order")
    .order("name");

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(`No se pudieron cargar los lugares: ${error.message}`);
  }

  return data.map((place) => ({
    id: place.id,
    cityId: place.city_id,
    slug: place.slug,
    name: place.name,
    description: place.description,
    category: place.category,
    iconName: place.icon_name,
    latitude: place.latitude,
    longitude: place.longitude,
    locationAccuracyM: place.location_accuracy_m,
    amenities: place.amenities ?? [],
    isAccessible: place.is_accessible,
    coverImageUrl: place.cover_image_url,
    story: place.story,
    openingHoursNote: place.opening_hours_note,
    accessibilityNote: place.accessibility_note,
    sourceLabel: place.source_label,
    sourceUrl: place.source_url,
    planRole: place.plan_role,
    isPlanCandidate: place.is_plan_candidate,
    source: place.source,
    sourceNote: place.source_note,
    status: place.status,
    isActive: place.is_active,
    sortOrder: place.sort_order,
    verifiedAt: place.verified_at,
    city: { slug: place.cities.slug, name: place.cities.name },
  }));
}

export async function getAdminMapPlaceById(id: string): Promise<AdminMapPlaceFormValues | null> {
  const supabase = await createAdminReadClient();
  const { data, error } = await supabase
    .from("map_places")
    .select(
      "id, city_id, slug, name, description, category, latitude, longitude, location_accuracy_m, amenities, is_accessible, cover_image_url, story, opening_hours_note, accessibility_note, source_label, source_url, plan_role, is_plan_candidate, source, source_note, status, is_active, sort_order",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error.message)) return null;
    throw new Error(`No se pudo cargar el lugar: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    cityId: data.city_id,
    slug: data.slug,
    name: data.name,
    description: data.description ?? "",
    coverImageUrl: data.cover_image_url ?? "",
    story: data.story ?? "",
    openingHoursNote: data.opening_hours_note ?? "",
    accessibilityNote: data.accessibility_note ?? "",
    sourceLabel: data.source_label ?? "",
    sourceUrl: data.source_url ?? "",
    planRole: data.plan_role,
    isPlanCandidate: data.is_plan_candidate,
    category: data.category,
    latitude: String(data.latitude),
    longitude: String(data.longitude),
    locationAccuracyM: data.location_accuracy_m?.toString() ?? "",
    amenities: (data.amenities ?? []).join(", "),
    isAccessible: data.is_accessible,
    source: data.source,
    sourceNote: data.source_note ?? "",
    status: data.status,
    isActive: data.is_active,
    sortOrder: String(data.sort_order),
  };
}

export async function getAdminMapPlaceCopyValues(
  id: string,
): Promise<AdminMapPlaceFormValues | null> {
  const sourcePlace = await getAdminMapPlaceById(id);
  if (!sourcePlace) return null;

  const supabase = await createAdminReadClient();
  const baseSlug = `${sourcePlace.slug}-copia`;
  const { data, error } = await supabase
    .from("map_places")
    .select("slug")
    .eq("city_id", sourcePlace.cityId)
    .like("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(`No se pudo preparar la copia: ${error.message}`);
  }

  const usedSlugs = new Set((data ?? []).map((place) => place.slug));
  let copySlug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(copySlug)) {
    copySlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return {
    ...sourcePlace,
    id: "",
    name: `${sourcePlace.name} (copia)`,
    slug: copySlug,
    status: "draft",
    isActive: false,
    isPlanCandidate: false,
  };
}

export async function createMapPlaceAction(formData: FormData) {
  "use server";
  const values = normalizeFormData(formData);
  validateValues(values);
  const supabase = await createAdminReadClient();
  await ensureUniqueSlug(supabase, values.cityId, values.slug);
  const payload: Database["public"]["Tables"]["map_places"]["Insert"] = toPayload(values);
  const { error } = await supabase.from("map_places").insert(payload);
  if (error) throw new Error(`No se pudo crear el lugar: ${error.message}`);
  revalidatePath("/mapa");
  redirect("/panel/lugares");
}

export async function updateMapPlaceAction(id: string, formData: FormData) {
  "use server";
  const values = normalizeFormData(formData);
  validateValues(values);
  const supabase = await createAdminReadClient();
  await ensureUniqueSlug(supabase, values.cityId, values.slug, id);
  const payload: Database["public"]["Tables"]["map_places"]["Update"] = toPayload(values);
  const { error } = await supabase.from("map_places").update(payload).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el lugar: ${error.message}`);
  revalidatePath("/mapa");
  redirect("/panel/lugares");
}
