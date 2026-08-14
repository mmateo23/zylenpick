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
      <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
          Tu recogida
        </p>
        <p className="mt-3 text-2xl font-semibold leading-tight text-text-primary">
          Aún no has añadido nada.
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Abre una opción, revisa sus detalles y añádela cuando lo tengas claro.
        </p>
      </div>
    );
  }

  if (cart.venue.id !== venueId) {
    return (
      <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
          Tu recogida
        </p>
        <p className="mt-3 text-2xl font-semibold leading-tight text-text-primary">
          Tu cesta está en otro local.
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Ya has elegido qué recoger en {cart.venue.name}.
        </p>
        <Link
          href="/cart"
          className="mt-5 inline-flex rounded-full border border-border-subtle bg-surface-strong px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-muted"
        >
          Revisar cesta
        </Link>
      </div>
    );
  }

  const currency = cart.items[0]?.currency ?? "EUR";

  return (
    <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
        Tu recogida
      </p>
      <p className="mt-3 text-2xl font-semibold leading-tight text-text-primary">
        {totals.totalItems} producto{totals.totalItems === 1 ? "" : "s"}
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {totals.hasDefinitiveTotal
          ? `${formatPrice(totals.totalAmount, currency)} en total antes de confirmar.`
          : "El local confirmará el precio final."}
      </p>
      <Link
        href="/cart"
        className="mt-5 inline-flex rounded-full border border-accent-border bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft"
      >
        Revisar cesta
      </Link>
    </div>
  );
}
