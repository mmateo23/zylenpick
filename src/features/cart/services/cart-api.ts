"use client";

import { CART_SESSION_STORAGE_KEY } from "@/features/cart/constants";
import type { PersistedCart } from "@/features/cart/types";

const fallbackCart: PersistedCart = {
  cartId: null,
  venueId: null,
  venueName: null,
  itemIds: [],
  totalItems: 0,
};

export function getCartSessionId() {
  const existingSessionId = window.localStorage.getItem(CART_SESSION_STORAGE_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(CART_SESSION_STORAGE_KEY, sessionId);

  return sessionId;
}

export async function fetchPersistedCart(
  sessionId: string,
): Promise<PersistedCart | null> {
  try {
    const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as PersistedCart;
    return data;
  } catch {
    return null;
  }
}

export async function persistCartItem(params: {
  sessionId: string;
  venueId: string;
  menuItemId: string;
}): Promise<PersistedCart | null> {
  try {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as PersistedCart;
    return data;
  } catch {
    return null;
  }
}

export function getFallbackCart() {
  return fallbackCart;
}
