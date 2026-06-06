"use client";

import { useState } from "react";

import { addItemToCart } from "@/features/cart/services/cart-storage";
import type { CartVenue } from "@/features/cart/types";
import { captureAddToCart } from "@/lib/analytics/posthog-events";
import { trackEvent } from "@/lib/analytics/track-event";

type AddToCartButtonProps = {
  venue: CartVenue;
  item: {
    id: string;
    name: string;
    description: string | null;
    priceAmount: number;
    currency: string;
    imageUrl: string | null;
  };
  className?: string;
  buttonClassName?: string;
  feedbackClassName?: string;
  source?: string;
  label?: string;
};

export function AddToCartButton({
  venue,
  item,
  className,
  buttonClassName,
  feedbackClassName,
  source = "add_to_cart_button",
  label = "Añadir para recoger",
}: AddToCartButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAdd = () => {
    const result = addItemToCart({
      venue,
      item,
    });

    if (result.status === "conflict") {
      setFeedback(`Tu cesta pertenece a ${result.conflictingVenueName}.`);
      return;
    }

    captureAddToCart({
      city_slug: venue.citySlug,
      venue_id: venue.id,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: item.id,
      item_name: item.name,
      item_price: item.priceAmount / 100,
      currency: item.currency,
      quantity: 1,
      cart_total_items: result.cart.items.reduce(
        (totalItems, cartItem) => totalItems + cartItem.quantity,
        0,
      ),
      source,
    });

    trackEvent("add_to_cart", {
      city_slug: venue.citySlug,
      city_name: venue.cityName,
      venue_id: venue.id,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: item.id,
      item_name: item.name,
      source,
      item_price: item.priceAmount / 100,
      currency: item.currency,
    });

    setFeedback("Añadido para recoger.");
  };

  return (
    <div className={className ?? "mt-7"}>
      <button
        type="button"
        onClick={handleAdd}
        className={
          buttonClassName ??
          "magnetic-button inline-flex items-center rounded-full bg-[color:var(--surface-dark)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--surface-dark-soft)]"
        }
      >
        {label}
      </button>
      {feedback ? (
        <p
          className={
            feedbackClassName ??
            "mt-3 text-sm leading-6 text-[color:var(--muted)]"
          }
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
