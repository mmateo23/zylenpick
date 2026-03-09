"use client";

import type { CartState } from "@/features/cart/types";
import type {
  OrderRecord,
  OrderResolutionStatus,
} from "@/features/orders/types";

const ORDER_STORAGE_KEY = "zylenpick.orders";
const ACTIVE_ORDER_STORAGE_KEY = "zylenpick.active-order-id";
const ACTIVE_ORDER_GRACE_MS = 1000 * 60 * 60 * 3;

export const ORDER_UPDATED_EVENT = "zylenpick:order-updated";

function readOrders(): OrderRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(ORDER_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as OrderRecord[];

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map((order) => ({
      ...order,
      resolutionStatus: order.resolutionStatus ?? "active",
      resolvedAt: order.resolvedAt ?? null,
    }));
  } catch {
    return [];
  }
}

function writeOrders(orders: OrderRecord[]) {
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
}

function readActiveOrderId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
}

function writeActiveOrderId(orderId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (orderId) {
    window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, orderId);
  } else {
    window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
}

function createOrderId() {
  return `ZP-${Date.now().toString().slice(-6)}`;
}

function isOrderExpired(order: OrderRecord) {
  return Date.now() > new Date(order.pickupAt).getTime() + ACTIVE_ORDER_GRACE_MS;
}

function updateOrderResolutionStatus(
  orderId: string,
  resolutionStatus: OrderResolutionStatus,
) {
  const nextOrders = readOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          resolutionStatus,
          resolvedAt: new Date().toISOString(),
        }
      : order,
  );

  writeOrders(nextOrders);
}

export function createOrderFromCart(input: {
  cart: CartState;
  customerName: string;
  customerPhone: string;
  pickupAt: string;
  notes?: string;
}) {
  if (!input.cart.venue || input.cart.items.length === 0) {
    return null;
  }

  const currency = input.cart.items[0]?.currency ?? "EUR";
  const totalAmount = input.cart.items.reduce(
    (accumulator, item) => accumulator + item.priceAmount * item.quantity,
    0,
  );

  const order: OrderRecord = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    pickupAt: input.pickupAt,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    notes: input.notes?.trim() ? input.notes.trim() : null,
    venue: input.cart.venue,
    items: input.cart.items,
    totalAmount,
    currency,
    resolutionStatus: "active",
    resolvedAt: null,
  };

  writeOrders([order, ...readOrders()]);
  writeActiveOrderId(order.id);

  return order;
}

export function getOrderById(orderId: string) {
  return readOrders().find((order) => order.id === orderId) ?? null;
}

export function getLatestOrder() {
  return readOrders()[0] ?? null;
}

export function getActiveOrder() {
  const activeOrderId = readActiveOrderId();

  if (!activeOrderId) {
    return null;
  }

  const order = getOrderById(activeOrderId);

  if (!order || order.resolutionStatus !== "active" || isOrderExpired(order)) {
    clearActiveOrder();
    return null;
  }

  return order;
}

export function clearActiveOrder() {
  writeActiveOrderId(null);
}

export function completeOrder(orderId: string) {
  updateOrderResolutionStatus(orderId, "completed");

  if (readActiveOrderId() === orderId) {
    clearActiveOrder();
  }
}

export function cancelOrder(orderId: string) {
  updateOrderResolutionStatus(orderId, "cancelled");

  if (readActiveOrderId() === orderId) {
    clearActiveOrder();
  }
}
