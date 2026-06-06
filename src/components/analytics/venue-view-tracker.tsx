"use client";

import { useEffect } from "react";

import { captureLocalVisto } from "@/lib/analytics/posthog-events";
import { trackEvent } from "@/lib/analytics/track-event";

type VenueViewTrackerProps = {
  citySlug: string;
  cityName: string;
  venueId: string;
  venueSlug: string;
  venueName: string;
};

export function VenueViewTracker({
  citySlug,
  cityName,
  venueId,
  venueSlug,
  venueName,
}: VenueViewTrackerProps) {
  useEffect(() => {
    captureLocalVisto({
      city_slug: citySlug,
      venue_id: venueId,
      venue_slug: venueSlug,
      venue_name: venueName,
      source_page: "venue_page",
    });

    trackEvent("view_venue", {
      city_slug: citySlug,
      city_name: cityName,
      venue_id: venueId,
      venue_slug: venueSlug,
      venue_name: venueName,
      source: "venue_page",
    });
  }, [cityName, citySlug, venueId, venueName, venueSlug]);

  return null;
}
