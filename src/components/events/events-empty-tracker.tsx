"use client";

import { useEffect } from "react";

import { capturePickyaloEvent } from "@/lib/analytics/posthog-events";

export function EventsEmptyTracker({ citySlug }: { citySlug: string }) {
  useEffect(() => {
    capturePickyaloEvent(
      "eventos_vacio_visto",
      { city_slug: citySlug, source: "eventos" },
      { dedupeKey: citySlug },
    );
  }, [citySlug]);

  return null;
}
