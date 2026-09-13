"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import {
  captureQrVenueEvent,
  type QrVenueEventProperties,
} from "@/lib/analytics/posthog-events";

type QrVenueAnalyticsProps = {
  venueId: string;
  venueSlug: string;
  citySlug: string;
  sponsor?: {
    id: string;
    name: string;
  } | null;
};

type QrTrackedLinkProps = {
  href: string;
  eventName:
    | "qr_product_clicked"
    | "qr_sponsor_clicked"
    | "qr_nearby_clicked";
  properties: QrVenueEventProperties;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  external?: boolean;
};

export function VenueQrAnalytics({
  venueId,
  venueSlug,
  citySlug,
  sponsor,
}: QrVenueAnalyticsProps) {
  useEffect(() => {
    const baseProperties = {
      venue_id: venueId,
      venue_slug: venueSlug,
      city_slug: citySlug,
    };

    captureQrVenueEvent("qr_venue_viewed", baseProperties, venueId);

    if (sponsor) {
      captureQrVenueEvent(
        "qr_promo_viewed",
        {
          ...baseProperties,
          promo_id: sponsor.id,
          sponsor_id: sponsor.id,
          sponsor_name: sponsor.name,
        },
        `${venueId}:${sponsor.id}`,
      );
    }
  }, [citySlug, sponsor, venueId, venueSlug]);

  return null;
}

export function QrTrackedLink({
  href,
  eventName,
  properties,
  children,
  className,
  ariaLabel,
  external = false,
}: QrTrackedLinkProps) {
  const handleClick = () => captureQrVenueEvent(eventName, properties);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
