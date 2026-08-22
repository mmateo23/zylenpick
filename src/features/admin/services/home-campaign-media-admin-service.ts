"use server";

import { randomUUID } from "node:crypto";

import { createAdminMutationClient } from "@/features/admin/services/admin-auth";

const STORAGE_BUCKET = "pickyalo-media";

export type HomeCampaignUploadTicket =
  | { ok: true; signedUrl: string; publicUrl: string }
  | { ok: false; error: string };

export async function prepareHomeCampaignMediaUploadAction(
  mediaType: "image" | "video",
  fileExtension: string,
): Promise<HomeCampaignUploadTicket> {
  try {
    if (mediaType !== "image" && mediaType !== "video") {
      throw new Error("El tipo de recurso no es válido.");
    }

    const normalizedExtension = fileExtension
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const allowedExtensions =
      mediaType === "image" ? ["webp"] : ["mp4", "webm"];

    if (!allowedExtensions.includes(normalizedExtension)) {
      throw new Error(
        mediaType === "image"
          ? "La imagen debe procesarse como WebP."
          : "El vídeo debe ser MP4 o WebM.",
      );
    }

    const supabase = await createAdminMutationClient();
    const path = `site-design/home-campaign/${randomUUID()}.${normalizedExtension}`;
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error("No se pudo preparar la subida directa.");
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return {
      ok: true,
      signedUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo preparar el recurso.",
    };
  }
}
