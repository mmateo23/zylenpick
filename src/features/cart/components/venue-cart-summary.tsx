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
      <div className="glass-panel rounded-[2.3rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Carrito
        </p>
        <p className="mt-4 text-3xl font-semibold leading-tight text-[color:var(--foreground)]">
          Guarda platos y sigue explorando.
        </p>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          El resumen del pedido aparecerá aquí cuando empieces a añadir
          productos.
        </p>
      </div>
    );
  }

  if (cart.venue.id !== venueId) {
    return (
      <div className="glass-panel rounded-[2.3rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Carrito
        </p>
        <p className="mt-4 text-3xl font-semibold leading-tight text-[color:var(--foreground)]">
          Ya tienes un pedido en otro local.
        </p>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          Tienes productos guardados de {cart.venue.name}. Vacía el carrito
          antes de añadir productos de este local.
        </p>
        <Link
          href="/cart"
          className="mt-6 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-[color:var(--surface-dark-soft)]"
        >
          Ver carrito
        </Link>
      </div>
    );
  }

  const currency = cart.items[0]?.currency ?? "EUR";

  return (
    <div className="rounded-[2.3rem] border border-white/35 bg-[color:var(--surface-dark)] p-6 text-white shadow-[var(--soft-shadow)]">
      <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/58">
        Carrito
      </p>
      <p className="mt-4 text-3xl font-semibold leading-tight">
        {totals.totalItems} producto{totals.totalItems === 1 ? "" : "s"} en tu
        pedido
      </p>
      <p className="mt-4 text-sm leading-7 text-white/78">
        Total {formatPrice(totals.totalAmount, currency)}
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-flex rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
      >
        Ver carrito
      </Link>
    </div>
  );
}
