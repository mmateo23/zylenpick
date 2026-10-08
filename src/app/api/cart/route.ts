import { NextResponse } from "next/server";

// Ordering is frozen. Original handlers live in features/cart/services/frozen-cart-route.ts.
function frozenCart() {
  return NextResponse.json({ error: "Los pedidos desde Pickyalo están pausados." }, {
    status: 410, headers: { "Cache-Control": "no-store" },
  });
}
export const GET = frozenCart;
export const POST = frozenCart;
