"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import {
  createAdminMutationClient,
  requireAuthorizedAdminSession,
} from "@/features/admin/services/admin-auth";
import { menuItemAllergenValues } from "@/features/venues/allergens";
import type { MenuItemAllergen } from "@/features/venues/types";
import type { Database } from "@/types/database";

const STORAGE_BUCKET = "pickyalo-media";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ScoutCaptureType = "place" | "venue" | "product";

export type ScoutVenueOption = {
  id: string;
  name: string;
  cityId: string | null;
};

export type ScoutCaptureResult =
  | {
      ok: true;
      id: string;
      type: ScoutCaptureType;
      venueId?: string;
    }
  | { ok: false; error: string };

export type ScoutUploadTicketResult =
  | {
      ok: true;
      id: string;
      type: ScoutCaptureType;
      uploads: {
        cover: { signedUrl: string };
        thumbnail: { signedUrl: string };
      };
    }
  | { ok: false; error: string };

function getScoutStoragePaths(type: ScoutCaptureType, id: string) {
  const basePath =
    type === "place"
      ? `map-places/${id}`
      : type === "venue"
        ? `venues/${id}`
        : `menu-items/${id}`;

  return {
    cover: `${basePath}/cover.webp`,
    thumbnail: `${basePath}/thumb.webp`,
  };
}

function parseCaptureType(value: FormDataEntryValue | string | null): ScoutCaptureType {
  const type = String(value ?? "").trim();
  if (type === "place" || type === "venue" || type === "product") return type;
  throw new Error("El tipo de captura no es válido.");
}

function validateUploadId(value: string) {
  if (!UUID_PATTERN.test(value)) throw new Error("La captura no tiene un identificador válido.");
  return value;
}

export async function prepareScoutUploadAction(
  captureType: ScoutCaptureType,
): Promise<ScoutUploadTicketResult> {
  try {
    await requireAuthorizedAdminSession();
    const supabase = await createAdminMutationClient();
    const id = randomUUID();
    const type = parseCaptureType(captureType);
    const paths = getScoutStoragePaths(type, id);
    const [coverResult, thumbnailResult] = await Promise.all([
      supabase.storage.from(STORAGE_BUCKET).createSignedUploadUrl(paths.cover),
      supabase.storage.from(STORAGE_BUCKET).createSignedUploadUrl(paths.thumbnail),
    ]);

    if (coverResult.error || thumbnailResult.error || !coverResult.data || !thumbnailResult.data) {
      throw new Error("No se pudo preparar la subida directa.");
    }

    return {
      ok: true,
      id,
      type,
      uploads: {
        cover: { signedUrl: coverResult.data.signedUrl },
        thumbnail: { signedUrl: thumbnailResult.data.signedUrl },
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo preparar la captura.",
    };
  }
}

export async function discardScoutUploadAction(type: ScoutCaptureType, id: string) {
  try {
    await requireAuthorizedAdminSession();
    const safeId = validateUploadId(id);
    const supabase = await createAdminMutationClient();
    const paths = getScoutStoragePaths(parseCaptureType(type), safeId);
    await supabase.storage.from(STORAGE_BUCKET).remove([paths.cover, paths.thumbnail]);
  } catch {
    // Cleanup is best effort and only targets the new capture paths.
  }
}

function optionalText(formData: FormData, key: string, maxLength: number) {
  const value = String(formData.get(key) ?? "").trim();
  if (value.length > maxLength) {
    throw new Error(`El campo ${key} es demasiado largo.`);
  }
  return value || null;
}

function optionalCoordinate(
  formData: FormData,
  key: "latitude" | "longitude",
  min: number,
  max: number,
) {
  const rawValue = String(formData.get(key) ?? "").trim().replace(",", ".");
  if (!rawValue) return null;
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error("La ubicación obtenida no es válida.");
  }
  return value;
}

function normalizeAllergens(formData: FormData) {
  return formData
    .getAll("allergens")
    .map((value) => String(value))
    .filter((value): value is MenuItemAllergen =>
      menuItemAllergenValues.has(value as MenuItemAllergen),
    );
}

function createDraftSlug(name: string, id: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return `${base || "local"}-${id.slice(0, 8)}`;
}

export async function getScoutVenueOptions(): Promise<ScoutVenueOption[]> {
  await requireAuthorizedAdminSession();
  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, city_id")
    .order("name", { ascending: true })
    .limit(500);

  if (error) {
    throw new Error(`No se pudieron cargar los locales: ${error.message}`);
  }

  return (data ?? []).map((venue) => ({
    id: venue.id,
    name: venue.name,
    cityId: venue.city_id,
  }));
}

export async function createScoutDraftAction(
  formData: FormData,
): Promise<ScoutCaptureResult> {
  let uploadId: string | null = null;
  let captureType: ScoutCaptureType = "place";
  let supabase: Awaited<ReturnType<typeof createAdminMutationClient>> | null = null;

  try {
    const session = await requireAuthorizedAdminSession();
    supabase = await createAdminMutationClient();
    captureType = parseCaptureType(formData.get("captureType"));

    const cityId = String(formData.get("cityId") ?? "").trim();
    if (captureType !== "product" && !cityId) {
      throw new Error("No hay una ciudad disponible para la captura.");
    }

    uploadId = validateUploadId(String(formData.get("uploadId") ?? "").trim());
    const storagePaths = getScoutStoragePaths(captureType, uploadId);
    const storageDirectory = storagePaths.cover.slice(0, storagePaths.cover.lastIndexOf("/"));
    const { data: uploadedFiles, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(storageDirectory, { limit: 10 });
    if (listError) throw new Error("No se pudo comprobar la foto subida.");
    const uploadedNames = new Set((uploadedFiles ?? []).map((file) => file.name));
    if (!uploadedNames.has("cover.webp") || !uploadedNames.has("thumb.webp")) {
      throw new Error("La foto no terminó de subirse. Reinténtalo.");
    }

    const latitude = optionalCoordinate(formData, "latitude", -90, 90);
    const longitude = optionalCoordinate(formData, "longitude", -180, 180);
    if ((latitude === null) !== (longitude === null)) {
      throw new Error("La ubicación debe incluir latitud y longitud.");
    }

    const accuracyRaw = String(formData.get("locationAccuracyM") ?? "").trim();
    const locationAccuracyM = accuracyRaw ? Math.max(0, Math.round(Number(accuracyRaw))) : null;
    if (accuracyRaw && !Number.isFinite(locationAccuracyM)) {
      throw new Error("La precisión GPS no es válida.");
    }

    const category = captureType === "place" ? optionalText(formData, "category", 80) : null;
    let iconName: string | null = null;
    if (captureType === "place" && category) {
      const { data: categoryRow, error: categoryError } = await supabase
        .from("map_place_categories")
        .select("icon_name")
        .eq("slug", category)
        .eq("is_active", true)
        .maybeSingle();
      if (categoryError || !categoryRow) {
        throw new Error("La categoría seleccionada ya no está disponible.");
      }
      iconName = categoryRow.icon_name;
    }

    if (captureType !== "product") {
      const { data: city, error: cityError } = await supabase
        .from("cities")
        .select("id")
        .eq("id", cityId)
        .eq("is_active", true)
        .maybeSingle();
      if (cityError || !city) throw new Error("La ciudad seleccionada no está disponible.");
    }

    const accessValue = String(formData.get("accessType") ?? "").trim();
    const accessType = ["free", "restricted", "unknown"].includes(accessValue)
      ? (accessValue as "free" | "restricted" | "unknown")
      : null;

    const { data: coverUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePaths.cover);
    const { data: thumbnailUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePaths.thumbnail);

    const capturedBy =
      session.user?.id && session.user.id !== "development-admin"
        ? session.user.id
        : null;
    let insertError: { message: string } | null = null;
    let venueId: string | undefined;

    if (captureType === "place") {
      const payload: Database["public"]["Tables"]["map_places"]["Insert"] = {
        id: uploadId,
        city_id: cityId,
        name: optionalText(formData, "name", 140),
        slug: null,
        category,
        icon_name: iconName,
        latitude,
        longitude,
        location_accuracy_m: locationAccuracyM,
        cover_image_url: coverUrlData.publicUrl,
        thumbnail_image_url: thumbnailUrlData.publicUrl,
        opening_hours_note: optionalText(formData, "availability", 260),
        source_note: optionalText(formData, "note", 600),
        source: "field",
        access_type: accessType,
        captured_by: capturedBy,
        capture_method: "scout",
        status: "draft",
        is_active: false,
        is_plan_candidate: false,
        verified_at: null,
        verified_by: null,
      };
      ({ error: insertError } = await supabase.from("map_places").insert(payload));
    } else if (captureType === "venue") {
      const venueName = optionalText(formData, "name", 140);
      if (!venueName) throw new Error("Escribe el nombre del local.");
      const payload: Database["public"]["Tables"]["venues"]["Insert"] = {
        id: uploadId,
        city_id: cityId,
        name: venueName,
        slug: createDraftSlug(venueName, uploadId),
        discovery_category: optionalText(formData, "venueCategory", 100),
        description: optionalText(formData, "description", 1200),
        address: optionalText(formData, "address", 260),
        latitude,
        longitude,
        location_accuracy_m: locationAccuracyM,
        cover_url: coverUrlData.publicUrl,
        scout_note: optionalText(formData, "note", 600),
        observed_hours: optionalText(formData, "availability", 260),
        captured_by: capturedBy,
        capture_method: "scout",
        capture_status: "pending",
        prices_visible: false,
        is_published: false,
        is_active: false,
      };
      ({ error: insertError } = await supabase.from("venues").insert(payload));
      venueId = uploadId;
    } else {
      venueId = String(formData.get("venueId") ?? "").trim();
      if (!UUID_PATTERN.test(venueId)) throw new Error("Selecciona el local del producto.");
      const productName = optionalText(formData, "name", 140);
      if (!productName) throw new Error("Escribe el nombre del producto.");
      const { data: venue, error: venueError } = await supabase
        .from("venues")
        .select("id")
        .eq("id", venueId)
        .maybeSingle();
      if (venueError || !venue) throw new Error("El local seleccionado ya no está disponible.");

      const payload: Database["public"]["Tables"]["menu_items"]["Insert"] = {
        id: uploadId,
        venue_id: venueId,
        name: productName,
        description: optionalText(formData, "description", 1200),
        category_name: optionalText(formData, "productCategory", 100),
        image_url: coverUrlData.publicUrl,
        allergens: normalizeAllergens(formData),
        price_amount: 0,
        price_display_mode: "hidden",
        currency: "EUR",
        is_available: false,
        capture_latitude: latitude,
        capture_longitude: longitude,
        location_accuracy_m: locationAccuracyM,
        scout_note: optionalText(formData, "note", 600),
        captured_by: capturedBy,
        capture_method: "scout",
        capture_status: "pending",
      };
      ({ error: insertError } = await supabase.from("menu_items").insert(payload));
    }

    if (insertError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePaths.cover, storagePaths.thumbnail]);
      uploadId = null;
      throw new Error(`No se pudo guardar el borrador: ${insertError.message}`);
    }

    const id = uploadId;
    uploadId = null;
    if (captureType === "place") revalidatePath("/panel/lugares");
    if (captureType === "venue") revalidatePath("/panel/locales");
    if (captureType === "product" && venueId) {
      revalidatePath(`/panel/locales/${venueId}/platos`);
    }
    return { ok: true, id, type: captureType, venueId };
  } catch (error) {
    if (uploadId && supabase) {
      const paths = getScoutStoragePaths(captureType, uploadId);
      await supabase.storage.from(STORAGE_BUCKET).remove([paths.cover, paths.thumbnail]);
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo guardar la captura.",
    };
  }
}
