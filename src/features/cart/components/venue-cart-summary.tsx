"use client";

import Link from "next/link";

import { useCart } from "@/features/cart/hooks/use-cart";
import { formatPrice } from "@/lib/utils/currency";

type VenueCartSummaryProps = {
  venueId: string;
};

export function VenueCartSummary({ venueId }: VenueCartSummaryProps) {
  const { cart, totals } = useCart();

  if (!cart.venue) {
    return (
      <div className="rounded-[1.2rem] border border-black/10 bg-white/70 p-5 shadow-[0_16px_44px_rgba(31,36,28,0.08)]">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/40">
          Carrito
        </p>
        <p className="mt-3 text-2xl font-semibold leading-tight text-[#10130f]">
          Guarda platos y sigue explorando.
        </p>
        <p className="mt-3 text-sm leading-6 text-black/60">
          El resumen aparecerá cuando añadas productos.
        </p>
      </div>
    );
  }

  if (cart.venue.id !== venueId) {
    return (
      <div className="rounded-[1.2rem] border border-black/10 bg-white/70 p-5 shadow-[0_16px_44px_rgba(31,36,28,0.08)]">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/40">
          Carrito
        </p>
        <p className="mt-3 text-2xl font-semibold leading-tight text-[#10130f]">
          Pedido en otro local.
        </p>
        <p className="mt-3 text-sm leading-6 text-black/60">
          Tienes platos de {cart.venue.name}.
        </p>
        <Link
          href="/cart"
          className="mt-5 inline-flex rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#10130f] transition hover:bg-black/5"
        >
          Ver carrito
        </Link>
      </div>
    );
  }

  const currency = cart.items[0]?.currency ?? "EUR";

  return (
    <div className="rounded-[1.2rem] border border-black/10 bg-white/70 p-5 shadow-[0_16px_44px_rgba(31,36,28,0.08)]">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/40">
        Carrito
      </p>
      <p className="mt-3 text-2xl font-semibold leading-tight text-[#10130f]">
        {totals.totalItems} producto{totals.totalItems === 1 ? "" : "s"}
      </p>
      <p className="mt-3 text-sm leading-6 text-black/60">
        Total {formatPrice(totals.totalAmount, currency)}
      </p>
      <Link
        href="/cart"
        className="mt-5 inline-flex rounded-full border border-[#1f8a70]/20 bg-[#1f8a70]/10 px-4 py-2.5 text-sm font-semibold text-[#11624f] transition hover:bg-[#1f8a70]/20"
      >
        Ver carrito
      </Link>
    </div>
  );
}
