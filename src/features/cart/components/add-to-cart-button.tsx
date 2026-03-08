"use client";

import { useState } from "react";

import { addItemToCart } from "@/features/cart/services/cart-storage";
import type { CartVenue } from "@/features/cart/types";

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
};

export function AddToCartButton({ venue, item }: AddToCartButtonProps) {
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

    setFeedback("Añadido al carrito.");
  };

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center rounded-full bg-[color:var(--surface-dark)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--surface-dark-soft)]"
      >
        Añadir al carrito
      </button>
      {feedback ? (
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
