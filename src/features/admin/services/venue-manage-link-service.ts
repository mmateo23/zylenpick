"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuthorizedAdminSession } from "./admin-auth";
import { getSiteUrl } from "@/lib/seo";

export async function getVenueManageLinkAction(venueId: string, regenerate = false): Promise<
  { ok: true; url: string } | { ok: false; message: string }
> {
  // Production requires the normal authenticated admin session. Development
  // follows the same local-only bypass as the rest of the existing admin panel.
  await requireAuthorizedAdminSession();
  if (typeof venueId !== "string" || typeof regenerate !== "boolean") {
    return { ok: false, message: "Comercio no válido." };
  }
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("admin_venue_manage_link", {
      p_venue_id: venueId, p_regenerate: regenerate,
    });
    if (error || !data) return { ok: false, message: "No se ha podido obtener el enlace." };
    return { ok: true, url: `${getSiteUrl()}/manage/${data}` };
  } catch {
    return { ok: false, message: "No se ha podido obtener el enlace. Inténtalo de nuevo." };
  }
}
