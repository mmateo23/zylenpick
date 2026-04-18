"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics/track-event";

type VenueViewTrackerProps = {
  citySlug: string;
  cityName: string;
  venueSlug: string;
  venueName: string;
};

export function VenueViewTracker({
  citySlug,
  cityName,
  venueSlug,
  venueName,
}: VenueViewTrackerProps) {
  useEffect(() => {
    trackEvent("view_venue", {
      city_slug: citySlug,
      city_name: cityName,
      venue_slug: venueSlug,
      venue_name: venueName,
      source: "venue_page",
    });
  }, [cityName, citySlug, venueName, venueSlug]);

  return null;
}
