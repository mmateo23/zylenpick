import { PRICE_DISPLAY_MODES } from "@/features/pricing/price-display";
import type { ManageChange } from "./types";

export const MANAGE_TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseManagePrice(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Math.round(Number(normalized) * 100);
  return amount <= 2147483647 ? amount : null;
}

export function isManageChange(value: unknown): value is ManageChange {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const change = value as Record<string, unknown>;
  const only = (keys: string[]) => Object.keys(change).every((key) => keys.includes(key));
  if (change.kind === "opening") {
    return only(["kind", "value"]) && (typeof change.value === "boolean" || change.value === null);
  }
  if (typeof change.itemId !== "string" || !UUID_PATTERN.test(change.itemId)) return false;
  if (change.kind === "availability" || change.kind === "featured") {
    return only(["kind", "itemId", "value"]) && typeof change.value === "boolean";
  }
  if (change.kind !== "price" || !only(["kind", "itemId", "mode", "amount", "text"])) return false;
  if (!PRICE_DISPLAY_MODES.some((mode) => mode === change.mode)) return false;
  if (change.text !== null && (typeof change.text !== "string" || change.text.length > 80)) return false;
  return change.mode === "hidden" || change.mode === "variable" || (
    typeof change.amount === "number" && Number.isInteger(change.amount) &&
    change.amount >= 0 && change.amount <= 2147483647
  );
}
