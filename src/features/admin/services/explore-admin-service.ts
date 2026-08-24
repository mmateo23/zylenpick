"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAdminDataClient,
  createAdminMutationClient,
  requireAuthorizedAdminSession,
} from "@/features/admin/services/admin-auth";
import type {
  ExploreRouteStatus,
  PublicExploreExperience,
} from "@/features/explore/types";
import type { Database } from "@/types/database";

const STORAGE_BUCKET = "pickyalo-media";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type AdminExploreSponsor = {
  id: string;
  name: string;
  logoUrl: string;
  shortMessage: string;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export type AdminExploreRoute = {
  id: string;
  cityId: string;
  cityName: string;
  sponsorId: string;
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  status: ExploreRouteStatus;
  sortOrder: string;
  availableLanguages: string;
  credits: string;
  reviewedAt: string;
  pointCount: number;
  publishedPointCount: number;
};

export type AdminExplorePoint = {
  id: string;
  routeId: string;
  mapPlaceId: string;
  sponsorId: string;
  slug: string;
  position: string;
  title: string;
  introduction: string;
  story: string;
  transcript: string;
  audioUrl: string;
  audioDurationSeconds: string;
  imageUrl: string;
  imageAlt: string;
  artisticMapUrl: string;
  latitude: string;
  longitude: string;
  credits: string;
  isActive: boolean;
  isPublished: boolean;
  publicToken: string;
  reviewedAt: string;
  placeName: string;
};

export type ExplorePlaceOption = {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  status: "draft" | "review" | "published";
  isActive: boolean;
};

export type ExploreCityOption = { id: string; name: string };

function requiredText(formData: FormData, key: string, label: string, max: number) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${label} es obligatorio.`);
  if (value.length > max) throw new Error(`${label} es demasiado largo.`);
  return value;
}

function optionalText(formData: FormData, key: string, max: number) {
  const value = String(formData.get(key) ?? "").trim();
  if (value.length > max) throw new Error(`El campo ${key} es demasiado largo.`);
  return value || null;
}

function optionalUrl(formData: FormData, key: string, label: string) {
  const value = optionalText(formData, key, 2000);
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
  } catch {
    throw new Error(`${label} debe ser una URL http(s) válida.`);
  }
  return value;
}

function parseSlug(formData: FormData) {
  const slug = requiredText(formData, "slug", "El slug", 120).toLowerCase();
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error("El slug solo puede contener minúsculas, números y guiones.");
  }
  return slug;
}

function parseInteger(formData: FormData, key: string, fallback: number, min = 0) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min) throw new Error(`${key} no es válido.`);
  return parsed;
}

function parseCoordinate(formData: FormData, key: string, min: number, max: number) {
  const raw = String(formData.get(key) ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error("Las coordenadas no son válidas.");
  }
  return parsed;
}

function parseDateTime(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("La fecha no es válida.");
  return date.toISOString();
}

function toLocalDateTime(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

export async function getAdminExploreCities(): Promise<ExploreCityOption[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(`No se pudieron cargar las ciudades: ${error.message}`);
  return data;
}

export async function getAdminExploreSponsors(): Promise<AdminExploreSponsor[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("explore_sponsors")
    .select("id, name, logo_url, short_message, link_url, starts_at, ends_at, is_active")
    .order("name");
  if (error) throw new Error(`No se pudieron cargar los patrocinadores: ${error.message}`);
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    logoUrl: item.logo_url ?? "",
    shortMessage: item.short_message ?? "",
    linkUrl: item.link_url ?? "",
    startsAt: toLocalDateTime(item.starts_at),
    endsAt: toLocalDateTime(item.ends_at),
    isActive: item.is_active,
  }));
}

export async function getAdminExploreRoutes(): Promise<AdminExploreRoute[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("explore_routes")
    .select(
      "id, city_id, sponsor_id, name, slug, description, cover_image_url, status, sort_order, available_languages, credits, reviewed_at, cities!inner(name)",
    )
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`No se pudieron cargar las rutas: ${error.message}`);

  const routeIds = data.map((route) => route.id);
  const { data: pointRows, error: pointRowsError } = routeIds.length
    ? await supabase
        .from("explore_route_points")
        .select("route_id, is_published, is_active")
        .in("route_id", routeIds)
    : { data: [], error: null };
  if (pointRowsError) {
    throw new Error(`No se pudieron contar las paradas: ${pointRowsError.message}`);
  }
  const counts = new Map<string, { total: number; published: number }>();
  for (const point of pointRows ?? []) {
    const current = counts.get(point.route_id) ?? { total: 0, published: 0 };
    current.total += 1;
    if (point.is_published && point.is_active) current.published += 1;
    counts.set(point.route_id, current);
  }

  return data.map((route) => ({
    id: route.id,
    cityId: route.city_id,
    cityName: route.cities.name,
    sponsorId: route.sponsor_id ?? "",
    name: route.name,
    slug: route.slug,
    description: route.description ?? "",
    coverImageUrl: route.cover_image_url ?? "",
    status: route.status,
    sortOrder: String(route.sort_order),
    availableLanguages: route.available_languages.join(", "),
    credits: route.credits ?? "",
    reviewedAt: route.reviewed_at ?? "",
    pointCount: counts.get(route.id)?.total ?? 0,
    publishedPointCount: counts.get(route.id)?.published ?? 0,
  }));
}

export async function getAdminExploreRouteById(id: string) {
  const routes = await getAdminExploreRoutes();
  return routes.find((route) => route.id === id) ?? null;
}

export async function getAdminExplorePlaceOptions(): Promise<ExplorePlaceOption[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("map_places")
    .select("id, city_id, name, category, latitude, longitude, status, is_active, cities!inner(name)")
    .not("name", "is", null)
    .order("name")
    .limit(1000);
  if (error) throw new Error(`No se pudieron cargar los lugares: ${error.message}`);
  return data
    .filter((item): item is typeof item & { name: string; category: string } => Boolean(item.name && item.category))
    .map((item) => ({
      id: item.id,
      name: item.name,
      cityId: item.city_id,
      cityName: item.cities.name,
      category: item.category,
      latitude: item.latitude,
      longitude: item.longitude,
      status: item.status,
      isActive: item.is_active,
    }));
}

export async function getAdminExplorePoints(routeId: string): Promise<AdminExplorePoint[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("explore_route_points")
    .select(
      "id, route_id, map_place_id, sponsor_id, slug, position, title, introduction, story, transcript, audio_url, audio_duration_seconds, image_url, image_alt, artistic_map_url, latitude, longitude, credits, is_active, is_published, public_token, reviewed_at, map_places!inner(name)",
    )
    .eq("route_id", routeId)
    .order("position");
  if (error) throw new Error(`No se pudieron cargar las paradas: ${error.message}`);
  return data.map((point) => ({
    id: point.id,
    routeId: point.route_id,
    mapPlaceId: point.map_place_id,
    sponsorId: point.sponsor_id ?? "",
    slug: point.slug,
    position: String(point.position),
    title: point.title,
    introduction: point.introduction ?? "",
    story: point.story ?? "",
    transcript: point.transcript ?? "",
    audioUrl: point.audio_url ?? "",
    audioDurationSeconds: point.audio_duration_seconds?.toString() ?? "",
    imageUrl: point.image_url ?? "",
    imageAlt: point.image_alt ?? "",
    artisticMapUrl: point.artistic_map_url ?? "",
    latitude: point.latitude?.toString() ?? "",
    longitude: point.longitude?.toString() ?? "",
    credits: point.credits ?? "",
    isActive: point.is_active,
    isPublished: point.is_published,
    publicToken: point.public_token,
    reviewedAt: point.reviewed_at ?? "",
    placeName: point.map_places.name ?? "Lugar sin nombre",
  }));
}

export async function getAdminExplorePointById(routeId: string, pointId: string) {
  const points = await getAdminExplorePoints(routeId);
  return points.find((point) => point.id === pointId) ?? null;
}

export async function getAdminExplorePreviewExperience(
  routeId: string,
  pointId: string,
): Promise<{ experience: PublicExploreExperience | null; missingFields: string[] }> {
  const [route, points, places, sponsors] = await Promise.all([
    getAdminExploreRouteById(routeId),
    getAdminExplorePoints(routeId),
    getAdminExplorePlaceOptions(),
    getAdminExploreSponsors(),
  ]);
  const point = points.find((item) => item.id === pointId) ?? null;
  if (!route || !point) return { experience: null, missingFields: ["Ruta o parada"] };

  const place = places.find((item) => item.id === point.mapPlaceId) ?? null;
  const missingFields = [
    !route.description && "Descripción de la ruta",
    !route.coverImageUrl && "Portada de la ruta",
    !place && "Lugar asociado",
    !point.introduction && "Introducción",
    !point.story && "Relato",
    !point.transcript && "Transcripción",
    !point.imageUrl && "Fotografía",
    !point.imageAlt && "Texto alternativo",
    !point.latitude && "Latitud",
    !point.longitude && "Longitud",
  ].filter((value): value is string => Boolean(value));

  if (missingFields.length || !place) return { experience: null, missingFields };

  const latitude = Number(point.latitude);
  const longitude = Number(point.longitude);
  const audioDurationSeconds = point.audioDurationSeconds
    ? Number(point.audioDurationSeconds)
    : null;
  if (
    ![latitude, longitude].every(Number.isFinite) ||
    (audioDurationSeconds !== null && !Number.isFinite(audioDurationSeconds))
  ) {
    return { experience: null, missingFields: ["Coordenadas válidas"] };
  }

  const next = points.find((item) => Number(item.position) > Number(point.position)) ?? null;
  const nextLatitude = next ? Number(next.latitude) : Number.NaN;
  const nextLongitude = next ? Number(next.longitude) : Number.NaN;
  const sponsorId = point.sponsorId || route.sponsorId;
  const sponsor = sponsors.find((item) => item.id === sponsorId) ?? null;

  return {
    missingFields: [],
    experience: {
      route: {
        id: route.id,
        slug: route.slug,
        name: route.name,
        description: route.description,
        coverImageUrl: route.coverImageUrl,
        availableLanguages: route.availableLanguages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        credits: route.credits || null,
        cityName: route.cityName,
      },
      point: {
        id: point.id,
        slug: point.slug,
        publicToken: point.publicToken,
        position: Number(point.position),
        title: point.title,
        introduction: point.introduction,
        story: point.story,
        transcript: point.transcript,
        audioUrl: point.audioUrl,
        audioDurationSeconds,
        imageUrl: point.imageUrl,
        imageAlt: point.imageAlt,
        artisticMapUrl: point.artisticMapUrl,
        latitude,
        longitude,
        credits: point.credits || null,
        place: {
          id: place.id,
          name: place.name,
          category: place.category,
        },
      },
      nextPoint:
        next && Number.isFinite(nextLatitude) && Number.isFinite(nextLongitude)
          ? {
              id: next.id,
              slug: next.slug,
              publicToken: next.publicToken,
              position: Number(next.position),
              title: next.title,
              latitude: nextLatitude,
              longitude: nextLongitude,
            }
          : null,
      totalPoints: points.length,
      sponsor: sponsor
        ? {
            id: sponsor.id,
            name: sponsor.name,
            logoUrl: sponsor.logoUrl || null,
            shortMessage: sponsor.shortMessage || null,
            linkUrl: sponsor.linkUrl || null,
          }
        : null,
    },
  };
}

async function ensurePublishedRouteHasPoint(routeId: string) {
  const supabase = await createAdminDataClient();
  const { count, error } = await supabase
    .from("explore_route_points")
    .select("id", { count: "exact", head: true })
    .eq("route_id", routeId)
    .eq("is_active", true)
    .eq("is_published", true);
  if (error || !count) {
    throw new Error("Publica al menos una parada antes de publicar la ruta.");
  }
}

export async function saveExploreRouteAction(routeId: string | null, formData: FormData) {
  "use server";
  const supabase = await createAdminMutationClient();
  const status = String(formData.get("status") ?? "draft") as ExploreRouteStatus;
  if (!(["draft", "published"] as string[]).includes(status)) throw new Error("Estado no válido.");
  if (routeId && status === "published") await ensurePublishedRouteHasPoint(routeId);

  const languages = requiredText(formData, "availableLanguages", "Los idiomas", 120)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const payload: Database["public"]["Tables"]["explore_routes"]["Insert"] = {
    city_id: requiredText(formData, "cityId", "La ciudad", 60),
    sponsor_id: optionalText(formData, "sponsorId", 60),
    name: requiredText(formData, "name", "El nombre", 160),
    slug: parseSlug(formData),
    description: optionalText(formData, "description", 1800),
    cover_image_url: optionalUrl(formData, "coverImageUrl", "La imagen de portada"),
    status,
    sort_order: parseInteger(formData, "sortOrder", 100),
    available_languages: Array.from(new Set(languages)),
    credits: optionalText(formData, "credits", 1200),
    reviewed_at: status === "published" ? new Date().toISOString() : null,
  };

  const result = routeId
    ? await supabase.from("explore_routes").update(payload).eq("id", routeId)
    : await supabase.from("explore_routes").insert(payload);
  if (result.error) throw new Error(`No se pudo guardar la ruta: ${result.error.message}`);
  revalidatePath("/panel/explora");
  revalidatePath("/explora", "layout");
  redirect("/panel/explora");
}

export async function saveExplorePointAction(
  routeId: string,
  pointId: string | null,
  formData: FormData,
) {
  "use server";
  const supabase = await createAdminMutationClient();
  const mapPlaceId = requiredText(formData, "mapPlaceId", "El lugar", 60);
  const isPublished = formData.get("isPublished") === "on";
  const isActive = formData.get("isActive") === "on";
  const latitude = parseCoordinate(formData, "latitude", -90, 90);
  const longitude = parseCoordinate(formData, "longitude", -180, 180);
  if ((latitude === null) !== (longitude === null)) throw new Error("Completa ambas coordenadas.");

  const { data: place, error: placeError } = await supabase
    .from("map_places")
    .select("id, status, is_active")
    .eq("id", mapPlaceId)
    .maybeSingle();
  if (placeError || !place) throw new Error("El lugar seleccionado no existe.");
  if (isPublished && (place.status !== "published" || !place.is_active)) {
    throw new Error("El lugar asociado debe estar publicado y activo antes de publicar la parada.");
  }

  let position = parseInteger(formData, "position", 0, 1);
  if (!position) {
    const { data: last } = await supabase
      .from("explore_route_points")
      .select("position")
      .eq("route_id", routeId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    position = (last?.position ?? 0) + 1;
  }

  const payload: Database["public"]["Tables"]["explore_route_points"]["Insert"] = {
    route_id: routeId,
    map_place_id: mapPlaceId,
    sponsor_id: optionalText(formData, "sponsorId", 60),
    slug: parseSlug(formData),
    position,
    title: requiredText(formData, "title", "El título", 180),
    introduction: optionalText(formData, "introduction", 600),
    story: optionalText(formData, "story", 16000),
    transcript: optionalText(formData, "transcript", 24000),
    audio_url: optionalUrl(formData, "audioUrl", "El audio"),
    audio_duration_seconds: String(formData.get("audioDurationSeconds") ?? "").trim()
      ? parseInteger(formData, "audioDurationSeconds", 0)
      : null,
    image_url: optionalUrl(formData, "imageUrl", "La fotografía"),
    image_alt: optionalText(formData, "imageAlt", 320),
    artistic_map_url: optionalUrl(formData, "artisticMapUrl", "El mapa artístico"),
    latitude,
    longitude,
    credits: optionalText(formData, "credits", 1600),
    is_active: isActive,
    is_published: isPublished,
    reviewed_at: isPublished ? new Date().toISOString() : null,
  };

  const result = pointId
    ? await supabase.from("explore_route_points").update(payload).eq("id", pointId)
    : await supabase.from("explore_route_points").insert(payload);
  if (result.error) throw new Error(`No se pudo guardar la parada: ${result.error.message}`);
  revalidatePath(`/panel/explora/${routeId}`);
  revalidatePath("/explora", "layout");
  redirect(`/panel/explora/${routeId}`);
}

export async function moveExplorePointAction(
  routeId: string,
  pointId: string,
  direction: "up" | "down",
) {
  "use server";
  const supabase = await createAdminMutationClient();
  const { error } = await supabase.rpc("move_explore_route_point", {
    p_route_id: routeId,
    p_point_id: pointId,
    p_direction: direction,
  });
  if (error) throw new Error(`No se pudo ordenar la ruta: ${error.message}`);
  revalidatePath(`/panel/explora/${routeId}`);
}

export async function saveExploreSponsorAction(sponsorId: string | null, formData: FormData) {
  "use server";
  const supabase = await createAdminMutationClient();
  const startsAt = parseDateTime(formData, "startsAt");
  const endsAt = parseDateTime(formData, "endsAt");
  if (startsAt && endsAt && endsAt < startsAt) throw new Error("La fecha final debe ser posterior.");
  const payload: Database["public"]["Tables"]["explore_sponsors"]["Insert"] = {
    name: requiredText(formData, "name", "El nombre", 120),
    logo_url: optionalUrl(formData, "logoUrl", "El logotipo"),
    short_message: optionalText(formData, "shortMessage", 280),
    link_url: optionalUrl(formData, "linkUrl", "El enlace"),
    starts_at: startsAt,
    ends_at: endsAt,
    is_active: formData.get("isActive") === "on",
  };
  const result = sponsorId
    ? await supabase.from("explore_sponsors").update(payload).eq("id", sponsorId)
    : await supabase.from("explore_sponsors").insert(payload);
  if (result.error) throw new Error(`No se pudo guardar el patrocinador: ${result.error.message}`);
  revalidatePath("/panel/explora", "layout");
  redirect("/panel/explora/patrocinadores");
}

type ExploreUploadKind = "photo" | "map" | "audio" | "logo";

const uploadExtensions: Record<ExploreUploadKind, Record<string, string>> = {
  photo: { "image/webp": "webp" },
  logo: { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" },
  map: {
    "image/webp": "webp",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
  },
  audio: {
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/webm": "webm",
  },
};

export async function prepareExploreUploadAction(
  kind: ExploreUploadKind,
  mimeType: string,
  scopeId: string,
) {
  "use server";
  await requireAuthorizedAdminSession();
  const extension = uploadExtensions[kind]?.[mimeType.toLowerCase()];
  if (!extension) return { ok: false as const, error: "Tipo de archivo no permitido." };
  const safeScope = scopeId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80) || "draft";
  const path = `explora/${safeScope}/${kind}/${randomUUID()}.${extension}`;
  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) return { ok: false as const, error: "No se pudo preparar la subida." };
  const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return {
    ok: true as const,
    signedUrl: data.signedUrl,
    path,
    publicUrl: publicData.publicUrl,
  };
}

export async function finalizeExploreUploadAction(
  kind: ExploreUploadKind,
  path: string,
) {
  "use server";
  await requireAuthorizedAdminSession();
  if (!path.startsWith("explora/") || path.includes("..") || !path.includes(`/${kind}/`)) {
    return { ok: false as const, error: "La ruta del archivo no es válida." };
  }

  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(path);
  if (error || !data) return { ok: false as const, error: "No se pudo validar el archivo subido." };

  const limits: Record<ExploreUploadKind, number> = {
    photo: 4 * 1024 * 1024,
    logo: 4 * 1024 * 1024,
    map: 12 * 1024 * 1024,
    audio: 30 * 1024 * 1024,
  };
  if (data.size > limits[kind]) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "El archivo supera el tamaño permitido." };
  }

  if (path.toLowerCase().endsWith(".svg")) {
    const source = await data.text();
    const unsafe = /<script|<foreignObject|\son\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|data:|javascript:)/i;
    if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(source) || unsafe.test(source)) {
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      return { ok: false as const, error: "El SVG contiene elementos no permitidos." };
    }
  }

  return { ok: true as const };
}

export async function discardExploreUploadAction(path: string) {
  "use server";
  try {
    await requireAuthorizedAdminSession();
    if (!path.startsWith("explora/") || path.includes("..")) return;
    const supabase = await createAdminMutationClient();
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  } catch {
    // Cleanup is best effort and scoped to newly uploaded Explora media.
  }
}
