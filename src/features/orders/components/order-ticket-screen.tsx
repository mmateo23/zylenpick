"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { StepsIcon } from "@/components/icons/steps-icon";
import { WalkIcon } from "@/components/icons/walk-icon";
import type { SiteDesignConfig } from "@/features/design/site-design-config";
import {
  getDistanceInKm,
  readUserLocation,
  saveUserLocation,
  type UserLocation,
} from "@/features/location/browser-location";
import {
  cancelOrder,
  completeOrder,
  getOrderById,
} from "@/features/orders/services/order-storage";
import { getVenueCoordinates } from "@/features/venues/venue-meta";
import { trackEvent } from "@/lib/analytics/track-event";
import { formatPrice } from "@/lib/utils/currency";

type OrderTicketScreenProps = {
  orderId: string;
  design?: SiteDesignConfig;
};

function formatPickupTime(dateValue: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function formatOrderDate(dateValue: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

function getCountdownParts(targetDate: string) {
  const differenceMs = new Date(targetDate).getTime() - Date.now();
  const safeDifference = Math.max(0, differenceMs);
  const totalMinutes = Math.floor(safeDifference / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    totalMinutes,
    label:
      hours > 0
        ? `${hours} h ${minutes.toString().padStart(2, "0")} min`
        : `${totalMinutes} min`,
  };
}

function getOrderStatus(createdAt: string, pickupAt: string) {
  const createdTime = new Date(createdAt).getTime();
  const pickupTime = new Date(pickupAt).getTime();
  const now = Date.now();
  const totalWindow = Math.max(1, pickupTime - createdTime);
  const elapsed = Math.max(0, now - createdTime);
  const progress = elapsed / totalWindow;

  if (now >= pickupTime) {
    return "listo";
  }

  if (progress < 0.33) {
    return "received";
  }

  if (progress < 0.85) {
    return "preparing";
  }

  return "listo";
}

function getStatusCopy(createdAt: string, pickupAt: string) {
  const status = getOrderStatus(createdAt, pickupAt);

  if (status === "received") {
    return {
      title: "Pedido recibido",
      description: "El local ya tiene tu pedido y está organizándolo.",
    };
  }

  if (status === "preparing") {
    return {
      title: "En preparación",
      description:
        "Tu pedido está avanzando y se está preparando para la recogida.",
    };
  }

  return {
    title: "Listo para recoger",
    description: "Tu pedido ya está listo para que pases por el local.",
  };
}

function isAppleDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function getDirectionsUrl(venue: {
  slug: string;
  name: string;
  cityName: string;
  address?: string | null;
}) {
  const addressQuery = venue.address?.trim()
    ? `${venue.name}, ${venue.address}, ${venue.cityName}`
    : null;

  if (addressQuery) {
    const encodedAddress = encodeURIComponent(addressQuery);

    if (isAppleDevice()) {
      return `https://maps.apple.com/?daddr=${encodedAddress}`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  }

  const coordinates = getVenueCoordinates(venue.slug);

  if (!coordinates) {
    return null;
  }

  if (isAppleDevice()) {
    return `https://maps.apple.com/?daddr=${coordinates.latitude},${coordinates.longitude}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
}

export function OrderTicketScreen({ orderId, design }: OrderTicketScreenProps) {
  const [order, setOrder] = useState(() => getOrderById(orderId));
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasCopiedOrderCode, setHasCopiedOrderCode] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState(() =>
    order ? getCountdownParts(order.pickupAt).label : "0 min",
  );

  useEffect(() => {
    setOrder(getOrderById(orderId));
    setUserLocation(readUserLocation());
  }, [orderId]);

  useEffect(() => {
    if (!order) {
      return;
    }

    const syncCountdown = () => {
      setCountdownLabel(getCountdownParts(order.pickupAt).label);
    };

    syncCountdown();
    const intervalId = window.setInterval(syncCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [order]);

  const journeyMetrics = useMemo(() => {
    if (!order || !userLocation) {
      return null;
    }

    const venueCoordinates = getVenueCoordinates(order.venue.slug);

    if (!venueCoordinates) {
      return null;
    }

    const distanceKm = getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      venueCoordinates.latitude,
      venueCoordinates.longitude,
    );

    return {
      distanceMeters: Math.max(50, Math.round(distanceKm * 1000)),
      walkingMinutes: Math.max(1, Math.round((distanceKm / 4.8) * 60)),
      steps: Math.max(60, Math.round(distanceKm * 1300)),
    };
  }, [order, userLocation]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        saveUserLocation(nextLocation);
        setUserLocation(nextLocation);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  if (!order) {
    return (
      <section className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
        <p className="text-lg font-semibold text-[color:var(--foreground)]">
          No hemos encontrado este pedido.
        </p>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          Puede que ya no esté disponible en este navegador o que el enlace no
          sea correcto.
        </p>
        <Link
          href="/cart"
          className="magnetic-button mt-6 inline-flex rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white"
        >
          Volver al carrito
        </Link>
      </section>
    );
  }

  const orderStatus = getOrderStatus(order.createdAt, order.pickupAt);
  const statusCopy = getStatusCopy(order.createdAt, order.pickupAt);
  const directionsUrl = getDirectionsUrl(order.venue);
  const canCancel = order.resolutionStatus === "active" && orderStatus === "received";
  const canComplete = order.resolutionStatus === "active";

  const resolutionMessage =
    order.resolutionStatus === "completed"
      ? "Gracias por apoyar la hostelería local."
      : order.resolutionStatus === "cancelled"
        ? "Pedido cancelado. Puedes volver a pedir cuando quieras."
        : null;

  const handleCompleteOrder = () => {
    completeOrder(order.id);
    setOrder((currentOrder) =>
      currentOrder
        ? {
            ...currentOrder,
            resolutionStatus: "completed",
            resolvedAt: new Date().toISOString(),
          }
        : currentOrder,
    );
  };

  const handleCancelOrder = () => {
    cancelOrder(order.id);
    setOrder((currentOrder) =>
      currentOrder
        ? {
            ...currentOrder,
            resolutionStatus: "cancelled",
            resolvedAt: new Date().toISOString(),
          }
        : currentOrder,
    );
  };

  const handleCopyOrderCode = async () => {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(order.id);
    setHasCopiedOrderCode(true);

    window.setTimeout(() => {
      setHasCopiedOrderCode(false);
    }, 1800);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="rounded-[2rem] border border-border-subtle bg-surface p-5 text-text-primary shadow-[var(--shadow-soft)] sm:rounded-[2.4rem] sm:p-8">
        <div className="rounded-[1.6rem] border border-accent/35 bg-surface-strong p-5 ring-1 ring-accent-soft sm:rounded-[2rem] sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent-strong">
            Pedido confirmado
          </p>
          <h1 className="mt-5 max-w-[11ch] text-balance text-[clamp(2.8rem,6vw,5.6rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-text-primary">
            {design?.texts.success.heroTitle ?? "Tu recogida está en marcha."}
          </h1>
          <p className="mt-5 max-w-[46rem] text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
            {design?.texts.success.heroSubtitle ??
              "El local ya tiene tu pedido. Ahora solo queda pasar a recogerlo a la hora indicada."}
          </p>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1rem] border border-border-subtle bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                Estado
              </p>
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {statusCopy.title}
              </p>
            </div>
            <div className="rounded-[1rem] border border-border-subtle bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                Recogida
              </p>
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {formatPickupTime(order.pickupAt)}
              </p>
            </div>
            <div className="rounded-[1rem] border border-border-subtle bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                Tiempo restante
              </p>
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {countdownLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.2rem] border border-border-subtle bg-surface-muted px-5 py-4">
          <p className="text-sm font-semibold text-text-primary">
            {order.venue.name}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {statusCopy.description}
          </p>
        </div>

        {resolutionMessage ? (
          <div className="mt-5 rounded-[1.2rem] border border-accent/25 bg-accent-soft px-5 py-4">
            <p className="text-sm font-semibold text-text-primary">
              {resolutionMessage}
            </p>
          </div>
        ) : null}

        <div
          id="ticket"
          className="mt-6 rounded-[1.4rem] border border-border-subtle bg-surface p-5 shadow-[var(--shadow-soft)] sm:rounded-[1.8rem] sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent-strong">
                Resumen del pedido
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[0.98] text-text-primary sm:text-4xl">
                {order.venue.name}
              </h2>
              <div className="mt-4 rounded-[1.15rem] border border-accent/45 bg-accent-soft px-4 py-3.5 ring-1 ring-accent/15">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-strong">
                  C&oacute;digo de recogida
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-semibold tracking-[0.08em] text-text-primary sm:text-3xl">
                    {order.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrderCode}
                    className="inline-flex rounded-full border border-accent/35 bg-surface px-3 py-1.5 text-xs font-semibold text-accent-strong transition hover:border-accent-strong"
                  >
                    {hasCopiedOrderCode ? "Copiado" : <>Copiar c&oacute;digo</>}
                  </button>
                </div>
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  Mu&eacute;stralo al llegar al local para localizar tu pedido
                  r&aacute;pido.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-border-subtle bg-surface-strong px-4 py-2 text-sm font-semibold text-text-primary shadow-[var(--card-shadow)]">
              {formatPrice(order.totalAmount, order.currency)}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-[1rem] border border-border-subtle bg-surface-strong px-4 py-4"
              >
                <div>
                  <p className="text-base font-semibold text-text-primary">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    {item.quantity} x{" "}
                    {formatPrice(item.priceAmount, item.currency)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  {formatPrice(item.priceAmount * item.quantity, item.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-text-muted">Fecha</p>
              <p className="mt-2 text-base font-semibold text-text-primary">
                {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">
                Hora estimada de recogida
              </p>
              <p className="mt-2 text-base font-semibold text-text-primary">
                {formatPickupTime(order.pickupAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Nombre</p>
              <p className="mt-2 text-base font-semibold text-text-primary">
                {order.customerName}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Teléfono</p>
              <p className="mt-2 text-base font-semibold text-text-primary">
                {order.customerPhone}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-text-muted">Dirección del local</p>
              <p className="mt-2 text-base font-semibold text-text-primary">
                {order.venue.address ?? "Dirección pendiente"}
              </p>
            </div>
          </div>

          {order.notes ? (
            <div className="mt-6">
              <p className="text-sm text-text-muted">Notas</p>
              <p className="mt-2 text-base leading-7 text-text-primary">
                {order.notes}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[1.6rem] border border-white/16 bg-white/[0.10] p-5 text-white shadow-[0_20px_48px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150 sm:rounded-[2rem] sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/55">
            Siguiente paso
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1] sm:text-4xl">
            {design?.texts.success.nextStepTitle ??
              "Ve al local cuando esté listo."}
          </h2>
          <div className="mt-5 space-y-3 rounded-[1.25rem] border border-white/10 bg-white/7 px-4 py-4">
            <p className="text-sm font-semibold text-white">
              {order.venue.name}
            </p>
            <p className="flex items-start gap-2 text-sm leading-6 text-white/76">
              <LocationPinIcon
                size={18}
                className="mt-0.5 shrink-0 text-accent"
              />
              {order.venue.address ?? "Dirección pendiente"}
            </p>
            <p className="flex items-center gap-2 text-sm text-white/76">
              <ClockIcon size={18} className="text-accent" />
              Lista a las {formatPickupTime(order.pickupAt)}
            </p>
            <p className="pt-1 text-xs leading-5 text-white/55">
              {design?.texts.success.nextStepMicrocopy ??
                "Ten esta pantalla a mano cuando llegues al local."}
            </p>
          </div>

          {directionsUrl ? (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="magnetic-button mt-6 inline-flex w-full items-center justify-center rounded-full bg-cta px-5 py-4 text-base font-semibold text-cta-text shadow-[0_18px_40px_rgba(36,199,136,0.28)] transition hover:bg-cta-hover"
            >
              {design?.texts.success.primaryCta ??
                design?.texts.globalLabels.directions ??
                "Cómo llegar"}
            </a>
          ) : (
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="magnetic-button mt-6 inline-flex w-full items-center justify-center rounded-full bg-cta px-5 py-4 text-base font-semibold text-cta-text shadow-[0_18px_40px_rgba(36,199,136,0.28)] transition hover:bg-cta-hover disabled:opacity-60"
            >
              {isLocating ? "Buscando ubicación..." : "Activar ubicación"}
            </button>
          )}

          {journeyMetrics ? (
            <div className="mt-6 grid gap-3">
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                <LocationPinIcon size={18} className="text-accent" />
                <div>
                  <p className="text-sm text-white/60">Distancia</p>
                  <p className="text-base font-semibold text-white">
                    {journeyMetrics.distanceMeters} m
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                <WalkIcon size={18} className="text-accent" />
                <div>
                  <p className="text-sm text-white/60">Tiempo andando</p>
                  <p className="text-base font-semibold text-white">
                    {journeyMetrics.walkingMinutes} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                <StepsIcon size={18} className="text-accent" />
                <div>
                  <p className="text-sm text-white/60">Pasos aproximados</p>
                  <p className="text-base font-semibold text-white">
                    {journeyMetrics.steps}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-7 border-t border-white/12 pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">
              Soporte
            </p>
            <div className="mt-3 space-y-3">
              <Link
                href={`/checkout/success/${order.id}/ticket?print=1`}
                target="_blank"
                className="magnetic-button inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white"
              >
                Descargar ticket
              </Link>

              <a
                href={
                  order.venue.phone ? `tel:${order.venue.phone}` : undefined
                }
                aria-disabled={!order.venue.phone}
                onClick={() => {
                  if (!order.venue.phone) {
                    return;
                  }

                  trackEvent("click_call", {
                    city_slug: order.venue.citySlug,
                    city_name: order.venue.cityName,
                    venue_slug: order.venue.slug,
                    venue_name: order.venue.name,
                    source: "order_ticket",
                  });
                }}
                className={`magnetic-button inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-semibold ${
                  order.venue.phone
                    ? "border-white/10 bg-white/8 text-white"
                    : "cursor-not-allowed border-white/8 bg-white/5 text-white/45"
                }`}
              >
                <PhoneIcon size={18} />
                {order.venue.phone
                  ? "Llamar al local"
                  : "Teléfono no disponible"}
              </a>

              <a
                href={
                  order.venue.email ? `mailto:${order.venue.email}` : undefined
                }
                aria-disabled={!order.venue.email}
                onClick={() => {
                  if (!order.venue.email) {
                    return;
                  }

                  trackEvent("click_email", {
                    city_slug: order.venue.citySlug,
                    city_name: order.venue.cityName,
                    venue_slug: order.venue.slug,
                    venue_name: order.venue.name,
                    source: "order_ticket",
                  });
                }}
                className={`magnetic-button inline-flex w-full items-center justify-center rounded-full border px-5 py-3.5 text-sm font-semibold ${
                  order.venue.email
                    ? "border-white/10 bg-white/8 text-white"
                    : "cursor-not-allowed border-white/8 bg-white/5 text-white/45"
                }`}
              >
                Escribir al local
              </a>
            </div>
          </div>

          <div className="mt-7 border-t border-white/12 pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">
              Más acciones
            </p>
            <div className="mt-3 space-y-3">
              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={!canComplete}
                className={`magnetic-button inline-flex w-full items-center justify-center rounded-full border px-5 py-3.5 text-sm font-semibold ${
                  canComplete
                    ? "border-white/10 bg-white/8 text-white"
                    : "cursor-not-allowed border-white/8 bg-white/5 text-white/45"
                }`}
              >
                Marcar como recogido
              </button>

              {canCancel ? (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="magnetic-button inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white"
                >
                  Cancelar pedido
                </button>
              ) : null}

              <Link
                href="#ticket"
                className="magnetic-button inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white"
              >
                Ver resumen
              </Link>

              <Link
                href="/"
                className="magnetic-button inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
