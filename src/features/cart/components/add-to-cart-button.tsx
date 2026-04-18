"use client";

import { useState } from "react";

import { addItemToCart } from "@/features/cart/services/cart-storage";
import type { CartVenue } from "@/features/cart/types";
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
  label = "Añadir al carrito",
}: AddToCartButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAdd = () => {
    const result = addItemToCart({
      venue,
      item,
    });

    if (result.status === "conflict") {
      setFeedback(`Tu carrito pertenece a ${result.conflictingVenueName}.`);
      return;
    }

    trackEvent("add_to_cart", {
      city_slug: venue.citySlug,
      city_name: venue.cityName,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: item.id,
      item_name: item.name,
      source,
      price: item.priceAmount / 100,
      currency: item.currency,
    });

    setFeedback("Añadido al carrito.");
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
