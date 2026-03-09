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
  "dark-form-field mt-4 w-full rounded-[1.2rem] border border-zinc-700 bg-zinc-900 px-4 py-3 text-white shadow-[var(--card-shadow)] outline-none transition placeholder:text-zinc-400 focus:border-[color:var(--brand)] focus:outline-none focus:ring-0";

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
          Tu pedido todavía no ha empezado.
        </h1>
        <p className="mt-6 max-w-[48ch] text-lg leading-8 text-white/80">
          Entra en un local, recorre su carta y empieza a guardar platos para
          recoger.
        </p>
        <Link
          href="/cities"
          className="magnetic-button mt-9 inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
        >
          Ver zonas
        </Link>
      </section>
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
    <div className="grid gap-8 lg:pt-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="glass-panel rounded-[2.5rem] border border-[color:var(--border)] p-6 shadow-[var(--shadow)] sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Carrito
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[0.95] text-[color:var(--foreground)] sm:text-5xl">
            Revisa tu pedido con calma.
          </h1>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted-strong)]">
            Ajusta cantidades, confirma tus datos y cierra el pedido en pocos
            pasos.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="editorial-card overflow-hidden rounded-[2.4rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]"
              style={{
                backgroundImage: item.imageUrl
                  ? `linear-gradient(180deg, rgba(7, 10, 9, 0.24), rgba(7, 10, 9, 0.86)), url(${item.imageUrl})`
                  : "linear-gradient(180deg, rgba(31, 138, 112, 0.26), rgba(10, 12, 11, 0.88))",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="relative z-10 flex min-h-[18rem] flex-col justify-between p-5 sm:min-h-[19rem] sm:p-7 md:pr-28">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-xl">
                    <h2 className="text-3xl font-semibold leading-[0.98] text-white sm:text-4xl">
                      {item.name}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-white/82">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className="ml-auto inline-block w-fit shrink-0 self-start whitespace-nowrap text-2xl font-semibold leading-none text-white sm:text-5xl"
                    style={{
                      textShadow:
                        "0 4px 16px rgba(0, 0, 0, 0.32), 0 0 18px rgba(31, 138, 112, 0.24)",
                    }}
                  >
                    {formatPrice(item.priceAmount * item.quantity, item.currency)}
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-[rgba(8,12,11,0.5)] shadow-[var(--card-shadow)] backdrop-blur">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                      className="px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                      className="px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCartItem(item.id)}
                    className="magnetic-button inline-flex rounded-full border border-white/10 bg-[rgba(8,12,11,0.5)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] backdrop-blur"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-[2.4rem] border border-white/15 bg-[color:var(--surface-dark)] p-6 text-white shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/58">
          Confirmación
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-[0.98]">
          {cart.venue.name}
        </h2>
        <p className="mt-5 text-sm leading-7 text-white/78">{cart.venue.cityName}</p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm leading-7 text-white/78">
          <LocationPinIcon size={18} className="text-[color:var(--accent)]" />
          {cart.venue.address ?? "Dirección pendiente"}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm leading-7 text-white/78">
          <ClockIcon size={18} className="text-[color:var(--accent)]" />
          Recogida base en{" "}
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

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 max-w-2xl space-y-6 px-6 py-8"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="customer-name" className="text-sm text-white/72">
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
              <label htmlFor="customer-phone" className="text-sm text-white/72">
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
              <label htmlFor="pickup-at" className="text-sm text-white/72">
                Hora estimada de recogida
              </label>
              <select
                id="pickup-at"
                value={pickupAt}
                onChange={(event) => setPickupAt(event.target.value)}
                className={inputClassName}
              >
                {pickupOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-zinc-900 text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="text-sm text-white/72">
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
          </div>

          {feedback ? (
            <p className="text-sm leading-6 text-white/72">{feedback}</p>
          ) : null}

          <div className="space-y-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="magnetic-button inline-flex w-full justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] disabled:opacity-60"
            >
              {isSubmitting ? "Confirmando pedido..." : "Confirmar pedido"}
            </button>

            <button
              type="button"
              onClick={() => clearCart()}
              className="magnetic-button inline-flex w-full justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-white/12"
            >
              Vaciar carrito
            </button>

            <Link
              href={`/cities/${cart.venue.citySlug}/venues/${cart.venue.slug}`}
              className="magnetic-button inline-flex w-full justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-white/12"
            >
              Volver al local
            </Link>
          </div>
        </form>
      </aside>
    </div>
  );
}
