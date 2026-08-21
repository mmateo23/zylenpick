import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getPolygonCenter,
  parsePolygonGeometry,
} from "@/features/map-places/geometry";
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

export type MapPlaceParentOption = {
  id: string;
  cityId: string;
  name: string;
  category: MapPlaceCategory;
};

export type AdminMapPlaceListItem = Pick<
  AdminMapPlace,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "latitude"
  | "longitude"
  | "status"
  | "isActive"
  | "isPlanCandidate"
  | "planRole"
  | "captureMethod"
  | "coverImageUrl"
  | "city"
> & {
  thumbnailImageUrl: string | null;
};

export type AdminMapPlaceListResult = {
  items: AdminMapPlaceListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminMapPlacesSummary = {
  published: number;
  planCandidates: number;
  incomplete: number;
  pendingScout: number;
};

export type AdminMapPlaceFormValues = {
  id: string;
  cityId: string;
  parentPlaceId: string;
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
  geometryType: "point" | "polygon";
  geometry: string;
  locationAccuracyM: string;
  amenities: string;
  isAccessible: boolean;
  source: MapPlaceSource;
  sourceNote: string;
  status: MapPlaceStatus;
  isActive: boolean;
  sortOrder: string;
  accessType: "free" | "restricted" | "unknown" | "";
};

const validSources = new Set<MapPlaceSource>([
  "field",
  "municipal",
  "openstreetmap",
  "manual",
]);
const validStatuses = new Set<MapPlaceStatus>(["draft", "review", "published"]);
const validPlanRoles = new Set<MapPlacePlanRole>(["discover", "enjoy", "support"]);
const validGeometryTypes = new Set(["point", "polygon"]);

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
    parentPlaceId: String(formData.get("parentPlaceId") ?? "").trim(),
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
    geometryType: String(formData.get("geometryType") ?? "point") as
      | "point"
      | "polygon",
    geometry: String(formData.get("geometry") ?? "").trim(),
    locationAccuracyM: String(formData.get("locationAccuracyM") ?? "").trim(),
    amenities: String(formData.get("amenities") ?? "").trim(),
    isAccessible: formData.get("isAccessible") === "on",
    source,
    sourceNote: String(formData.get("sourceNote") ?? "").trim(),
    status,
    isActive: formData.get("isActive") === "on",
    sortOrder: String(formData.get("sortOrder") ?? "").trim(),
    accessType: String(formData.get("accessType") ?? "") as
      | "free"
      | "restricted"
      | "unknown"
      | "",
  };
}

function validateValues(
  values: AdminMapPlaceFormValues,
  options?: { allowPublishedWithoutCover?: boolean },
) {
  if (!values.name) throw new Error("El nombre del lugar es obligatorio.");
  if (!values.slug) throw new Error("El slug del lugar es obligatorio.");
  if (!values.cityId) throw new Error("Selecciona una ciudad.");
  if (!values.category) throw new Error("Selecciona una categoría.");
  if (!validSources.has(values.source)) throw new Error("Fuente no válida.");
  if (!validStatuses.has(values.status)) throw new Error("Estado no válido.");
  if (!validGeometryTypes.has(values.geometryType)) {
    throw new Error("El tipo de geometría no es válido.");
  }

  if (!validPlanRoles.has(values.planRole)) {
    throw new Error("La función del lugar en el plan no es válida.");
  }

  validateOptionalUrl(values.coverImageUrl, "La imagen principal", true);
  validateOptionalUrl(values.sourceUrl, "El enlace oficial");

  parseNumber(values.latitude, "La latitud", -90, 90);
  parseNumber(values.longitude, "La longitud", -180, 180);

  if (values.geometryType === "polygon") {
    let rawGeometry: unknown;
    try {
      rawGeometry = JSON.parse(values.geometry);
    } catch {
      throw new Error("El área dibujada no tiene un formato válido.");
    }
    if (!parsePolygonGeometry(rawGeometry)) {
      throw new Error("Marca al menos tres puntos válidos para delimitar el área.");
    }
  }

  if (values.status === "published" && values.source === "manual" && !values.sourceNote) {
    throw new Error("Indica cómo se comprobó el punto antes de publicarlo.");
  }
  if (
    values.status === "published" &&
    !values.coverImageUrl &&
    !options?.allowPublishedWithoutCover
  ) {
    throw new Error("Añade una imagen principal antes de publicar el lugar.");
  }
}

function toPayload(values: AdminMapPlaceFormValues, iconName: string) {
  const amenities = values.amenities
    .split(",")
    .map((amenity) => amenity.trim())
    .filter(Boolean);

  const polygon =
    values.geometryType === "polygon"
      ? parsePolygonGeometry(JSON.parse(values.geometry))
      : null;
  const [longitude, latitude] = polygon
    ? getPolygonCenter(polygon)
    : [
        parseNumber(values.longitude, "La longitud", -180, 180),
        parseNumber(values.latitude, "La latitud", -90, 90),
      ];

  return {
    city_id: values.cityId,
    parent_place_id: values.parentPlaceId || null,
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
    icon_name: iconName,
    geometry_type: values.geometryType,
    geometry: polygon,
    latitude,
    longitude,
    location_accuracy_m: parseOptionalPositiveNumber(values.locationAccuracyM),
    amenities,
    is_accessible: values.isAccessible,
    source: values.source,
    source_note: values.sourceNote || null,
    status: values.status,
    is_active: values.isActive,
    verified_at: values.status === "published" ? new Date().toISOString() : null,
    sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
    access_type: values.accessType || null,
  };
}

async function getCategoryIcon(
  supabase: SupabaseClient<Database>,
  categorySlug: string,
) {
  const { data, error } = await supabase
    .from("map_place_categories")
    .select("icon_name")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (error || !data) throw new Error("La categoría seleccionada no existe.");
  return data.icon_name;
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
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(`No se pudieron cargar las ciudades: ${error.message}`);
  return data;
}

export async function getMapPlaceParentOptions(): Promise<MapPlaceParentOption[]> {
  const supabase = await createAdminReadClient();
  const { data, error } = await supabase
    .from("map_places")
    .select("id, city_id, name, category")
    .is("parent_place_id", null)
    .order("name");

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(`No se pudieron cargar los lugares principales: ${error.message}`);
  }

  return data
    .filter(
      (place): place is typeof place & { name: string; category: string } =>
        Boolean(place.name && place.category),
    )
    .map((place) => ({
    id: place.id,
    cityId: place.city_id,
    name: place.name,
    category: place.category,
  }));
}

async function validateParentPlace(
  supabase: SupabaseClient<Database>,
  values: AdminMapPlaceFormValues,
  currentId?: string,
) {
  if (!values.parentPlaceId) return;
  if (values.parentPlaceId === currentId) {
    throw new Error("Un lugar no puede estar dentro de sí mismo.");
  }

  const { data, error } = await supabase
    .from("map_places")
    .select("city_id, parent_place_id")
    .eq("id", values.parentPlaceId)
    .maybeSingle();

  if (error || !data) throw new Error("El lugar principal seleccionado no existe.");
  if (data.city_id !== values.cityId) {
    throw new Error("El lugar principal debe pertenecer a la misma ciudad.");
  }
  if (data.parent_place_id) {
    throw new Error("Solo se permite un nivel de sublugares para mantener el mapa sencillo.");
  }
}

export async function getAdminMapPlaces({
  query = "",
  status = "",
  category = "",
  page = 1,
  pageSize = 25,
}: {
  query?: string;
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminMapPlaceListResult> {
  const supabase = await createAdminReadClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  let placesQuery = supabase
    .from("map_places")
    .select(
      "id, slug, name, category, latitude, longitude, cover_image_url, thumbnail_image_url, plan_role, is_plan_candidate, status, is_active, capture_method, cities!inner(slug, name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (query.trim()) placesQuery = placesQuery.ilike("name", `%${query.trim()}%`);
  if (category) placesQuery = placesQuery.eq("category", category);
  if (status === "pending") {
    placesQuery = placesQuery.eq("status", "draft").eq("capture_method", "scout");
  } else if (["draft", "review", "published"].includes(status)) {
    placesQuery = placesQuery.eq(
      "status",
      status as "draft" | "review" | "published",
    );
  } else if (status === "inactive") {
    placesQuery = placesQuery.eq("is_active", false);
  }

  const { data, error, count } = await placesQuery;

  if (error) {
    if (isMissingTableError(error.message)) {
      return { items: [], total: 0, page: safePage, pageSize };
    }
    throw new Error(`No se pudieron cargar los lugares: ${error.message}`);
  }

  return {
    items: data.map((place) => ({
      id: place.id,
      slug: place.slug,
      name: place.name,
      category: place.category,
      latitude: place.latitude,
      longitude: place.longitude,
      coverImageUrl: place.cover_image_url,
      thumbnailImageUrl: place.thumbnail_image_url,
      planRole: place.plan_role,
      isPlanCandidate: place.is_plan_candidate,
      status: place.status,
      isActive: place.is_active,
      captureMethod: place.capture_method,
      city: { slug: place.cities.slug, name: place.cities.name },
    })),
    total: count ?? 0,
    page: safePage,
    pageSize,
  };
}

export async function getAdminMapPlacesSummary(): Promise<AdminMapPlacesSummary> {
  const supabase = await createAdminReadClient();
  const [published, planCandidates, incomplete, pendingScout] = await Promise.all([
    supabase
      .from("map_places")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("is_active", true),
    supabase
      .from("map_places")
      .select("id", { count: "exact", head: true })
      .eq("is_plan_candidate", true),
    supabase
      .from("map_places")
      .select("id", { count: "exact", head: true })
      .or("description.is.null,cover_image_url.is.null"),
    supabase
      .from("map_places")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft")
      .eq("capture_method", "scout"),
  ]);
  const error = [published, planCandidates, incomplete, pendingScout].find(
    (result) => result.error,
  )?.error;
  if (error) throw new Error(`No se pudo cargar el resumen de lugares: ${error.message}`);
  return {
    published: published.count ?? 0,
    planCandidates: planCandidates.count ?? 0,
    incomplete: incomplete.count ?? 0,
    pendingScout: pendingScout.count ?? 0,
  };
}

export async function getAdminMapPlaceById(id: string): Promise<AdminMapPlaceFormValues | null> {
  const supabase = await createAdminReadClient();
  const { data, error } = await supabase
    .from("map_places")
    .select(
      "id, city_id, parent_place_id, slug, name, description, category, geometry_type, geometry, latitude, longitude, location_accuracy_m, amenities, is_accessible, cover_image_url, story, opening_hours_note, accessibility_note, source_label, source_url, plan_role, is_plan_candidate, source, source_note, status, is_active, sort_order, access_type",
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
    parentPlaceId: data.parent_place_id ?? "",
    slug: data.slug ?? "",
    name: data.name ?? "",
    description: data.description ?? "",
    coverImageUrl: data.cover_image_url ?? "",
    story: data.story ?? "",
    openingHoursNote: data.opening_hours_note ?? "",
    accessibilityNote: data.accessibility_note ?? "",
    sourceLabel: data.source_label ?? "",
    sourceUrl: data.source_url ?? "",
    planRole: data.plan_role,
    isPlanCandidate: data.is_plan_candidate,
    category: data.category ?? "",
    latitude: data.latitude?.toString() ?? "",
    longitude: data.longitude?.toString() ?? "",
    geometryType:
      data.geometry_type === "polygon" ? "polygon" : "point",
    geometry:
      data.geometry_type === "polygon" && data.geometry
        ? JSON.stringify(data.geometry)
        : "",
    locationAccuracyM: data.location_accuracy_m?.toString() ?? "",
    amenities: (data.amenities ?? []).join(", "),
    isAccessible: data.is_accessible,
    source: data.source,
    sourceNote: data.source_note ?? "",
    status: data.status,
    isActive: data.is_active,
    sortOrder: String(data.sort_order),
    accessType: data.access_type ?? "",
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
  const iconName = await getCategoryIcon(supabase, values.category);
  await validateParentPlace(supabase, values);
  await ensureUniqueSlug(supabase, values.cityId, values.slug);
  const payload: Database["public"]["Tables"]["map_places"]["Insert"] = toPayload(values, iconName);
  const { error } = await supabase.from("map_places").insert(payload);
  if (error) throw new Error(`No se pudo crear el lugar: ${error.message}`);
  revalidatePath("/mapa");
  redirect("/panel/lugares");
}

export async function updateMapPlaceAction(id: string, formData: FormData) {
  "use server";
  const values = normalizeFormData(formData);
  const supabase = await createAdminReadClient();
  const { data: currentPlace, error: currentPlaceError } = await supabase
    .from("map_places")
    .select("status, cover_image_url")
    .eq("id", id)
    .maybeSingle();
  if (currentPlaceError || !currentPlace) {
    throw new Error("No se pudo comprobar el estado actual del lugar.");
  }
  validateValues(values, {
    allowPublishedWithoutCover:
      currentPlace.status === "published" && !currentPlace.cover_image_url,
  });
  const iconName = await getCategoryIcon(supabase, values.category);
  await validateParentPlace(supabase, values, id);
  await ensureUniqueSlug(supabase, values.cityId, values.slug, id);
  const payload: Database["public"]["Tables"]["map_places"]["Update"] = toPayload(values, iconName);
  const { error } = await supabase.from("map_places").update(payload).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el lugar: ${error.message}`);
  revalidatePath("/mapa");
  redirect("/panel/lugares");
}
