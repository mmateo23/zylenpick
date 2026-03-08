"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { useCart } from "@/features/cart/hooks/use-cart";
import { clearCart, removeCartItem, updateCartItemQuantity } from "@/features/cart/services/cart-storage";
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
            Ajusta cantidades, confirma tus datos y cierra el pedido en pocos
            pasos.
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
                      : "linear-gradient(180deg, rgba(31, 138, 112, 0.32), rgba(15, 22, 20, 0.46))",
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
                      className="magnetic-button inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[color:var(--muted-strong)] shadow-[var(--card-shadow)]"
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="customer-name" className="text-sm text-white/72">
              Nombre
            </label>
            <input
              id="customer-name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="mt-2 w-full rounded-[1.2rem] border border-white/10 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/34"
              placeholder="Tu nombre"
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
              className="mt-2 w-full rounded-[1.2rem] border border-white/10 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/34"
              placeholder="Tu teléfono"
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
              className="mt-2 w-full rounded-[1.2rem] border border-white/10 bg-white/8 px-4 py-3 text-white outline-none"
            >
              {pickupOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[color:var(--surface-dark)]"
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
              className="mt-2 min-h-28 w-full rounded-[1.2rem] border border-white/10 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/34"
              placeholder="Alguna indicación adicional"
            />
          </div>

          {feedback ? (
            <p className="text-sm leading-6 text-white/72">{feedback}</p>
          ) : null}

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
        </form>
      </aside>
    </div>
  );
}
