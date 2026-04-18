"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/services/cart-storage";
import { createOrderFromCart } from "@/features/orders/services/order-storage";
import { formatPrice } from "@/lib/utils/currency";

function buildPickupOptions(pickupEtaMin: number | null) {
  const baseDate = new Date();
  baseDate.setMinutes(baseDate.getMinutes() + (pickupEtaMin ?? 20));

  return Array.from({ length: 6 }, (_, index) => {
    const nextDate = new Date(baseDate);
    nextDate.setMinutes(baseDate.getMinutes() + index * 15);

    return {
      value: nextDate.toISOString(),
      label: new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(nextDate),
    };
  });
}

const inputClassName =
  "mt-3 w-full rounded-[0.9rem] border border-border-subtle bg-surface px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:bg-surface-strong focus:outline-none focus:ring-0";

export function CartScreen() {
  const router = useRouter();
  const { cart, totals } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickupOptions = useMemo(
    () => buildPickupOptions(cart.venue?.pickupEtaMin ?? 20),
    [cart.venue?.pickupEtaMin],
  );
  const [pickupAt, setPickupAt] = useState(() => pickupOptions[0]?.value ?? "");

  useEffect(() => {
    if (
      pickupOptions.length > 0 &&
      !pickupOptions.some((option) => option.value === pickupAt)
    ) {
      setPickupAt(pickupOptions[0].value);
    }
  }, [pickupAt, pickupOptions]);

  if (!cart.venue || cart.items.length === 0) {
    return (
      <main className="relative -mt-[5.4rem] overflow-hidden bg-page pt-[5.4rem] text-text-primary">
        <section className="relative overflow-hidden bg-[var(--overlay-hero-to)] text-text-inverse">
          <div
            className="absolute inset-0 scale-[1.04] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1800&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--brand-accent-soft),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--text-inverse)_5%,transparent),transparent_20%),linear-gradient(180deg,var(--overlay-hero-from)_0%,var(--overlay-hero-to)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(76svh-1rem)] w-full max-w-7xl flex-col justify-end px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-text-inverse/60">
                Carrito
              </p>
              <h1 className="mt-6 max-w-[12ch] text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
                Elige platos antes de recoger.
              </h1>
              <p className="mt-6 max-w-[42rem] text-base leading-7 text-text-inverse/75 sm:text-lg sm:leading-8">
                Tu selección aparecerá aquí cuando guardes platos desde un
                local.
              </p>
              <Link
                href="/zonas"
                className="magnetic-button mt-8 inline-flex w-fit rounded-full border border-accent-border bg-cta px-6 py-3 text-sm font-semibold text-cta-text shadow-[var(--card-shadow)] transition hover:bg-cta-hover"
              >
                Ver zonas
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[96rem] px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent-strong">
                1
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                Entra en una zona.
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent-strong">
                2
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                Abre un local.
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent-strong">
                3
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                Guarda platos.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const currency = cart.items[0]?.currency ?? "EUR";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !pickupAt) {
      setFeedback("Completa nombre, teléfono y hora estimada de recogida.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const order = createOrderFromCart({
      cart,
      customerName,
      customerPhone,
      pickupAt,
      notes,
    });

    if (!order) {
      setIsSubmitting(false);
      setFeedback("No hemos podido crear el pedido.");
      return;
    }

    clearCart();
    router.push(`/checkout/success/${order.id}`);
  };

  return (
    <main className="relative -mt-[5.4rem] overflow-hidden bg-page pt-[5.4rem] text-text-primary">
      <section className="relative overflow-hidden bg-[var(--overlay-hero-to)] text-text-inverse">
        <div
          className="absolute inset-0 scale-[1.04] bg-cover bg-center"
          style={{
            backgroundImage: cart.items[0]?.imageUrl
              ? `url(${cart.items[0].imageUrl})`
              : "linear-gradient(135deg, var(--brand-accent-soft), var(--overlay-hero-to))",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--brand-accent-soft),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--text-inverse)_5%,transparent),transparent_20%),linear-gradient(180deg,var(--overlay-hero-from)_0%,var(--overlay-hero-to)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(68svh-1rem)] w-full max-w-7xl flex-col justify-end px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-text-inverse/60">
              Carrito
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.045] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-text-inverse/75 backdrop-blur-xl">
                {cart.venue.name}
              </span>
              <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.045] px-4 py-2 text-xs font-medium text-text-inverse/75 backdrop-blur-xl">
                {totals.totalItems} producto{totals.totalItems === 1 ? "" : "s"}
              </span>
            </div>
            <h1 className="mt-6 max-w-[12ch] text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              Revisa tu recogida.
            </h1>
            <p className="mt-6 max-w-[42rem] text-base leading-7 text-text-inverse/75 sm:text-lg sm:leading-8">
              Ajusta cantidades y confirma la hora antes de enviar el pedido al
              local.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[96rem] gap-8 px-3 py-8 sm:px-6 sm:py-10 lg:px-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent-strong">
                Selección
              </p>
              <h2 className="mt-3 max-w-[13ch] text-[clamp(1.9rem,3.4vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-text-primary">
                Platos guardados.
              </h2>
            </div>
            <span className="rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-xs font-semibold text-text-muted">
              {formatPrice(totals.totalAmount, currency)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
            {cart.items.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-[0.9rem] border border-border-subtle bg-surface-strong text-left shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-300 hover:border-border-strong hover:shadow-[var(--shadow-soft)] sm:rounded-[1.05rem]"
              >
                <div className="relative min-h-[18rem] overflow-hidden sm:min-h-[20rem]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
                    style={{
                      backgroundImage: item.imageUrl
                        ? `url(${item.imageUrl})`
                        : "linear-gradient(180deg, var(--brand-accent-soft), var(--overlay-hero-to))",
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--overlay-card-from),var(--overlay-card-mid)_42%,var(--overlay-card-to)_100%)]" />

                  <div className="relative z-10 flex min-h-[18rem] flex-col justify-between p-4 sm:min-h-[20rem] sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-text-inverse/10 bg-[color-mix(in_srgb,var(--overlay-card-to)_22%,transparent)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-inverse/80 backdrop-blur-xl">
                        {item.quantity} ud.
                      </span>
                      <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-inverse/80 backdrop-blur-xl">
                        {formatPrice(item.priceAmount * item.quantity, item.currency)}
                      </span>
                    </div>

                    <div>
                      <h2 className="line-clamp-2 text-[1.45rem] font-semibold leading-[0.96] tracking-[-0.045em] text-text-inverse sm:text-[1.7rem]">
                        {item.name}
                      </h2>
                      {item.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-inverse/70">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle bg-surface-strong px-4 py-3 sm:px-5">
                  <div className="inline-flex items-center rounded-full border border-border-subtle bg-surface-strong">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                      className="px-4 py-2.5 text-sm font-semibold text-text-primary"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                      className="px-4 py-2.5 text-sm font-semibold text-text-primary"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCartItem(item.id)}
                    className="magnetic-button inline-flex rounded-full border border-border-subtle bg-surface-strong px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-surface-muted"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 text-text-primary shadow-[var(--shadow-soft)] ring-1 ring-accent-soft xl:sticky xl:top-28 xl:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
            Confirmación
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">
            {cart.venue.name}
          </h2>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            {cart.venue.cityName}
          </p>
          <p className="mt-2 inline-flex items-start gap-2 text-sm leading-6 text-text-secondary">
            <LocationPinIcon size={18} className="mt-0.5 text-icon-highlight" />
            {cart.venue.address ?? "Dirección pendiente"}
          </p>
          <p className="mt-2 inline-flex items-start gap-2 text-sm leading-6 text-text-secondary">
            <ClockIcon size={18} className="mt-0.5 text-icon-highlight" />
            Recogida base en{" "}
            {cart.venue.pickupEtaMin
              ? `${cart.venue.pickupEtaMin} min`
              : "tiempo pendiente"}
          </p>

          <div className="mt-6 rounded-[0.9rem] border border-border-subtle bg-surface-muted p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>Productos</span>
              <span>{totals.totalItems}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(totals.totalAmount, currency)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="customer-name" className="text-sm text-text-secondary">
                Nombre
              </label>
              <input
                id="customer-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className={inputClassName}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="customer-phone" className="text-sm text-text-secondary">
                Teléfono
              </label>
              <input
                id="customer-phone"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                className={inputClassName}
                placeholder="Tu teléfono"
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="pickup-at" className="text-sm text-text-secondary">
                Hora estimada de recogida
              </label>
              <select
                id="pickup-at"
                value={pickupAt}
                onChange={(event) => setPickupAt(event.target.value)}
                className={inputClassName}
              >
                {pickupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="text-sm text-text-secondary">
                Notas opcionales
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${inputClassName} min-h-28 resize-y`}
                placeholder="Alguna indicación adicional"
              />
            </div>

            {feedback ? (
              <p className="text-sm leading-6 text-text-secondary">{feedback}</p>
            ) : null}

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="magnetic-button inline-flex w-full justify-center rounded-full border border-accent-border bg-cta px-5 py-3.5 text-sm font-semibold text-cta-text shadow-[var(--card-shadow)] transition hover:bg-cta-hover disabled:opacity-60"
              >
                {isSubmitting ? "Confirmando pedido..." : "Confirmar pedido"}
              </button>

              <button
                type="button"
                onClick={() => clearCart()}
                className="magnetic-button inline-flex w-full justify-center rounded-full border border-border-subtle bg-surface-strong px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-muted"
              >
                Vaciar carrito
              </button>

              <Link
                href={`/zonas/${cart.venue.citySlug}/venues/${cart.venue.slug}`}
                className="magnetic-button inline-flex w-full justify-center rounded-full border border-border-subtle bg-surface-strong px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-muted"
              >
                Volver al local
              </Link>
            </div>
          </form>
        </aside>
      </section>
    </main>
  );
}
