"use server";

import { revalidatePath } from "next/cache";
import { createAdminMutationClient } from "./admin-auth";
import { normalizeDiscovery, safeMediaUrl, SHOT_IDS } from "@/features/discovery/discovery-config";
import { defaultSiteFunnelSettings } from "@/features/funnel/site-funnel-settings";
import type { Json } from "@/types/database";

export async function updateDiscoveryAction(formData: FormData) {
  const supabase = await createAdminMutationClient();
  const raw = String(formData.get("discovery") ?? "");
  if (raw.length > 100_000) throw new Error("La configuración es demasiado grande.");
  let input;
  try { input = JSON.parse(raw); } catch { throw new Error("No se pudo leer la selección."); }
  const config = normalizeDiscovery(input);
  for (const id of SHOT_IDS) {
    const shot = config.shots[id];
    if (!shot) continue;
    if (shot.startsOn && shot.endsOn && shot.startsOn > shot.endsOn) throw new Error("La fecha final debe ser posterior al inicio.");
    if (input.shots?.[id]?.mediaUrl && !safeMediaUrl(input.shots[id].mediaUrl)) throw new Error("Usa un recurso del sitio o una URL HTTPS válida.");
  }
  const { data: current, error: readError } = await supabase.from("site_funnel_settings").select("value, updated_at").eq("key", "platos").maybeSingle();
  if (readError) throw new Error("No se ha podido leer la configuración actual.");
  const previous = current?.value && typeof current.value === "object" && !Array.isArray(current.value) ? current.value : defaultSiteFunnelSettings.platos;
  const value = { ...previous, discovery: config } as unknown as Json;
  if (current) {
    const { data, error } = await supabase.from("site_funnel_settings").update({ value }).eq("key", "platos").eq("updated_at", current.updated_at).select("key");
    if (error || !data?.length) throw new Error("No se ha podido guardar. Recarga el panel para usar la versión más reciente.");
  } else {
    const { error } = await supabase.from("site_funnel_settings").insert({ key: "platos", value });
    if (error) throw new Error("No se ha podido guardar la selección.");
  }
  revalidatePath("/platos");
  revalidatePath("/panel/destacados");
  revalidatePath("/panel/destacados/escaparate");
  revalidatePath("/zonas/[citySlug]/venues/[venueSlug]", "page");
}
