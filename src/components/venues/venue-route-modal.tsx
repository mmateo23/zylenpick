"use client";

import { useMemo } from "react";

import { CarIcon } from "@/components/icons/car-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { WalkIcon } from "@/components/icons/walk-icon";
import {
  getDistanceInKm,
  type UserLocation,
} from "@/features/location/browser-location";
import { getVenueCoordinates } from "@/features/venues/venue-meta";

type VenueRouteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  venueSlug: string;
  venueName: string;
  address: string | null;
  userLocation: UserLocation | null;
  onRequestLocation: () => void;
  isLocating: boolean;
};

function getMapBounds(latitude: number, longitude: number) {
  const offset = 0.01;
  return `${longitude - offset}%2C${latitude - offset}%2C${longitude + offset}%2C${latitude + offset}`;
}

export function VenueRouteModal({
  isOpen,
  onClose,
  venueSlug,
  venueName,
  address,
  userLocation,
  onRequestLocation,
  isLocating,
}: VenueRouteModalProps) {
  const venueCoordinates = getVenueCoordinates(venueSlug);
  const destinationQuery = address?.trim()
    ? `${venueName}, ${address}`
    : venueCoordinates
      ? `${venueCoordinates.latitude},${venueCoordinates.longitude}`
      : null;

  const metrics = useMemo(() => {
    if (!userLocation || !venueCoordinates) {
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
      drivingMinutes: Math.max(1, Math.round((distanceKm / 22) * 60)),
    };
  }, [userLocation, venueCoordinates]);

  if (!isOpen || !destinationQuery) {
    return null;
  }

  const mapUrl = venueCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${getMapBounds(
        venueCoordinates.latitude,
        venueCoordinates.longitude,
      )}&layer=mapnik&marker=${venueCoordinates.latitude}%2C${venueCoordinates.longitude}`
    : null;
  const encodedDestination = encodeURIComponent(destinationQuery);

  const googleMapsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${encodedDestination}&travelmode=walking`
    : `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,8,7,0.82)] backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/54">
              Cómo llegar
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{venueName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="magnetic-button inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-h-[45vh] bg-[color:var(--surface-dark)]">
            {mapUrl ? (
              <iframe
                title={`Mapa de ${venueName}`}
                src={mapUrl}
                className="h-full min-h-[45vh] w-full border-0"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full min-h-[45vh] items-center justify-center px-6 text-center text-white/70">
                <p className="max-w-sm text-sm leading-6">
                  Abre Google Maps para ver la ruta exacta con la dirección del
                  local.
                </p>
              </div>
            )}
          </div>

          <aside className="overflow-y-auto border-t border-white/10 bg-[color:var(--surface-dark)] p-5 text-white lg:border-l lg:border-t-0 lg:p-6">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/54">
                Destino
              </p>
              <p className="mt-3 text-lg font-semibold">{venueName}</p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                {address ?? "Dirección pendiente"}
              </p>
            </div>

            {metrics ? (
              <div className="mt-5 grid gap-3">
                <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                  <WalkIcon size={20} className="text-[color:var(--accent)]" />
                  <div>
                    <p className="text-sm text-white/60">Tiempo andando</p>
                    <p className="text-lg font-semibold">
                      {metrics.walkingMinutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                  <CarIcon size={20} className="text-[color:var(--accent)]" />
                  <div>
                    <p className="text-sm text-white/60">Tiempo en coche</p>
                    <p className="text-lg font-semibold">
                      {metrics.drivingMinutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                  <LocationPinIcon
                    size={20}
                    className="text-[color:var(--accent)]"
                  />
                  <div>
                    <p className="text-sm text-white/60">Distancia aproximada</p>
                    <p className="text-lg font-semibold">
                      {metrics.distanceMeters} m
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-base font-semibold">
                  Activa tu ubicación para ver la ruta.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Podemos mostrarte el mapa del local ahora mismo y, cuando
                  aceptes la ubicación, también la distancia y los tiempos
                  aproximados.
                </p>
                <button
                  type="button"
                  onClick={onRequestLocation}
                  disabled={isLocating}
                  className="magnetic-button mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LocationPinIcon size={18} />
                  {isLocating ? "Buscando ubicación..." : "Activar ubicación"}
                </button>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="magnetic-button inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
              >
                <ClockIcon size={18} />
                Abrir ruta en Google Maps
              </a>

              <button
                type="button"
                onClick={onClose}
                className="magnetic-button inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                Cerrar mapa
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
