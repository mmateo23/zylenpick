"use client";

import { useEffect, useRef } from "react";

import {
  isDefinitivePrice,
  type PriceDisplayMode,
} from "@/features/pricing/price-display";
import { capturePlatoVisto } from "@/lib/analytics/posthog-events";

type PlatoHashViewItem = {
  id: string;
  name: string;
  priceAmount: number;
  currency: string;
  priceDisplayMode?: PriceDisplayMode | null;
  priceDisplayText?: string | null;
  categoryName?: string | null;
};

type PlatoHashViewTrackerProps = {
  citySlug: string;
  venueId: string;
  venueSlug: string;
  venueName: string;
  pricesVisible: boolean;
  items: PlatoHashViewItem[];
};

export function PlatoHashViewTracker({
  citySlug,
  venueId,
  venueSlug,
  venueName,
  pricesVisible,
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
        item_price: isDefinitivePrice({
          priceAmount: item.priceAmount,
          currency: item.currency,
          priceDisplayMode: item.priceDisplayMode,
          priceDisplayText: item.priceDisplayText,
          pricesVisible,
        })
          ? item.priceAmount / 100
          : undefined,
        item_category: item.categoryName,
        currency: item.currency,
        source: "hash",
      });
    };

    captureCurrentHashItem();
    window.addEventListener("hashchange", captureCurrentHashItem);

    return () => {
      window.removeEventListener("hashchange", captureCurrentHashItem);
    };
  }, [citySlug, items, pricesVisible, venueId, venueName, venueSlug]);

  return null;
}
