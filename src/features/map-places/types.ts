import type { Database } from "@/types/database";
import type { MapPolygonGeometry } from "@/features/map-places/geometry";

export type MapPlaceCategory =
  NonNullable<Database["public"]["Tables"]["map_places"]["Row"]["category"]>;
export type MapPlaceStatus =
  Database["public"]["Tables"]["map_places"]["Row"]["status"];
export type MapPlaceSource =
  Database["public"]["Tables"]["map_places"]["Row"]["source"];
export type MapPlacePlanRole =
  Database["public"]["Tables"]["map_places"]["Row"]["plan_role"];

export type PublicMapPlace = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: MapPlaceCategory;
  iconName: string;
  latitude: number;
  longitude: number;
  geometryType: "point" | "polygon" | "line";
  geometry: MapPolygonGeometry | null;
  amenities: string[];
  isAccessible: boolean;
  coverImageUrl: string | null;
  story: string | null;
  openingHoursNote: string | null;
  accessibilityNote: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  planRole: MapPlacePlanRole;
  isPlanCandidate: boolean;
  city: {
    slug: string;
    name: string;
  };
};

export type AdminMapPlace = Omit<
  PublicMapPlace,
  "slug" | "name" | "category" | "iconName" | "latitude" | "longitude"
> & {
  cityId: string;
  parentPlaceId: string | null;
  slug: string | null;
  name: string | null;
  category: MapPlaceCategory | null;
  iconName: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyM: number | null;
  source: MapPlaceSource;
  sourceNote: string | null;
  status: MapPlaceStatus;
  isActive: boolean;
  sortOrder: number;
  verifiedAt: string | null;
  capturedBy: string | null;
  captureMethod: "admin" | "scout";
  accessType: "free" | "restricted" | "unknown" | null;
};
