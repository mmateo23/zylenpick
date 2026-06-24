"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import type { SiteDesignConfig } from "@/features/design/site-design-config";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/services/cart-storage";
import { createOrderFromCart } from "@/features/orders/services/order-storage";
import { capturePedidoConfirmado } from "@/lib/analytics/posthog-events";
import { showErrorToast, showOrderToast } from "@/lib/ui/toast";
import { formatPrice } from "@/lib/utils/currency";

type CartAccordionKey = "items" | "details";

type CartAccordionProps = {
  id: string;
  title: string;
  meta?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

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

const ticketInputClassName =
  "mt-2 w-full rounded-none border-0 border-b border-dashed border-black/32 bg-transparent px-0 py-2 font-mono text-[12px] font-bold text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-transparent focus:outline-none focus:ring-0";

const receiptFrameClassName =
  "relative mx-auto w-full max-w-[21.5rem] border border-black/20 bg-[#f4ffff] px-5 pb-7 pt-8 font-mono text-black shadow-[0_26px_72px_rgba(0,0,0,0.44),0_0_0_1px_rgba(255,255,255,0.86)_inset] ring-1 ring-white/90 before:absolute before:inset-x-0 before:top-0 before:h-3 before:content-[''] before:bg-[linear-gradient(135deg,#050816_25%,transparent_25%),linear-gradient(225deg,#050816_25%,transparent_25%)] before:bg-[length:14px_14px] before:bg-[position:0_0,7px_0] after:absolute after:inset-x-0 after:bottom-0 after:h-3 after:content-[''] after:bg-[linear-gradient(45deg,#050816_25%,transparent_25%),linear-gradient(315deg,#050816_25%,transparent_25%)] after:bg-[length:14px_14px] after:bg-[position:0_0,7px_0]";

const receiptFrameStyle: CSSProperties = {
  backgroundColor: "#f4ffff",
  boxShadow:
    "0 28px 78px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(255,255,255,0.92)",
  isolation: "isolate",
  maxWidth: "21.5rem",
  width: "100%",
};

const receiptDividerClassName = "my-4 border-t border-dashed border-black/55";

function keepOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function CartAccordion({
  id,
  title,
  meta,
  isOpen,
  onToggle,
  children,
}: CartAccordionProps) {
  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-border-subtle bg-surface shadow-[var(--shadow-soft)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span>
          <span className="block text-sm font-semibold text-text-primary">
            {title}
          </span>
          {meta ? (
            <span className="mt-1 block text-xs leading-5 text-text-muted">
              {meta}
            </span>
          ) : null}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-lg font-semibold text-text-primary">
          {isOpen ? "-" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div id={id} className="border-t border-border-subtle px-4 py-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

type CartScreenProps = {
  design?: SiteDesignConfig;
};

export function CartScreen({ design }: CartScreenProps) {
  const router = useRouter();
  const { cart, totals } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHeroCheckoutOpen, setIsHeroCheckoutOpen] = useState(false);
  const checkoutTicketRef = useRef<HTMLElement | null>(null);
  const [openSections, setOpenSections] = useState<
    Record<CartAccordionKey, boolean>
  >({
    items: false,
    details: false,
  });

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

  const toggleSection = (section: CartAccordionKey) => {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [section]: !currentSections[section],
    }));
  };

  if (!cart.venue || cart.items.length === 0) {
    return (
      <main className="relative z-10 -mt-[5.4rem] overflow-hidden bg-page pb-10 pt-[5.4rem] text-text-primary lg:pb-20">
        <section className="relative overflow-hidden bg-[var(--overlay-hero-to)] text-text-inverse">
          <div
            className="absolute inset-0 scale-[1.04] bg-cover bg-center"
            style={{
              backgroundImage: `url('${design?.media.cartEmptyImageUrl ?? "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1800&q=80"}')`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--brand-accent-soft),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--text-inverse)_5%,transparent),transparent_20%),linear-gradient(180deg,var(--overlay-hero-from)_0%,var(--overlay-hero-to)_100%)]" />

          <div className="relative z-10 mx-auto grid min-h-[calc(44svh-1rem)] w-full max-w-7xl items-end gap-8 px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-12 lg:min-h-[30rem] lg:grid-cols-[minmax(0,1fr)_26rem] lg:px-12 lg:pb-10">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-text-inverse/60">
                Tu cesta
              </p>
              <h1 className="mt-4 max-w-[15ch] text-balance text-[clamp(2.65rem,5.2vw,4.9rem)] font-semibold leading-[0.9] tracking-[-0.065em] lg:max-w-[22ch] lg:text-[3.25rem]">
                {design?.texts.cart.emptyTitle ?? "Elige productos o platos para recoger."}
              </h1>
              <p className="mt-4 max-w-[42rem] text-base leading-7 text-text-inverse/75 sm:text-lg sm:leading-8 lg:max-w-[38rem] lg:text-base lg:leading-7">
                {design?.texts.cart.emptySubtitle ??
                  "Tu selección aparecerá aquí cuando guardes algo desde un local. Después solo tendrás que confirmar la hora de recogida."}
              </p>
              <Link
                href="/platos"
                className="magnetic-button mt-8 inline-flex w-fit rounded-full border border-accent-border bg-cta px-6 py-3 text-sm font-semibold text-cta-text shadow-[var(--card-shadow)] transition hover:bg-cta-hover"
              >
                {design?.texts.cart.emptyCta ?? "Ver platos"}
              </Link>
            </div>

            <div
              className={`${receiptFrameClassName} hidden lg:block`}
              style={receiptFrameStyle}
            >
              <div className="text-center">
                <p className="text-[2rem] font-black uppercase leading-none tracking-[-0.08em]">
                  PICKYALO
                </p>
                <p className="mt-4 text-[12px] leading-5">
                  Productos y platos destacados
                  <br />
                  de locales cercanos
                </p>
              </div>

              <div className={receiptDividerClassName} />

              <div className="flex items-start justify-between gap-4 text-[14px] font-black uppercase">
                <span>Orden</span>
                <span>#000</span>
              </div>
              <p className="mt-1 text-[12px] leading-5">
                Cesta pendiente de selección
              </p>

              <div className={receiptDividerClassName} />

              <div className="grid grid-cols-[3.5rem_1fr_3rem] gap-2 text-[12px] font-black uppercase">
                <span>Cant</span>
                <span>Descr</span>
                <span className="text-right">Imp</span>
              </div>
              <div className="mt-2 space-y-1 text-[12px] leading-4">
                {[
                  ["01 x", "Explora selección", "-"],
                  ["01 x", "Elige un local", "-"],
                  ["01 x", "Recoge cerca", "-"],
                ].map(([quantity, description, price]) => (
                  <div
                    key={description}
                    className="grid grid-cols-[3.5rem_1fr_3rem] gap-2"
                  >
                    <span>{quantity}</span>
                    <span>{description}</span>
                    <span className="text-right">{price}</span>
                  </div>
                ))}
              </div>

              <div className={receiptDividerClassName} />

              <div className="flex items-center justify-between text-[1.35rem] font-black uppercase tracking-[-0.06em]">
                <span>Total:</span>
                <span>--</span>
              </div>

              <div className={receiptDividerClassName} />

              <p className="text-center text-[10px] leading-4">
                Al confirmar una cesta aceptas que el local prepare tu selección
                para recogida. No se realiza pago online desde este ticket.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-auto w-full max-w-[76rem] px-3 py-5 sm:px-6 sm:py-7 lg:hidden lg:-mt-4 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.35rem] border border-black/10 bg-white p-4 text-black shadow-[0_18px_54px_rgba(0,0,0,0.08)] sm:p-5">
            <div className="absolute inset-x-5 top-0 border-t border-dashed border-black/20" />
            <div className="absolute inset-x-5 bottom-0 border-t border-dashed border-black/20" />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-black/45">
                  Cesta vacía
                </p>
                <h2 className="mt-2 text-2xl font-black leading-none tracking-[-0.05em] sm:text-3xl">
                  Empieza con algo que apetezca.
                </h2>
                <p className="mt-3 max-w-[34rem] text-sm leading-6 text-black/62">
                  Guarda productos o platos de un único local y confirma la
                  recogida desde un ticket claro, sin pasos de más.
                </p>
              </div>

              <Link
                href="/platos"
                className="inline-flex shrink-0 justify-center rounded-full bg-black px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:bg-black/85"
              >
                Explorar
              </Link>
            </div>

            <div className="my-5 border-t border-dashed border-black/20" />

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Explora", "Mira productos y platos destacados cerca de ti."],
                ["02", "Elige", "Abre un local y guarda lo que quieras recoger."],
                ["03", "Recoge", "Completa el ticket y pasa por el local."],
              ].map(([step, title, description]) => (
                <div
                  key={step}
                  className="rounded-[1rem] border border-black/10 bg-black/[0.025] p-4"
                >
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/38">
                    {step}
                  </p>
                  <p className="mt-3 text-lg font-black leading-none">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/58">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  const currency = cart.items[0]?.currency ?? "EUR";
  const selectedPickupLabel =
    pickupOptions.find((option) => option.value === pickupAt)?.label ??
    pickupOptions[0]?.label ??
    "";
  const itemCountLabel = `${totals.totalItems} producto${
    totals.totalItems === 1 ? "" : "s"
  }`;
  const ticketItems = cart.items.slice(0, 2);
  const hiddenTicketItemsCount = Math.max(cart.items.length - ticketItems.length, 0);
  const desktopTicketItems = cart.items.slice(0, 3);
  const hiddenDesktopTicketItemsCount = Math.max(
    cart.items.length - desktopTicketItems.length,
    0,
  );

  const scrollToCheckoutTicket = () => {
    const ticket =
      checkoutTicketRef.current ?? document.getElementById("cart-checkout-ticket");
    if (!ticket) return;

    const top = ticket.getBoundingClientRect().top + window.scrollY - 112;
    window.history.replaceState(null, "", "#cart-checkout-ticket");
    window.scrollTo({
      behavior: "smooth",
      top: Math.max(top, 0),
    });

    window.setTimeout(() => {
      const firstInput = document.getElementById("desktop-customer-name");
      firstInput?.focus({ preventScroll: true });
    }, 650);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !pickupAt) {
      setFeedback("Completa nombre, teléfono y hora estimada de recogida.");
      showErrorToast({
        title: "Faltan datos",
        description: "Completa nombre, teléfono y hora estimada de recogida.",
      });
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
      showErrorToast({
        title: "No se pudo crear el pedido",
        description: "Revisa la cesta e inténtalo otra vez.",
      });
      return;
    }

    capturePedidoConfirmado({
      city_slug: order.venue.citySlug,
      venue_id: order.venue.id,
      venue_slug: order.venue.slug,
      venue_name: order.venue.name,
      order_id: order.id,
      total_amount: order.totalAmount / 100,
      currency: order.currency,
      total_items: order.items.reduce(
        (totalQuantity, item) => totalQuantity + item.quantity,
        0,
      ),
      item_count: order.items.length,
      source: "cart_checkout",
    });

    clearCart();
    showOrderToast({
      title: "Pedido confirmado",
      description: `Tu pedido en ${order.venue.name} queda preparado para recoger.`,
    });
    router.push(`/checkout/success/${order.id}`);
  };

  return (
    <main className="relative z-10 -mt-[5.4rem] overflow-hidden bg-page pb-10 pt-[5.4rem] text-text-primary lg:pb-20">
      <section className="relative overflow-hidden bg-[var(--overlay-hero-to)] text-text-inverse">
        <div
          className="absolute inset-0 scale-[1.04] bg-cover bg-center"
          style={{
            backgroundImage: cart.venue.coverUrl ?? cart.items[0]?.imageUrl
              ? `url(${cart.venue.coverUrl ?? cart.items[0]?.imageUrl})`
              : "linear-gradient(135deg, var(--brand-accent-soft), var(--overlay-hero-to))",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--brand-accent-soft),transparent_18%),linear-gradient(90deg,rgba(5,8,22,0.97)_0%,rgba(5,8,22,0.9)_42%,rgba(5,8,22,0.68)_72%,rgba(5,8,22,0.44)_100%),linear-gradient(180deg,rgba(5,8,22,0.34)_0%,rgba(5,8,22,0.68)_48%,rgba(5,8,22,0.98)_100%)]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(58svh-1rem)] w-full max-w-7xl items-end gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:min-h-[32rem] lg:grid-cols-[minmax(0,1fr)_26rem] lg:px-12 lg:pb-10">
          <div className="max-w-4xl lg:max-w-[34rem] lg:rounded-[1.35rem] lg:border lg:border-white/12 lg:bg-black/55 lg:p-6 lg:shadow-[0_22px_70px_rgba(0,0,0,0.36)] lg:backdrop-blur-md">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-text-inverse/70 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] lg:text-text-inverse/78 lg:[text-shadow:none]">
              Tu cesta
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.045] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-text-inverse/75 backdrop-blur-xl lg:border-white/16 lg:bg-white/10 lg:text-white/82">
                {cart.venue.name}
              </span>
              <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.045] px-4 py-2 text-xs font-medium text-text-inverse/75 backdrop-blur-xl lg:border-white/16 lg:bg-white/10 lg:text-white/82">
                {totals.totalItems} producto{totals.totalItems === 1 ? "" : "s"}
              </span>
            </div>
            <h1 className="mt-4 max-w-[15ch] text-balance text-[clamp(2.65rem,5.2vw,4.9rem)] font-semibold leading-[0.9] tracking-[-0.065em] [text-shadow:0_6px_28px_rgba(0,0,0,0.72)] lg:max-w-[13ch] lg:text-[3.05rem] lg:[text-shadow:none]">
              {design?.texts.cart.filledTitle ?? "Revisa tu recogida."}
            </h1>
            <p className="mt-4 max-w-[42rem] text-base leading-7 text-text-inverse/86 [text-shadow:0_3px_18px_rgba(0,0,0,0.68)] sm:text-lg sm:leading-8 lg:max-w-[28rem] lg:text-base lg:leading-7 lg:text-white/78 lg:[text-shadow:none]">
              {design?.texts.cart.filledSubtitle ??
                "Tu pedido se prepara en el local para que solo tengas que llegar y recoger."}
            </p>
          </div>

          <div
            className={`${receiptFrameClassName} hidden lg:block`}
            style={receiptFrameStyle}
          >
            <div className="text-center">
              <p className="text-[1.6rem] font-black uppercase leading-none tracking-[-0.08em]">
                {cart.venue.name}
              </p>
              <p className="mt-3 text-[11px] leading-4">
                {cart.venue.cityName}
                <br />
                {cart.venue.address ?? "Dirección pendiente"}
                <br />
                {cart.venue.phone ? `Tel. ${cart.venue.phone}` : "Recogida en local"}
              </p>
            </div>

            <div className={receiptDividerClassName} />

            <div className="flex items-start justify-between gap-4 text-[14px] font-black uppercase">
              <span>Orden</span>
              <span>#{cart.venue.id.slice(0, 3).toUpperCase()}</span>
            </div>
            <p className="mt-1 text-[12px] leading-5">
              Recogida estimada: {selectedPickupLabel}
            </p>

            <div className={receiptDividerClassName} />

            <div className="grid grid-cols-[3.5rem_1fr_3rem] gap-2 text-[12px] font-black uppercase">
              <span>Cant</span>
              <span>Descr</span>
              <span className="text-right">Imp</span>
            </div>
            <div className="mt-2 space-y-1 text-[12px] leading-4">
              {desktopTicketItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[3.5rem_1fr_3rem] gap-2"
                >
                  <span>{item.quantity} x</span>
                  <span className="truncate">
                    {item.name}
                  </span>
                  <span className="text-right">
                    {formatPrice(item.priceAmount * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
              {hiddenDesktopTicketItemsCount > 0 ? (
                <div className="grid grid-cols-[3.5rem_1fr_3rem] gap-2">
                  <span>+{hiddenDesktopTicketItemsCount}</span>
                  <span>Más productos</span>
                  <span className="text-right">...</span>
                </div>
              ) : null}
            </div>

            <div className={receiptDividerClassName} />

            <div className="flex items-center justify-between text-[1.35rem] font-black uppercase tracking-[-0.06em]">
              <span>Total:</span>
              <span>{formatPrice(totals.totalAmount, currency)}</span>
            </div>

            <div className={receiptDividerClassName} />

            <p className="text-center text-[10px] leading-4">
              Aviso: el pedido se prepara para recoger en el local. Al continuar,
              confirmas los datos de recogida y aceptas que el local gestione la
              preparación de tu selección.
            </p>

            {isHeroCheckoutOpen ? (
              <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-3 border-t border-dashed border-black/35 pt-4"
              >
                <div>
                  <label
                    htmlFor="hero-customer-name"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
                  >
                    Nombre
                  </label>
                  <input
                    id="hero-customer-name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className={ticketInputClassName}
                    placeholder="Tu nombre"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-customer-phone"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
                  >
                    Teléfono
                  </label>
                  <input
                    id="hero-customer-phone"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(keepOnlyDigits(event.target.value))
                    }
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={ticketInputClassName}
                    placeholder="Tu teléfono"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-pickup-at"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
                  >
                    Hora estimada
                  </label>
                  <select
                    id="hero-pickup-at"
                    value={pickupAt}
                    onChange={(event) => setPickupAt(event.target.value)}
                    className={ticketInputClassName}
                  >
                    {pickupOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {feedback ? (
                  <p className="border-y border-dashed border-black/35 py-2 text-[10px] font-bold leading-4 text-black/75">
                    {feedback}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full justify-center border border-black bg-black px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.12em] text-[#ecffff] transition hover:bg-black/85 disabled:opacity-60"
                  style={{ color: "#f4ffff" }}
                >
                  {isSubmitting ? "Preparando..." : "Preparar para recoger"}
                </button>

                <button
                  type="button"
                  onClick={scrollToCheckoutTicket}
                  className="inline-flex w-full justify-center border border-black/20 bg-transparent px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.12em] text-black transition hover:bg-black/[0.04]"
                >
                  Ver ticket completo
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsHeroCheckoutOpen(true)}
                className="mt-5 inline-flex w-full justify-center border border-black bg-black px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.12em] text-[#ecffff] transition hover:bg-black/85"
                style={{ color: "#f4ffff" }}
              >
                Completar datos
              </button>
            )}
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[44rem] space-y-4 px-3 py-5 pb-24 sm:px-6 lg:hidden"
      >
        <section className="relative overflow-hidden rounded-[1.25rem] border border-black/15 bg-white p-4 text-black shadow-[0_18px_48px_rgba(0,0,0,0.12)]">

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-black/55">
                Ticket de recogida
              </p>
              <h2 className="mt-2 truncate text-2xl font-black leading-none tracking-[-0.05em]">
                {cart.venue.name}
              </h2>
              <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-black/52">
                {cart.venue.cityName}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-black bg-black px-3 py-1.5 font-mono text-sm font-black text-white">
              {formatPrice(totals.totalAmount, currency)}
            </span>
          </div>

          <div className="my-4 border-t border-dashed border-black/25" />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[0.8rem] border border-black/10 bg-black/[0.025] px-2 py-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-black/45">
                Productos
              </p>
              <p className="mt-1 font-mono text-lg font-black">{totals.totalItems}</p>
            </div>
            <div className="rounded-[0.8rem] border border-black/10 bg-black/[0.025] px-2 py-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-black/45">
                Hora
              </p>
              <p className="mt-1 font-mono text-lg font-black">{selectedPickupLabel}</p>
            </div>
            <div className="rounded-[0.8rem] border border-black/10 bg-black/[0.025] px-2 py-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-black/45">
                Total
              </p>
              <p className="mt-1 font-mono text-lg font-black">
                {formatPrice(totals.totalAmount, currency)}
              </p>
            </div>
          </div>

          {feedback ? (
            <p className="mt-4 rounded-[0.8rem] border border-black/10 bg-black/[0.035] px-3 py-2 text-sm font-semibold text-black">
              {feedback}
            </p>
          ) : null}

          <div className="mt-4 border-t border-dashed border-black/55 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-black uppercase">
                Cant&nbsp;&nbsp; Descr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Imp
              </p>
              {hiddenTicketItemsCount > 0 ? (
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">
                  +{hiddenTicketItemsCount} más
                </p>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              {ticketItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 font-mono text-xs"
                >
                  <span className="font-black text-black">
                    {item.quantity}x
                  </span>
                  <span className="truncate font-bold uppercase tracking-[0.03em] text-black/78">
                    {item.name}
                  </span>
                  <span className="font-black text-black">
                    {formatPrice(item.priceAmount * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-dashed border-black/25 pt-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
              Datos para recoger
            </p>

            <div className="mt-3 grid gap-3">
              <div>
                <label
                  htmlFor="mobile-customer-name"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
                >
                  Nombre
                </label>
                <input
                  id="mobile-customer-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className={ticketInputClassName}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="mobile-customer-phone"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
                >
                  Teléfono
                </label>
                <input
                  id="mobile-customer-phone"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(keepOnlyDigits(event.target.value))
                  }
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={ticketInputClassName}
                  placeholder="Tu teléfono"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label
                  htmlFor="mobile-pickup-at"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
                >
                  Hora
                </label>
                <select
                  id="mobile-pickup-at"
                  value={pickupAt}
                  onChange={(event) => setPickupAt(event.target.value)}
                  className={ticketInputClassName}
                >
                  {pickupOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-black/62">
            {design?.texts.cart.ctaMicrocopy ??
              "El local prepara tu pedido para recoger a la hora elegida."}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="magnetic-button mt-4 inline-flex w-full justify-center rounded-full bg-black px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:bg-black/85 disabled:opacity-60"
          >
            {isSubmitting
              ? "Preparando pedido..."
              : (design?.texts.globalLabels.prepareForPickup ??
                "Preparar para recoger")}
          </button>
        </section>

        <CartAccordion
          id="cart-items-mobile"
          title="Productos en tu cesta"
          meta={itemCountLabel}
          isOpen={openSections.items}
          onToggle={() => toggleSection("items")}
        >
          <div className="space-y-3">
            {cart.items.map((item) => (
              <article key={item.id} className="flex gap-3">
                <div
                  className="h-20 w-20 shrink-0 rounded-[1rem] bg-cover bg-center"
                  style={{
                    backgroundImage: item.imageUrl
                      ? `url(${item.imageUrl})`
                      : "linear-gradient(180deg, var(--brand-accent-soft), var(--surface-muted))",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-text-primary">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-text-muted">
                        {formatPrice(item.priceAmount * item.quantity, item.currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="rounded-full px-2 py-1 text-xs font-semibold text-text-muted transition hover:bg-surface-muted hover:text-text-primary"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-3 inline-flex items-center rounded-full border border-border-subtle bg-surface-strong">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                      className="px-3 py-2 text-sm font-semibold text-text-primary"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                      className="px-3 py-2 text-sm font-semibold text-text-primary"
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </CartAccordion>

        <CartAccordion
          id="cart-details-mobile"
          title="Notas y detalles del local"
          meta={cart.venue.address ?? "Dirección pendiente"}
          isOpen={openSections.details}
          onToggle={() => toggleSection("details")}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="mobile-notes"
                className="text-sm text-text-secondary"
              >
                Notas opcionales
              </label>
              <textarea
                id="mobile-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
                placeholder="Alguna indicación adicional"
              />
            </div>

            <div className="rounded-[1rem] border border-border-subtle bg-surface-muted p-4 text-sm leading-6 text-text-secondary">
              <p>
                Recogerás tu pedido directamente en el local, sin esperas
                innecesarias.
              </p>
              <p className="mt-3 inline-flex items-start gap-2">
                <LocationPinIcon
                  size={18}
                  className="mt-0.5 text-icon-highlight"
                />
                {cart.venue.address ?? "Dirección pendiente"}
              </p>
              <p className="mt-2 inline-flex items-start gap-2">
                <ClockIcon size={18} className="mt-0.5 text-icon-highlight" />
                Recogida base en{" "}
                {cart.venue.pickupEtaMin
                  ? `${cart.venue.pickupEtaMin} min`
                  : "tiempo pendiente"}
              </p>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => clearCart()}
                className="magnetic-button inline-flex w-full justify-center rounded-full border border-border-subtle bg-surface-strong px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-muted"
              >
                Vaciar cesta
              </button>

              <Link
                href={`/zonas/${cart.venue.citySlug}/venues/${cart.venue.slug}`}
                className="magnetic-button inline-flex w-full justify-center rounded-full border border-border-subtle bg-surface-strong px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-muted"
              >
                Volver al local
              </Link>
            </div>
          </div>
        </CartAccordion>
      </form>

      <section className="relative z-20 mx-auto hidden w-full max-w-[96rem] gap-8 px-3 py-8 sm:px-6 sm:py-10 lg:-mt-4 lg:grid lg:px-8 lg:pt-0 lg:pb-24 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent-strong">
                Selección
              </p>
              <h2 className="mt-3 max-w-[13ch] text-[clamp(1.9rem,3.4vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-text-primary">
                Selección guardada.
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
                        {formatPrice(
                          item.priceAmount * item.quantity,
                          item.currency,
                        )}
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

        <aside
          id="cart-checkout-ticket"
          ref={checkoutTicketRef}
          className={`${receiptFrameClassName} scroll-mt-28 xl:sticky xl:top-28 xl:self-start`}
          style={receiptFrameStyle}
          tabIndex={-1}
        >
          <div className="text-center">
            <p className="text-[1.65rem] font-black uppercase leading-none tracking-[-0.08em]">
              {cart.venue.name}
            </p>
            <p className="mt-3 text-[11px] font-bold leading-4 text-black/78">
              {cart.venue.cityName}
              <br />
              {cart.venue.address ?? "Dirección pendiente"}
              <br />
              {cart.venue.phone ? `Tel. ${cart.venue.phone}` : "Recogida en local"}
            </p>
          </div>

          <div className={receiptDividerClassName} />

          <div className="flex items-start justify-between gap-4 text-[14px] font-black uppercase">
            <span>Orden</span>
            <span>#{cart.venue.id.slice(0, 3).toUpperCase()}</span>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-black/78">
            Recogida seleccionada: {selectedPickupLabel}
          </p>

          <p className="mt-4 border-y border-dashed border-black/40 py-3 text-[11px] leading-5 text-black/70">
            Aviso: el local prepara tu selección para recoger. No se realiza
            pago online desde este ticket.
          </p>

          <div className="mt-4 border-t border-dashed border-black/25 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
                Cant&nbsp;&nbsp; Descr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Imp
              </p>
              {hiddenDesktopTicketItemsCount > 0 ? (
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">
                  +{hiddenDesktopTicketItemsCount} mas
                </p>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              {desktopTicketItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[3.5rem_1fr_3rem] items-start gap-2 text-[12px] leading-4"
                >
                  <span>{item.quantity} x</span>
                  <span className="truncate">
                    {item.name}
                  </span>
                  <span className="text-right">
                    {formatPrice(item.priceAmount * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={receiptDividerClassName} />

          <div className="flex items-center justify-between text-[1.35rem] font-black uppercase tracking-[-0.06em]">
            <span>Total:</span>
            <span>{formatPrice(totals.totalAmount, currency)}</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-dashed border-black/25 pt-4">
            <div>
              <label
                htmlFor="desktop-customer-name"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
              >
                Nombre
              </label>
              <input
                id="desktop-customer-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className={ticketInputClassName}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="desktop-customer-phone"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
              >
                Teléfono
              </label>
              <input
                id="desktop-customer-phone"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(keepOnlyDigits(event.target.value))
                }
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={ticketInputClassName}
                placeholder="Tu teléfono"
                autoComplete="tel"
              />
            </div>

            <div>
              <label
                htmlFor="desktop-pickup-at"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
              >
                Hora estimada de recogida
              </label>
              <select
                id="desktop-pickup-at"
                value={pickupAt}
                onChange={(event) => setPickupAt(event.target.value)}
                className={ticketInputClassName}
              >
                {pickupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="desktop-notes"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/45"
              >
                Notas opcionales
              </label>
              <textarea
                id="desktop-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${ticketInputClassName} min-h-24 resize-y`}
                placeholder="Alguna indicación adicional"
              />
            </div>

            {feedback ? (
              <p className="rounded-[0.8rem] border border-black/10 bg-black/[0.035] px-3 py-2 text-sm font-semibold text-black">
                {feedback}
              </p>
            ) : null}

            <div className="space-y-3 pt-1">
              <p className="border-y border-dashed border-black/45 py-3 text-center text-[10px] leading-4 text-black/70">
                Aviso legal: al preparar la recogida confirmas que los datos
                introducidos son correctos y autorizas al local a gestionar tu
                selección. No se realiza pago online desde este ticket.
              </p>
              <p className="text-sm leading-6 text-black/62">
                {design?.texts.cart.ctaMicrocopy ??
                  "El local prepara tu pedido para recoger a la hora elegida."}
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="magnetic-button inline-flex w-full justify-center rounded-full bg-black px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:bg-black/85 disabled:opacity-60"
              >
                {isSubmitting
                  ? "Preparando pedido..."
                  : (design?.texts.globalLabels.prepareForPickup ??
                    "Preparar para recoger")}
              </button>

              <button
                type="button"
                onClick={() => clearCart()}
                className="magnetic-button inline-flex w-full justify-center rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-black/[0.035]"
              >
                Vaciar cesta
              </button>

              <Link
                href={`/zonas/${cart.venue.citySlug}/venues/${cart.venue.slug}`}
                className="magnetic-button inline-flex w-full justify-center rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-black/[0.035]"
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
