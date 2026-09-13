import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VenueQrExperience } from "@/components/venues/venue-qr-experience";
import { createDevelopmentQrSponsor } from "@/features/venues/qr-sponsor-config";
import {
  getVenueQrNearby,
  getVenueQrSponsor,
} from "@/features/venues/services/venue-qr-service";
import { getVenueDetailsBySlug } from "@/features/venues/services/venues-service";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 900;

type VenueQrPageProps = {
  params: {
    venueSlug: string;
  };
  searchParams?: {
    previewSponsor?: string;
  };
};

export async function generateMetadata({
  params,
}: VenueQrPageProps): Promise<Metadata> {
  const venue = await getVenueDetailsBySlug(params.venueSlug);

  if (!venue || !venue.qrEnabled) {
    return {
      title: "Selección del local",
      robots: { index: false, follow: true },
    };
  }

  const siteUrl = getSiteUrl();
  const qrPath = `/q/${venue.slug}`;
  const canonicalPath = `/zonas/${venue.city.slug}/venues/${venue.slug}`;
  const title = `${venue.name}: qué pedir aquí`;
  const description = `Descubre los platos y productos de ${venue.name}, sus especiales y la información práctica del local.`;
  const image =
    venue.qrHeroImageUrl ??
    venue.coverUrl ??
    venue.menuItems.find((item) => item.imageUrl)?.imageUrl;
  const imageUrl = image ? new URL(image, siteUrl).toString() : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: new URL(canonicalPath, siteUrl).toString(),
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: new URL(qrPath, siteUrl).toString(),
      siteName: "Pickyalo",
      locale: "es_ES",
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: `Selección de ${venue.name}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function VenueQrPage({
  params,
  searchParams,
}: VenueQrPageProps) {
  const venue = await getVenueDetailsBySlug(params.venueSlug);
  if (!venue || !venue.qrEnabled) notFound();

  const [nearby, configuredSponsor] = await Promise.all([
    venue.qrShowNearby ? getVenueQrNearby(venue) : Promise.resolve([]),
    getVenueQrSponsor(venue.id, venue.slug),
  ]);
  const previewSponsor =
    process.env.NODE_ENV === "development" &&
    searchParams?.previewSponsor === "1"
      ? createDevelopmentQrSponsor(
          venue.slug,
          venue.menuItems.find((item) => item.isFeatured)?.id ??
            venue.menuItems[0]?.id,
        )
      : null;

  return (
    <VenueQrExperience
      venue={venue}
      sponsor={configuredSponsor ?? previewSponsor}
      nearby={nearby}
    />
  );
}
