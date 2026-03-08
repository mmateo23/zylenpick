"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartIcon } from "@/components/icons/cart-icon";
import { useCart } from "@/features/cart/hooks/use-cart";
import { formatPrice } from "@/lib/utils/currency";

export function MobileCartBar() {
  const pathname = usePathname();
  const { cart, totals } = useCart();

  if (pathname === "/cart" || totals.totalItems <= 0 || cart.items.length === 0) {
    return null;
  }

  const currency = cart.items[0]?.currency ?? "EUR";

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
      <Link
        href="/cart"
        className="magnetic-button mx-auto flex w-full max-w-xl items-center justify-between rounded-[1.6rem] border border-white/10 bg-[color:var(--surface-dark)]/96 px-5 py-4 text-white shadow-[var(--shadow)] backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--brand)] text-white shadow-[var(--card-shadow)]">
            <CartIcon size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold">
              Ver carrito · {totals.totalItems} artículo
              {totals.totalItems === 1 ? "" : "s"}
            </p>
            <p className="text-sm text-white/70">
              Recoge tu pedido cuando quieras
            </p>
          </div>
        </div>

        <span className="text-base font-semibold">
          {formatPrice(totals.totalAmount, currency)}
        </span>
      </Link>
    </div>
  );
}
