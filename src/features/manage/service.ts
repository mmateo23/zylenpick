import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getVenueOpeningStatus, normalizeOpeningHours } from "@/features/venues/opening-hours";
import type { Json } from "@/types/database";
import type { ManagedVenue } from "./types";
import { MANAGE_TOKEN_PATTERN } from "./validation";

export function mapManagedVenue(data: Json): ManagedVenue {
  const venue = data as unknown as ManagedVenue;
  const openingHours = normalizeOpeningHours(venue.openingHours);
  return { ...venue, openingHours, isOpenNow: getVenueOpeningStatus(openingHours, venue.manualOpenStatus).isOpenNow };
}

export async function readManagedVenue(token: string): Promise<ManagedVenue | null> {
  noStore();
  if (!MANAGE_TOKEN_PATTERN.test(token)) return null;
  const { data, error } = await createSupabaseAdminClient().rpc("read_venue_management", { p_token: token });
  // Never include credentials or raw database errors in logs or client messages.
  if (error) throw new Error("No se ha podido cargar el comercio. Inténtalo de nuevo.");
  return data ? mapManagedVenue(data) : null;
}
