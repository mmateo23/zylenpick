"use client";

import { useState } from "react";

import { PaperBagIcon } from "@/components/icons/pickyalo";
import { addItemToCart } from "@/features/cart/services/cart-storage";
import type { CartVenue } from "@/features/cart/types";
import {
  isDefinitivePrice,
  type PriceDisplayMode,
} from "@/features/pricing/price-display";
import { captureAddToCart } from "@/lib/analytics/posthog-events";
import { trackEvent } from "@/lib/analytics/track-event";
import { showCartToast, showErrorToast } from "@/lib/ui/toast";

type AddToCartButtonProps = {
  venue: CartVenue;
  item: {
    id: string;
    name: string;
    description: string | null;
    priceAmount: number;
    currency: string;
    priceDisplayMode?: PriceDisplayMode;
    priceDisplayText?: string | null;
    imageUrl: string | null;
  };
  className?: string;
  buttonClassName?: string;
  feedbackClassName?: string;
  source?: string;
  label?: string;
  disabled?: boolean;
  disabledLabel?: string;
};

export function AddToCartButton({
  venue,
  item,
  className,
  buttonClassName,
  feedbackClassName,
  source = "add_to_cart_button",
  disabled = false,
  disabledLabel = "Precio pendiente",
  label = "Añadir para recoger",
}: AddToCartButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [bagAnimationKey, setBagAnimationKey] = useState(0);

  const handleAdd = () => {
    if (disabled) {
      return;
    }

    const result = addItemToCart({
      venue,
      item,
    });

    if (result.status === "conflict") {
      setFeedback(`Tu cesta pertenece a ${result.conflictingVenueName}.`);
      showErrorToast({
        title: "Cesta de otro local",
        description: result.conflictingVenueName,
      });
      return;
    }

    const itemPrice = isDefinitivePrice(item)
      ? item.priceAmount / 100
      : undefined;

    captureAddToCart({
      city_slug: venue.citySlug,
      venue_id: venue.id,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: item.id,
      item_name: item.name,
      item_price: itemPrice,
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
      item_price: itemPrice,
      currency: item.currency,
    });

    setBagAnimationKey((currentKey) => currentKey + 1);
    setFeedback("Añadido para recoger.");
    showCartToast({
      title: "Añadido a tu cesta",
      description: item.name,
    });
  };

  return (
    <div className={className ?? "mt-7"}>
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className={`${
          buttonClassName ??
          "inline-flex items-center rounded-full bg-[#741314] px-5 py-3 text-sm font-semibold text-[#FDE3AD] shadow-[var(--card-shadow)] transition hover:bg-[#5F0F10]"
        } gap-2 ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
      >
        <PaperBagIcon
          size={21}
          strokeWidth={2.25}
          animated={bagAnimationKey > 0}
          triggerKey={bagAnimationKey}
        />
        {disabled ? disabledLabel : label}
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

