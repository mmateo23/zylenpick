import type { PersistedCart } from "@/features/cart/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CartRecord = {
  id: string;
  venue_id: string;
  venues: {
    name: string;
  } | null;
  cart_items: Array<{
    menu_item_id: string;
    quantity: number;
  }>;
};

type MenuItemRecord = {
  id: string;
  venue_id: string;
  price_amount: number;
};

type ExistingCartRecord = {
  id: string;
  venue_id: string;
};

type CreatedCartRecord = {
  id: string;
};

type ExistingCartItemRecord = {
  id: string;
  quantity: number;
};

function emptyCart(): PersistedCart {
  return {
    cartId: null,
    venueId: null,
    venueName: null,
    itemIds: [],
    totalItems: 0,
  };
}

function mapCart(cart: CartRecord | null): PersistedCart {
  if (!cart) {
    return emptyCart();
  }

  const itemIds = cart.cart_items.map((item) => item.menu_item_id);
  const totalItems = cart.cart_items.reduce(
    (accumulator, item) => accumulator + item.quantity,
    0,
  );

  return {
    cartId: cart.id,
    venueId: cart.venue_id,
    venueName: cart.venues?.name ?? null,
    itemIds,
    totalItems,
  };
}

export async function getActiveCartBySession(
  sessionId: string,
): Promise<PersistedCart> {
  if (!isSupabaseConfigured()) {
    return emptyCart();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("carts")
    .select(
      `
        id,
        venue_id,
        venues:venue_id (
          name
        ),
        cart_items (
          menu_item_id,
          quantity
        )
      `,
    )
    .eq("session_id", sessionId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return emptyCart();
  }

  return mapCart(data as CartRecord | null);
}

export async function addMenuItemToCart(params: {
  sessionId: string;
  venueId: string;
  menuItemId: string;
}): Promise<PersistedCart> {
  if (!isSupabaseConfigured()) {
    return emptyCart();
  }

  const supabase = createSupabaseServerClient();
  const { sessionId, venueId, menuItemId } = params;

  const { data: menuItem, error: menuItemError } = await supabase
    .from("menu_items")
    .select("id, venue_id, price_amount")
    .eq("id", menuItemId)
    .eq("is_available", true)
    .maybeSingle();

  const typedMenuItem = menuItem as MenuItemRecord | null;

  if (menuItemError || !typedMenuItem) {
    throw new Error("Menu item not found.");
  }

  if (typedMenuItem.venue_id !== venueId) {
    throw new Error("Menu item does not belong to the selected venue.");
  }

  const { data: existingCartData } = await supabase
    .from("carts")
    .select("id, venue_id")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .maybeSingle();

  const existingCart = existingCartData as ExistingCartRecord | null;
  let cartId = existingCart?.id ?? null;

  if (!existingCart) {
    const { data: createdCartData, error: createCartError } = await supabase
      .from("carts")
      .insert({
        session_id: sessionId,
        venue_id: venueId,
      })
      .select("id")
      .single();

    const createdCart = createdCartData as CreatedCartRecord | null;

    if (createCartError || !createdCart) {
      throw new Error("Cart could not be created.");
    }

    cartId = createdCart.id;
  } else if (existingCart.venue_id !== venueId) {
    const { error: clearItemsError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", existingCart.id);

    if (clearItemsError) {
      throw new Error("Cart items could not be replaced.");
    }

    const { error: switchVenueError } = await supabase
      .from("carts")
      .update({ venue_id: venueId })
      .eq("id", existingCart.id);

    if (switchVenueError) {
      throw new Error("Cart venue could not be updated.");
    }

    cartId = existingCart.id;
  }

  if (!cartId) {
    throw new Error("Cart could not be resolved.");
  }

  const { data: existingCartItemData } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("menu_item_id", menuItemId)
    .maybeSingle();

  const existingCartItem = existingCartItemData as ExistingCartItemRecord | null;

  if (existingCartItem) {
    const { error: updateItemError } = await supabase
      .from("cart_items")
      .update({
        quantity: existingCartItem.quantity + 1,
      })
      .eq("id", existingCartItem.id);

    if (updateItemError) {
      throw new Error("Cart item could not be updated.");
    }
  } else {
    const { error: insertItemError } = await supabase.from("cart_items").insert({
      cart_id: cartId,
      menu_item_id: menuItemId,
      quantity: 1,
      unit_price_amount: typedMenuItem.price_amount,
    });

    if (insertItemError) {
      throw new Error("Cart item could not be created.");
    }
  }

  return getActiveCartBySession(sessionId);
}
