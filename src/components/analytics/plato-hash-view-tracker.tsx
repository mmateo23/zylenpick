"use client";

import { useEffect, useRef } from "react";

import { capturePlatoVisto } from "@/lib/analytics/posthog-events";

type PlatoHashViewItem = {
  id: string;
  name: string;
  priceAmount: number;
  currency: string;
};

type PlatoHashViewTrackerProps = {
  citySlug: string;
  venueId: string;
  venueSlug: string;
  venueName: string;
  items: PlatoHashViewItem[];
};

export function PlatoHashViewTracker({
  citySlug,
  venueId,
  venueSlug,
  venueName,
  items,
}: PlatoHashViewTrackerProps) {
  const capturedItemIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const captureCurrentHashItem = () => {
      const itemId = window.location.hash.replace(/^#plato-/, "");

      if (!itemId || capturedItemIdsRef.current.has(itemId)) {
        return;
      }

      const item = items.find((candidate) => candidate.id === itemId);

      if (!item) {
        return;
      }

      capturedItemIdsRef.current.add(itemId);
      capturePlatoVisto({
        city_slug: citySlug,
        venue_id: venueId,
        venue_slug: venueSlug,
        venue_name: venueName,
        item_id: item.id,
        item_name: item.name,
        item_price: item.priceAmount / 100,
        currency: item.currency,
        source: "venue_page_hash",
      });
    };

    captureCurrentHashItem();
    window.addEventListener("hashchange", captureCurrentHashItem);

    return () => {
      window.removeEventListener("hashchange", captureCurrentHashItem);
    };
  }, [citySlug, items, venueId, venueName, venueSlug]);

  return null;
}
