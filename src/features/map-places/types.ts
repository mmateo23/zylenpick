import type { Database } from "@/types/database";
import type { MapPolygonGeometry } from "@/features/map-places/geometry";

export type MapPlaceCategory =
  Database["public"]["Tables"]["map_places"]["Row"]["category"];
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

export type AdminMapPlace = PublicMapPlace & {
  cityId: string;
  slug: string;
  locationAccuracyM: number | null;
  source: MapPlaceSource;
  sourceNote: string | null;
  status: MapPlaceStatus;
  isActive: boolean;
  sortOrder: number;
  verifiedAt: string | null;
};
