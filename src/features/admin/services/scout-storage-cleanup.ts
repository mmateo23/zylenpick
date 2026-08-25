import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const STORAGE_BUCKET = "pickyalo-media";

export type ScoutStorageEntity = "map-places" | "venues" | "menu-items";

export async function removeScoutMedia(
  supabase: SupabaseClient<Database>,
  entity: ScoutStorageEntity,
  id: string,
) {
  const basePath = `${entity}/${id}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([`${basePath}/cover.webp`, `${basePath}/thumb.webp`]);

  if (error) {
    throw new Error(`No se pudieron eliminar los archivos de Scout: ${error.message}`);
  }
}
