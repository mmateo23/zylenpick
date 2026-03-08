"use client";

import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
} from "@/features/cart/constants";
import type {
  AddCartItemInput,
  AddCartItemResult,
  CartState,
} from "@/features/cart/types";

function createEmptyCart(): CartState {
  return {
    venue: null,
    items: [],
  };
}

function emitCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function readCart(): CartState {
  if (typeof window === "undefined") {
    return createEmptyCart();
  }

  const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawValue) {
    return createEmptyCart();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CartState;

    if (!parsedValue || !Array.isArray(parsedValue.items)) {
      return createEmptyCart();
    }

    return {
      venue: parsedValue.venue ?? null,
      items: parsedValue.items,
    };
  } catch {
    return createEmptyCart();
  }
}

export function writeCart(cart: CartState) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  emitCartUpdated();
}

export function clearCart() {
  window.localStorage.removeItem(CART_STORAGE_KEY);
  emitCartUpdated();
}

export function addItemToCart(input: AddCartItemInput): AddCartItemResult {
  const currentCart = readCart();

  if (currentCart.venue && currentCart.venue.id !== input.venue.id) {
    return {
      status: "conflict",
      cart: currentCart,
      conflictingVenueName: currentCart.venue.name,
    };
  }

  const existingItem = currentCart.items.find((item) => item.id === input.item.id);

  const nextItems = existingItem
    ? currentCart.items.map((item) =>
        item.id === input.item.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    : [...currentCart.items, { ...input.item, quantity: 1 }];

  const nextCart: CartState = {
    venue: input.venue,
    items: nextItems,
  };

  writeCart(nextCart);

  return {
    status: "added",
    cart: nextCart,
  };
}

export function updateCartItemQuantity(itemId: string, quantity: number) {
  const currentCart = readCart();
  const nextItems = currentCart.items
    .map((item) => (item.id === itemId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  const nextCart: CartState = {
    venue: nextItems.length > 0 ? currentCart.venue : null,
    items: nextItems,
  };

  writeCart(nextCart);
  return nextCart;
}

export function removeCartItem(itemId: string) {
  return updateCartItemQuantity(itemId, 0);
}

export function getCartTotals(cart: CartState) {
  const totalItems = cart.items.reduce(
    (accumulator, item) => accumulator + item.quantity,
    0,
  );

  const totalAmount = cart.items.reduce(
    (accumulator, item) => accumulator + item.priceAmount * item.quantity,
    0,
  );

  return {
    totalItems,
    totalAmount,
  };
}
