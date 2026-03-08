"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { StepsIcon } from "@/components/icons/steps-icon";
import { WalkIcon } from "@/components/icons/walk-icon";
import { VenueRouteModal } from "@/components/venues/venue-route-modal";
import {
  getDistanceInKm,
  readUserLocation,
  saveUserLocation,
  type UserLocation,
} from "@/features/location/browser-location";
import { getOrderById } from "@/features/orders/services/order-storage";
import { getVenueCoordinates } from "@/features/venues/venue-meta";
import { formatPrice } from "@/lib/utils/currency";

type OrderTicketScreenProps = {
  orderId: string;
};

function formatPickupTime(dateValue: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
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
        : `${minutes} min`,
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
    return "listo para recoger";
  }

  if (progress < 0.33) {
    return "pedido recibido";
  }

  if (progress < 0.85) {
    return "preparando";
  }

  return "listo para recoger";
}

export function OrderTicketScreen({ orderId }: OrderTicketScreenProps) {
  const [order, setOrder] = useState(() => getOrderById(orderId));
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
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

  const status = getOrderStatus(order.createdAt, order.pickupAt);

  return (
    <>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="glass-panel rounded-[2.5rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Pedido confirmado
          </p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.95] text-[color:var(--foreground)]">
            Tu pedido ya está en marcha.
          </h1>
          <p className="mt-5 max-w-[52ch] text-base leading-8 text-[color:var(--muted-strong)]">
            Guarda este ticket para recoger tu pedido con claridad y consultar
            el estado en cualquier momento.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
              <p className="text-sm text-[color:var(--muted)]">Estado</p>
              <p className="mt-2 text-lg font-semibold capitalize text-[color:var(--foreground)]">
                {status}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
              <p className="text-sm text-[color:var(--muted)]">Recogida</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {formatPickupTime(order.pickupAt)}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
              <p className="text-sm text-[color:var(--muted)]">Cuenta atrás</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {countdownLabel}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--soft-shadow)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                  Ticket
                </p>
                <h2 className="mt-3 text-4xl font-semibold leading-[0.98] text-[color:var(--foreground)]">
                  {order.venue.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
                  Pedido {order.id}
                </p>
              </div>
              <span className="rounded-full bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)]">
                {formatPrice(order.totalAmount, order.currency)}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
                >
                  <div>
                    <p className="text-base font-semibold text-[color:var(--foreground)]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {item.quantity} x {formatPrice(item.priceAmount, item.currency)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {formatPrice(item.priceAmount * item.quantity, item.currency)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[color:var(--muted)]">Nombre</p>
                <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--muted)]">Teléfono</p>
                <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                  {order.customerPhone}
                </p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--muted)]">
                  Hora estimada de recogida
                </p>
                <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                  {formatPickupTime(order.pickupAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--muted)]">Zona</p>
                <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                  {order.venue.cityName}
                </p>
              </div>
            </div>

            {order.notes ? (
              <div className="mt-6">
                <p className="text-sm text-[color:var(--muted)]">Notas</p>
                <p className="mt-2 text-base leading-7 text-[color:var(--foreground)]">
                  {order.notes}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2.4rem] border border-white/35 bg-[color:var(--surface-dark)] p-6 text-white shadow-[var(--soft-shadow)]">
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/58">
              Recogida
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.98]">
              {order.venue.name}
            </h2>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/78">
              <LocationPinIcon size={18} className="text-[color:var(--accent)]" />
              {order.venue.address ?? "Dirección pendiente"}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/78">
              <ClockIcon size={18} className="text-[color:var(--accent)]" />
              Lista a las {formatPickupTime(order.pickupAt)}
            </p>

            {journeyMetrics ? (
              <div className="mt-6 grid gap-3">
                <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                  <LocationPinIcon
                    size={18}
                    className="text-[color:var(--accent)]"
                  />
                  <div>
                    <p className="text-sm text-white/60">Distancia</p>
                    <p className="text-base font-semibold text-white">
                      {journeyMetrics.distanceMeters} m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                  <WalkIcon size={18} className="text-[color:var(--accent)]" />
                  <div>
                    <p className="text-sm text-white/60">Tiempo andando</p>
                    <p className="text-base font-semibold text-white">
                      {journeyMetrics.walkingMinutes} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                  <StepsIcon size={18} className="text-[color:var(--accent)]" />
                  <div>
                    <p className="text-sm text-white/60">Pasos aproximados</p>
                    <p className="text-base font-semibold text-white">
                      {journeyMetrics.steps}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                className="magnetic-button mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isLocating ? "Buscando ubicación..." : "Activar ubicación"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRouteOpen(true)}
              className="magnetic-button mt-6 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white"
            >
              Cómo llegar
            </button>

            <Link
              href={`/cities/${order.venue.citySlug}/venues/${order.venue.slug}`}
              className="magnetic-button mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white"
            >
              Volver al local
            </Link>
          </div>
        </aside>
      </div>

      <VenueRouteModal
        isOpen={isRouteOpen}
        onClose={() => setIsRouteOpen(false)}
        venueSlug={order.venue.slug}
        venueName={order.venue.name}
        address={order.venue.address}
        userLocation={userLocation}
        onRequestLocation={handleUseLocation}
        isLocating={isLocating}
      />
    </>
  );
}
