export type VenueQrSponsor = {
  id: string;
  venueSlug: string;
  brandName: string;
  headline: string;
  description: string;
  logoUrl?: string | null;
  productImageUrl?: string | null;
  relatedMenuItemId?: string | null;
  href?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export function createDevelopmentQrSponsor(
  venueSlug: string,
  relatedMenuItemId?: string | null,
): VenueQrSponsor {
  return {
    id: "qr-sponsor-preview",
    venueSlug,
    brandName: "Mahou Cinco Estrellas",
    headline: "El acompañamiento de la casa",
    description:
      "Una combinación pensada para disfrutar aquí, con calma y recién servida.",
    relatedMenuItemId: relatedMenuItemId ?? null,
    href: null,
  };
}
