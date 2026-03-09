"use client";

import type { CartState } from "@/features/cart/types";
import type { OrderRecord } from "@/features/orders/types";

const ORDER_STORAGE_KEY = "zylenpick.orders";
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
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: OrderRecord[]) {
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
}

function createOrderId() {
  return `ZP-${Date.now().toString().slice(-6)}`;
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
  };

  const currentOrders = readOrders();
  writeOrders([order, ...currentOrders]);

  return order;
}

export function getOrderById(orderId: string) {
  return readOrders().find((order) => order.id === orderId) ?? null;
}

export function getLatestOrder() {
  return readOrders()[0] ?? null;
}
