import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getDefaultMapPlacePlanRole,
  getMapPlaceCategory,
  mapPlaceCategories,
} from "@/features/map-places/categories";
import type { MapPlaceCategory } from "@/features/map-places/types";
import {
  createAdminDataClient,
  requireAuthorizedAdminSession,
} from "@/features/admin/services/admin-auth";
import type { Database, Json } from "@/types/database";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
] as const;
const MAX_RESULTS = 200;
const MAX_IMPORTS_PER_REQUEST = 50;
const validCategories = new Set(mapPlaceCategories.map((category) => category.value));

export type OpenStreetMapSearchKind = "water" | "seating" | "services";

export type OpenStreetMapCandidate = {
  externalId: string;
  osmType: "node" | "way" | "relation";
  osmId: number;
  name: string;
  description: string;
  category: MapPlaceCategory;
  latitude: number;
  longitude: number;
  amenities: string[];
  isAccessible: boolean;
  openingHoursNote: string;
  tags: Record<string, string>;
  alreadyImported: boolean;
};

type OsmElement = {
  type?: unknown;
  id?: unknown;
  lat?: unknown;
  lon?: unknown;
  center?: { lat?: unknown; lon?: unknown };
  tags?: unknown;
};

type CityBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

const searchKindLabels: Record<OpenStreetMapSearchKind, string> = {
  water: "Fuentes",
  seating: "Mesas y bancos",
  services: "Servicios públicos",
};

const queryLines: Record<OpenStreetMapSearchKind, string[]> = {
  water: [
    'nwr(area.searchArea)["amenity"="drinking_water"]',
    'nwr(area.searchArea)["amenity"="fountain"]',
  ],
  seating: [
    'nwr(area.searchArea)["amenity"="bench"]',
    'nwr(area.searchArea)["leisure"="picnic_table"]',
    'nwr(area.searchArea)["tourism"="picnic_site"]',
  ],
  services: [
    'nwr(area.searchArea)["amenity"="toilets"]',
    'nwr(area.searchArea)["leisure"="playground"]',
    'nwr(area.searchArea)["tourism"="viewpoint"]',
  ],
};

export const openStreetMapSearchKinds = (
  Object.keys(searchKindLabels) as OpenStreetMapSearchKind[]
).map((value) => ({ value, label: searchKindLabels[value] }));

async function requestOverpass(query: string) {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "Pickyalo/1.0 (https://www.pickyalo.com)",
        },
        body: new URLSearchParams({ data: query }),
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        lastError = new Error(`OpenStreetMap respondió con ${response.status}.`);
        continue;
      }

      return (await response.json()) as unknown;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Error de red al consultar OpenStreetMap.");
    } finally {
      clearTimeout(timeout);
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("OpenStreetMap tardó demasiado en responder. Inténtalo de nuevo.");
  }
  throw lastError ?? new Error("No se pudo consultar OpenStreetMap.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMissingExternalImportColumns(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("external_id") ||
    normalized.includes("external_data") ||
    normalized.includes("source_updated_at")
  );
}

function getOpenStreetMapUrl(candidate: Pick<OpenStreetMapCandidate, "osmType" | "osmId">) {
  return `https://www.openstreetmap.org/${candidate.osmType}/${candidate.osmId}`;
}

function normalizeTags(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .slice(0, 80),
  );
}

function validateCityName(value: string) {
  if (
    value.length < 1 ||
    value.length > 80 ||
    /[\u0000-\u001f\u007f;()[\]{}]/.test(value)
  ) {
    throw new Error("El nombre de la ciudad no es válido para la búsqueda.");
  }
}

async function resolveCityBounds(cityName: string): Promise<CityBounds> {
  validateCityName(cityName);
  const params = new URLSearchParams({
    q: `${cityName}, Spain`,
    format: "jsonv2",
    countrycodes: "es",
    addressdetails: "1",
    limit: "1",
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Pickyalo/1.0 (https://www.pickyalo.com)",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`El buscador de ciudades respondió con ${response.status}.`);
    const payload: unknown = await response.json();
    const first = Array.isArray(payload) ? payload[0] : null;
    if (!isRecord(first) || !Array.isArray(first.boundingbox) || first.boundingbox.length !== 4) {
      throw new Error("No se encontró el límite de la ciudad en OpenStreetMap.");
    }

    const [south, north, west, east] = first.boundingbox.map(Number);
    if (
      ![south, west, north, east].every(Number.isFinite) ||
      south >= north || west >= east || north - south > 1 || east - west > 1
    ) {
      throw new Error("El límite devuelto para la ciudad no es válido.");
    }
    return { south, west, north, east };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("El buscador de ciudades tardó demasiado en responder.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildOverpassQuery(bounds: CityBounds, kind: OpenStreetMapSearchKind) {
  const bbox = [bounds.south, bounds.west, bounds.north, bounds.east].join(",");
  const queries = queryLines[kind]
    .map((line) => `${line.replace("(area.searchArea)", `(${bbox})`)};`)
    .join("\n");

  return `[out:json][timeout:25];
(
${queries}
);
out center tags;`;
}

function readCoordinates(element: OsmElement) {
  const latitude = Number(element.lat ?? element.center?.lat);
  const longitude = Number(element.lon ?? element.center?.lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function inferCandidatePresentation(tags: Record<string, string>) {
  const isDrinkingWater =
    tags.amenity === "drinking_water" || tags.drinking_water === "yes";

  if (tags.amenity === "drinking_water" || tags.amenity === "fountain") {
    return {
      category: "fountain" as const,
      fallbackName: isDrinkingWater ? "Fuente de agua potable" : "Fuente pública",
      description: isDrinkingWater
        ? "Punto de agua potable registrado en OpenStreetMap. Pendiente de comprobación por Pickyalo."
        : "Fuente pública registrada en OpenStreetMap. No se considera potable sin una indicación expresa.",
      amenities: isDrinkingWater ? ["Agua potable"] : ["Fuente ornamental"],
    };
  }

  if (tags.leisure === "picnic_table") {
    return {
      category: "tables" as const,
      fallbackName: "Mesa de picnic",
      description: "Mesa pública para sentarse y comer registrada en OpenStreetMap.",
      amenities: ["Mesa", "Asientos"],
    };
  }

  if (tags.tourism === "picnic_site") {
    return {
      category: "tables" as const,
      fallbackName: "Zona de picnic",
      description: "Zona pública para descansar o comer registrada en OpenStreetMap.",
      amenities: ["Zona de picnic"],
    };
  }

  if (tags.amenity === "bench") {
    return {
      category: "bench" as const,
      fallbackName: "Banco público",
      description: "Banco público registrado en OpenStreetMap.",
      amenities: ["Banco", tags.backrest === "yes" ? "Respaldo" : ""].filter(Boolean),
    };
  }

  if (tags.amenity === "toilets") {
    return {
      category: "toilets" as const,
      fallbackName: "Aseos públicos",
      description: "Aseos públicos registrados en OpenStreetMap.",
      amenities: ["Aseos"],
    };
  }

  if (tags.leisure === "playground") {
    return {
      category: "playground" as const,
      fallbackName: "Parque infantil",
      description: "Zona de juegos registrada en OpenStreetMap.",
      amenities: ["Zona infantil"],
    };
  }

  return {
    category: "viewpoint" as const,
    fallbackName: "Mirador",
    description: "Punto de interés con vistas registrado en OpenStreetMap.",
    amenities: ["Mirador"],
  };
}

function parseElement(element: OsmElement): Omit<OpenStreetMapCandidate, "alreadyImported"> | null {
  if (
    (element.type !== "node" && element.type !== "way" && element.type !== "relation") ||
    !Number.isInteger(element.id)
  ) {
    return null;
  }

  const coordinates = readCoordinates(element);
  if (!coordinates) return null;

  const tags = normalizeTags(element.tags);
  const presentation = inferCandidatePresentation(tags);
  const osmId = Number(element.id);
  const externalId = `${element.type}/${osmId}`;

  return {
    externalId,
    osmType: element.type,
    osmId,
    name: (tags.name || presentation.fallbackName).slice(0, 120),
    description: presentation.description,
    category: presentation.category,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    amenities: presentation.amenities,
    isAccessible: tags.wheelchair === "yes",
    openingHoursNote: (tags.opening_hours ?? "").slice(0, 200),
    tags,
  };
}

function isSearchKind(value: string): value is OpenStreetMapSearchKind {
  return value === "water" || value === "seating" || value === "services";
}

export async function searchOpenStreetMapPlaces(input: {
  cityId: string;
  cityName: string;
  kind: string;
}): Promise<OpenStreetMapCandidate[]> {
  await requireAuthorizedAdminSession();
  const kind = isSearchKind(input.kind) ? input.kind : "water";
  const supabase = await createAdminDataClient();
  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("id, name")
    .eq("id", input.cityId)
    .maybeSingle();

  if (cityError || !city || city.name !== input.cityName) {
    throw new Error("La ciudad seleccionada no es válida.");
  }

  const bounds = await resolveCityBounds(input.cityName);
  const query = buildOverpassQuery(bounds, kind);
  try {
    const payload = await requestOverpass(query);
    const elements = isRecord(payload) && Array.isArray(payload.elements)
      ? (payload.elements as OsmElement[])
      : [];
    const candidates = elements
      .map(parseElement)
      .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
      .slice(0, MAX_RESULTS);

    const externalIds = candidates.map((candidate) => candidate.externalId);
    const existingIds = new Set<string>();

    for (let index = 0; index < externalIds.length; index += 80) {
      const batch = externalIds.slice(index, index + 80);
      const { data, error } = await supabase
        .from("map_places")
        .select("external_id")
        .eq("source", "openstreetmap")
        .in("external_id", batch);

      if (error && isMissingExternalImportColumns(error.message)) {
        const candidateBatch = candidates.slice(index, index + 80);
        const urls = candidateBatch.map(getOpenStreetMapUrl);
        const fallback = await supabase
          .from("map_places")
          .select("source_url")
          .eq("source", "openstreetmap")
          .in("source_url", urls);
        if (fallback.error) {
          throw new Error(`No se pudieron comprobar duplicados: ${fallback.error.message}`);
        }
        const existingUrls = new Set(fallback.data.flatMap((place) => place.source_url ? [place.source_url] : []));
        candidateBatch.forEach((candidate) => {
          if (existingUrls.has(getOpenStreetMapUrl(candidate))) existingIds.add(candidate.externalId);
        });
        continue;
      }
      if (error) throw new Error(`No se pudieron comprobar duplicados: ${error.message}`);
      data.forEach((place) => {
        if (place.external_id) existingIds.add(place.external_id);
      });
    }

    return candidates.map((candidate) => ({
      ...candidate,
      alreadyImported: existingIds.has(candidate.externalId),
    }));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OpenStreetMap tardó demasiado en responder. Inténtalo de nuevo.");
    }
    throw error;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function parseCandidate(value: FormDataEntryValue): OpenStreetMapCandidate | null {
  if (typeof value !== "string" || value.length > 12_000) return null;

  try {
    const candidate: unknown = JSON.parse(value);
    if (!isRecord(candidate)) return null;
    const externalId = String(candidate.externalId ?? "");
    const category = String(candidate.category ?? "") as MapPlaceCategory;
    const latitude = Number(candidate.latitude);
    const longitude = Number(candidate.longitude);
    const name = String(candidate.name ?? "").trim().slice(0, 120);

    if (
      !/^(node|way|relation)\/\d+$/.test(externalId) ||
      !validCategories.has(category) ||
      !name ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }

    const [osmType, id] = externalId.split("/");
    const osmId = Number(id);
    const tags = normalizeTags(candidate.tags);

    return {
      externalId,
      osmType: osmType as OpenStreetMapCandidate["osmType"],
      osmId,
      name,
      description: String(candidate.description ?? "").slice(0, 300),
      category,
      latitude,
      longitude,
      amenities: Array.isArray(candidate.amenities)
        ? candidate.amenities.filter((item): item is string => typeof item === "string").slice(0, 12)
        : [],
      isAccessible: candidate.isAccessible === true,
      openingHoursNote: String(candidate.openingHoursNote ?? "").slice(0, 200),
      tags,
      alreadyImported: false,
    };
  } catch {
    return null;
  }
}

export async function importOpenStreetMapPlacesAction(formData: FormData) {
  "use server";
  const cityId = String(formData.get("cityId") ?? "").trim();
  const kind = String(formData.get("kind") ?? "water");
  const selected = formData
    .getAll("candidate")
    .slice(0, MAX_IMPORTS_PER_REQUEST)
    .map(parseCandidate)
    .filter((candidate): candidate is OpenStreetMapCandidate => Boolean(candidate));

  if (!cityId || selected.length === 0) {
    redirect(`/panel/lugares/importar?cityId=${encodeURIComponent(cityId)}&kind=${encodeURIComponent(kind)}&error=seleccion`);
  }

  const supabase = await createAdminDataClient();
  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("id")
    .eq("id", cityId)
    .maybeSingle();

  if (cityError || !city) throw new Error("La ciudad seleccionada no existe.");

  const externalIds = selected.map((candidate) => candidate.externalId);
  const { data: existing, error: existingError } = await supabase
    .from("map_places")
    .select("external_id")
    .eq("source", "openstreetmap")
    .in("external_id", externalIds);

  let supportsExternalFields = true;
  const existingIds = new Set<string>();

  if (existingError && isMissingExternalImportColumns(existingError.message)) {
    supportsExternalFields = false;
    const urls = selected.map(getOpenStreetMapUrl);
    const fallback = await supabase
      .from("map_places")
      .select("source_url")
      .eq("source", "openstreetmap")
      .in("source_url", urls);
    if (fallback.error) {
      throw new Error(`No se pudieron comprobar los lugares existentes: ${fallback.error.message}`);
    }
    const existingUrls = new Set(fallback.data.flatMap((place) => place.source_url ? [place.source_url] : []));
    selected.forEach((candidate) => {
      if (existingUrls.has(getOpenStreetMapUrl(candidate))) existingIds.add(candidate.externalId);
    });
  } else if (existingError) {
    throw new Error(`No se pudieron comprobar los lugares existentes: ${existingError.message}`);
  } else {
    existing.forEach((place) => {
      if (place.external_id) existingIds.add(place.external_id);
    });
  }
  const newCandidates = selected.filter(
    (candidate) => !existingIds.has(candidate.externalId),
  );
  const importedAt = new Date().toISOString();
  const rows: Database["public"]["Tables"]["map_places"]["Insert"][] =
    newCandidates.map((candidate) => {
      const category = getMapPlaceCategory(candidate.category);
      const externalData: Json = {
        osm_type: candidate.osmType,
        osm_id: candidate.osmId,
        tags: candidate.tags,
      };

      return {
        city_id: cityId,
        slug: `${slugify(candidate.name) || "lugar"}-osm-${candidate.osmId}`,
        name: candidate.name,
        description: candidate.description || null,
        category: candidate.category,
        icon_name: category.iconName,
        geometry_type: "point",
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        amenities: candidate.amenities,
        is_accessible: candidate.isAccessible,
        opening_hours_note: candidate.openingHoursNote || null,
        accessibility_note: candidate.isAccessible
          ? "OpenStreetMap indica acceso adaptado; pendiente de comprobación."
          : null,
        source_label: "OpenStreetMap contributors",
        source_url: getOpenStreetMapUrl(candidate),
        source: "openstreetmap",
        source_note: "Importado automáticamente; pendiente de revisión manual por Pickyalo.",
        ...(supportsExternalFields
          ? {
              external_id: candidate.externalId,
              external_data: externalData,
              source_updated_at: importedAt,
            }
          : {}),
        plan_role: getDefaultMapPlacePlanRole(candidate.category),
        is_plan_candidate: false,
        status: "draft",
        is_active: false,
        verified_at: null,
        sort_order: 100,
      };
    });

  if (rows.length > 0) {
    const { error } = await supabase.from("map_places").insert(rows);
    if (error) throw new Error(`No se pudieron importar los lugares: ${error.message}`);
  }

  revalidatePath("/panel/lugares");
  revalidatePath("/mapa");
  redirect(
    `/panel/lugares?importados=${rows.length}&omitidos=${selected.length - rows.length}`,
  );
}
