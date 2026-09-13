"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapManagedVenue } from "./service";
import { isManageChange, MANAGE_TOKEN_PATTERN } from "./validation";
import type { ManageResult } from "./types";

export async function updateManagedVenue(token: string, change: unknown): Promise<ManageResult> {
  if (typeof token !== "string" || !MANAGE_TOKEN_PATTERN.test(token) || !isManageChange(change)) {
    return { ok: false, message: "El cambio no es válido. Revisa los datos." };
  }
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("update_venue_management", {
      p_token: token, p_change: change,
    });
    if (error) return { ok: false, message: "No se ha guardado. Vuelve a intentarlo." };
    if (!data) return { ok: false, expired: true, message: "Este enlace ya no está activo. Pide a Pickyalo el nuevo enlace." };
    const venue = mapManagedVenue(data);
    // Reuse public catalogue paths; never put bearer tokens into cache keys.
    for (const path of ["/", "/platos", "/mapa", "/zonas", "/cities", `/q/${venue.slug}`,
      `/panel/locales/${venue.id}`, `/panel/locales/${venue.id}/platos`, "/panel/platos"]) {
      revalidatePath(path);
    }
    if (venue.citySlug) {
      for (const prefix of ["/zonas", "/cities"]) {
        revalidatePath(`${prefix}/${venue.citySlug}`);
        revalidatePath(`${prefix}/${venue.citySlug}/venues/${venue.slug}`);
      }
    }
    return { ok: true, venue };
  } catch {
    return { ok: false, message: "No se ha podido confirmar el cambio. Comprueba tu conexión y recarga." };
  }
}
