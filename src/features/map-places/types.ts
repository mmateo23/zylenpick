import type { Database } from "@/types/database";

export type MapPlaceCategory =
  Database["public"]["Tables"]["map_places"]["Row"]["category"];
export type MapPlaceStatus =
  Database["public"]["Tables"]["map_places"]["Row"]["status"];
export type MapPlaceSource =
  Database["public"]["Tables"]["map_places"]["Row"]["source"];

export type PublicMapPlace = {
  id: string;
  name: string;
  description: string | null;
  category: MapPlaceCategory;
  iconName: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  isAccessible: boolean;
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
