"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import {
  createAdminMutationClient,
  requireAuthorizedAdminSession,
} from "@/features/admin/services/admin-auth";
import type { Database } from "@/types/database";

const STORAGE_BUCKET = "pickyalo-media";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ScoutCaptureResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type ScoutUploadTicketResult =
  | {
      ok: true;
      id: string;
      uploads: {
        cover: { signedUrl: string };
        thumbnail: { signedUrl: string };
      };
    }
  | { ok: false; error: string };

function getScoutStoragePaths(id: string) {
  return {
    cover: `map-places/${id}/cover.webp`,
    thumbnail: `map-places/${id}/thumb.webp`,
  };
}

function validateUploadId(value: string) {
  if (!UUID_PATTERN.test(value)) throw new Error("La captura no tiene un identificador válido.");
  return value;
}

export async function prepareScoutUploadAction(): Promise<ScoutUploadTicketResult> {
  try {
    await requireAuthorizedAdminSession();
    const supabase = await createAdminMutationClient();
    const id = randomUUID();
    const paths = getScoutStoragePaths(id);
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

export async function discardScoutUploadAction(id: string) {
  try {
    await requireAuthorizedAdminSession();
    const safeId = validateUploadId(id);
    const supabase = await createAdminMutationClient();
    const paths = getScoutStoragePaths(safeId);
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

export async function createScoutDraftAction(
  formData: FormData,
): Promise<ScoutCaptureResult> {
  let uploadId: string | null = null;
  let supabase: Awaited<ReturnType<typeof createAdminMutationClient>> | null = null;

  try {
    const session = await requireAuthorizedAdminSession();
    supabase = await createAdminMutationClient();

    const cityId = String(formData.get("cityId") ?? "").trim();
    if (!cityId) throw new Error("No hay una ciudad disponible para la captura.");

    uploadId = validateUploadId(String(formData.get("uploadId") ?? "").trim());
    const storagePaths = getScoutStoragePaths(uploadId);
    const { data: uploadedFiles, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`map-places/${uploadId}`, { limit: 10 });
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

    const category = optionalText(formData, "category", 80);
    let iconName: string | null = null;
    if (category) {
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

    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("id")
      .eq("id", cityId)
      .eq("is_active", true)
      .maybeSingle();
    if (cityError || !city) throw new Error("La ciudad seleccionada no está disponible.");

    const accessValue = String(formData.get("accessType") ?? "").trim();
    const accessType = ["free", "restricted", "unknown"].includes(accessValue)
      ? (accessValue as "free" | "restricted" | "unknown")
      : null;

    const { data: coverUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePaths.cover);
    const { data: thumbnailUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePaths.thumbnail);

    const capturedBy =
      session.user?.id && session.user.id !== "development-admin"
        ? session.user.id
        : null;
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

    const { error: insertError } = await supabase.from("map_places").insert(payload);
    if (insertError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePaths.cover, storagePaths.thumbnail]);
      uploadId = null;
      throw new Error(`No se pudo guardar el borrador: ${insertError.message}`);
    }

    const id = uploadId;
    uploadId = null;
    revalidatePath("/panel/lugares");
    return { ok: true, id };
  } catch (error) {
    if (uploadId && supabase) {
      const paths = getScoutStoragePaths(uploadId);
      await supabase.storage.from(STORAGE_BUCKET).remove([paths.cover, paths.thumbnail]);
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo guardar la captura.",
    };
  }
}
