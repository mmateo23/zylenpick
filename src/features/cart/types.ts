export type CartVenue = {
  id: string;
  slug: string;
  name: string;
  citySlug: string;
  cityName: string;
  address: string | null;
  coverUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  pickupEtaMin: number | null;
};

export type CartItem = {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

export type CartState = {
  venue: CartVenue | null;
  items: CartItem[];
};

export type AddCartItemInput = {
  venue: CartVenue;
  item: Omit<CartItem, "quantity">;
};

export type AddCartItemResult =
  | {
      status: "added";
      cart: CartState;
    }
  | {
      status: "conflict";
      cart: CartState;
      conflictingVenueName: string;
    };

// Compatibilidad temporal con el prototipo anterior.
export type PersistedCart = {
  cartId: string | null;
  venueId: string | null;
  venueName: string | null;
  itemIds: string[];
  totalItems: number;
};
