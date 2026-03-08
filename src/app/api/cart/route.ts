import { NextRequest, NextResponse } from "next/server";

import {
  addMenuItemToCart,
  getActiveCartBySession,
} from "@/features/cart/services/cart-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required." },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      cartId: null,
      venueId: null,
      venueName: null,
      itemIds: [],
      totalItems: 0,
      isMock: true,
    });
  }

  const cart = await getActiveCartBySession(sessionId);
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    sessionId?: string;
    venueId?: string;
    menuItemId?: string;
  };

  if (!body.sessionId || !body.venueId || !body.menuItemId) {
    return NextResponse.json(
      { error: "sessionId, venueId and menuItemId are required." },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  try {
    const cart = await addMenuItemToCart({
      sessionId: body.sessionId,
      venueId: body.venueId,
      menuItemId: body.menuItemId,
    });

    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Cart could not be updated.",
      },
      { status: 500 },
    );
  }
}
