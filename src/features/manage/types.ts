import type { OpeningHoursValue } from "@/features/venues/opening-hours";
import type { PriceDisplayMode } from "@/features/pricing/price-display";

export type ManagedItem = {
  id: string;
  name: string;
  categoryName: string | null;
  imageUrl: string | null;
  priceAmount: number;
  currency: string;
  priceDisplayMode: PriceDisplayMode;
  priceDisplayText: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
};

export type ManagedVenue = {
  id: string;
  name: string;
  slug: string;
  citySlug: string | null;
  cityName: string | null;
  isPublished: boolean;
  pricesVisible: boolean;
  openingHours: OpeningHoursValue;
  manualOpenStatus: boolean | null;
  isOpenNow: boolean;
  items: ManagedItem[];
};

export type ManageChange =
  | { kind: "opening"; value: boolean | null }
  | { kind: "availability" | "featured"; itemId: string; value: boolean }
  | { kind: "price"; itemId: string; mode: PriceDisplayMode; amount?: number; text: string | null };

export type ManageResult =
  | { ok: true; venue: ManagedVenue }
  | { ok: false; message: string; expired?: boolean };
