import type { CartItem, CartVenue } from "@/features/cart/types";

export type OrderResolutionStatus = "active" | "completed" | "cancelled";

export type OrderRecord = {
  id: string;
  createdAt: string;
  pickupAt: string;
  customerName: string;
  customerPhone: string;
  notes: string | null;
  venue: CartVenue;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  resolutionStatus: OrderResolutionStatus;
  resolvedAt: string | null;
};
