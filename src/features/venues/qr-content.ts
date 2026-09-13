import type { VenueQrFavoritesCopy } from "@/features/venues/types";

export const DEFAULT_VENUE_QR_FAVORITES_COPY: VenueQrFavoritesCopy = {
  eyebrow: "Si dudas, empieza aquí",
  title: "Los favoritos.",
  description:
    "Pide con los ojos. Mira lo mejor de la casa y pídeselo al personal.",
};

export function normalizeVenueQrFavoritesCopy(input: {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
}): VenueQrFavoritesCopy {
  return {
    eyebrow:
      input.eyebrow?.trim() || DEFAULT_VENUE_QR_FAVORITES_COPY.eyebrow,
    title: input.title?.trim() || DEFAULT_VENUE_QR_FAVORITES_COPY.title,
    description:
      input.description?.trim() ||
      DEFAULT_VENUE_QR_FAVORITES_COPY.description,
  };
}
