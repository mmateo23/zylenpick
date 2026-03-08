export type VenueListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  address: string | null;
  pickupEtaMin: number | null;
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
  pickupNotes: string | null;
  pickupEtaMin: number | null;
  city: {
    slug: string;
    name: string;
  };
  menuItems: VenueMenuItem[];
};
