"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import {
  createAdminMutationClient,
  requireAuthorizedAdminSession,
} from "@/features/admin/services/admin-auth";
import type { Database } from "@/types/database";

const STORAGE_BUCKET = "pickyalo-media";
const MAX_UPLOAD_BYTES = 700 * 1024;

export type ScoutCaptureResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

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
  let storagePath: string | null = null;
  let supabase: Awaited<ReturnType<typeof createAdminMutationClient>> | null = null;

  try {
    const session = await requireAuthorizedAdminSession();
    supabase = await createAdminMutationClient();

    const cityId = String(formData.get("cityId") ?? "").trim();
    if (!cityId) throw new Error("No hay una ciudad disponible para la captura.");

    const image = formData.get("cover");
    if (!(image instanceof File) || image.size === 0) {
      throw new Error("Haz una foto o elige una imagen antes de guardar.");
    }
    if (image.type !== "image/webp") {
      throw new Error("La imagen no se pudo convertir a WebP.");
    }
    if (image.size > MAX_UPLOAD_BYTES) {
      throw new Error("La imagen procesada sigue siendo demasiado grande.");
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

    const id = randomUUID();
    storagePath = `map-places/${id}/cover.webp`;
    const imageBytes = new Uint8Array(await image.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, imageBytes, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      });
    if (uploadError) throw new Error(`No se pudo subir la foto: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const capturedBy =
      session.user?.id && session.user.id !== "development-admin"
        ? session.user.id
        : null;
    const payload: Database["public"]["Tables"]["map_places"]["Insert"] = {
      id,
      city_id: cityId,
      name: optionalText(formData, "name", 140),
      slug: null,
      category,
      icon_name: iconName,
      latitude,
      longitude,
      location_accuracy_m: locationAccuracyM,
      cover_image_url: publicUrlData.publicUrl,
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
      const cleanup = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      if (!cleanup.error) storagePath = null;
      throw new Error(`No se pudo guardar el borrador: ${insertError.message}`);
    }

    storagePath = null;
    revalidatePath("/panel/lugares");
    return { ok: true, id };
  } catch (error) {
    if (storagePath && supabase) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo guardar la captura.",
    };
  }
}
