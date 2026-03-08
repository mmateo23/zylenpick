"use client";

import Link from "next/link";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/services/cart-storage";
import { formatPrice } from "@/lib/utils/currency";

export function CartScreen() {
  const { cart, totals } = useCart();

  if (!cart.venue || cart.items.length === 0) {
    return (
      <section
        className="editorial-card overflow-hidden rounded-[2.8rem] border border-white/30 px-8 py-10 text-white shadow-[var(--shadow)] sm:px-10 sm:py-12"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20, 14, 11, 0.38), rgba(20, 14, 11, 0.86)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/68">
          Carrito
        </p>
        <h1 className="mt-6 max-w-[10ch] text-balance text-5xl font-semibold leading-[0.92] sm:text-6xl">
          Tu pedido todavia no ha empezado.
        </h1>
        <p className="mt-6 max-w-[48ch] text-lg leading-8 text-white/80">
          Entra en un local, recorre su carta y empieza a guardar platos para
          recoger.
        </p>
        <Link
          href="/cities"
          className="mt-9 inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
        >
          Ver zonas
        </Link>
      </section>
    );
  }

  const currency = cart.items[0]?.currency ?? "EUR";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="glass-panel rounded-[2.5rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Carrito
          </p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.95] text-[color:var(--foreground)]">
            Revisa tu pedido con calma.
          </h1>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted-strong)]">
            Un resumen amplio, claro y visual para ajustar cantidades antes de
            la confirmacion.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="editorial-card overflow-hidden rounded-[2.4rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--soft-shadow)]"
            >
              <div className="grid gap-0 md:grid-cols-[15rem_minmax(0,1fr)]">
                <div
                  className="min-h-[20rem] bg-cover bg-center"
                  style={{
                    backgroundImage: item.imageUrl
                      ? `linear-gradient(180deg, rgba(24, 18, 14, 0.16), rgba(24, 18, 14, 0.32)), url(${item.imageUrl})`
                      : "linear-gradient(180deg, rgba(224, 171, 87, 0.32), rgba(213, 90, 50, 0.36))",
                  }}
                />
                <div className="p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-4xl font-semibold leading-[0.98] text-[color:var(--foreground)]">
                        {item.name}
                      </h2>
                      <p className="mt-5 text-sm leading-7 text-[color:var(--muted-strong)]">
                        {item.description}
                      </p>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-[color:var(--surface-strong)] px-3.5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)]">
                      {formatPrice(item.priceAmount * item.quantity, item.currency)}
                    </span>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-[var(--card-shadow)]">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity - 1)
                        }
                        className="px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)]"
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold text-[color:var(--foreground)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity + 1)
                        }
                        className="px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)]"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[color:var(--muted-strong)] shadow-[var(--card-shadow)]"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-[2.4rem] border border-white/35 bg-[color:var(--surface-dark)] p-6 text-white shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/58">
          Local
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-[0.98]">
          {cart.venue.name}
        </h2>
        <p className="mt-5 text-sm leading-7 text-white/78">
          {cart.venue.cityName}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm leading-7 text-white/78">
          <LocationPinIcon size={18} className="text-[color:var(--accent)]" />
          {cart.venue.address ?? "Direccion pendiente"}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm leading-7 text-white/78">
          <ClockIcon size={18} className="text-[color:var(--accent)]" />
          Recogida en{" "}
          {cart.venue.pickupEtaMin
            ? `${cart.venue.pickupEtaMin} min`
            : "tiempo pendiente"}
        </p>

        <div className="mt-7 rounded-[2rem] border border-white/10 bg-white/8 p-5">
          <div className="flex items-center justify-between text-sm text-white/68">
            <span>Productos</span>
            <span>{totals.totalItems}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(totals.totalAmount, currency)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled
            className="inline-flex w-full justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white opacity-80 shadow-[var(--card-shadow)]"
          >
            Confirmacion disponible en la siguiente fase
          </button>
          <button
            type="button"
            onClick={() => clearCart()}
            className="inline-flex w-full justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-white/12"
          >
            Vaciar carrito
          </button>
          <Link
            href={`/cities/${cart.venue.citySlug}/venues/${cart.venue.slug}`}
            className="inline-flex w-full justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-white/12"
          >
            Volver al local
          </Link>
        </div>
      </aside>
    </div>
  );
}
