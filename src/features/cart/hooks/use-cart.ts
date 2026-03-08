"use client";

import { useEffect, useState } from "react";

import { CART_UPDATED_EVENT } from "@/features/cart/constants";
import { getCartTotals, readCart } from "@/features/cart/services/cart-storage";
import type { CartState } from "@/features/cart/types";

function createEmptyCart(): CartState {
  return {
    venue: null,
    items: [],
  };
}

export function useCart() {
  const [cart, setCart] = useState<CartState>(createEmptyCart);

  useEffect(() => {
    const syncCart = () => {
      setCart(readCart());
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  return {
    cart,
    totals: getCartTotals(cart),
  };
}
