import type { OpeningHoursValue } from "@/features/venues/opening-hours";

export type VenueListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  address: string | null;
  pickupEtaMin: number | null;
  isVerified: boolean;
  subscriptionActive: boolean;
};

export type VenueMenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  imageUrl: string | null;
  secondaryImageUrl?: string | null;
  categoryName: string | null;
};

export type VenueDetails = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  logoUrl: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  pickupNotes: string | null;
  pickupEtaMin: number | null;
  isVerified: boolean;
  subscriptionActive: boolean;
  openingHours: OpeningHoursValue;
  isOpenNow: boolean;
  city: {
    slug: string;
    name: string;
  };
  menuItems: VenueMenuItem[];
};

export type HomeShowcaseItem = {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  imageUrl: string | null;
  pickupEtaMin: number | null;
  venue: {
    slug: string;
    name: string;
    citySlug: string;
  };
};
