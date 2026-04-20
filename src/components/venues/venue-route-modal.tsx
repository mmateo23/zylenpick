"use client";

import { CloseIcon } from "@/components/icons/close-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import type { UserLocation } from "@/features/location/browser-location";

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

function buildGoogleMapsUrl(
  venueName: string,
  address: string | null,
  userLocation: UserLocation | null,
) {
  const destination = address?.trim() ? `${venueName}, ${address}` : venueName;
  const encodedDestination = encodeURIComponent(destination);

  if (userLocation) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${encodedDestination}&travelmode=walking`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;
}

export function VenueRouteModal({
  isOpen,
  onClose,
  venueName,
  address,
  userLocation,
}: VenueRouteModalProps) {
  if (!isOpen) {
    return null;
  }

  const googleMapsUrl = buildGoogleMapsUrl(venueName, address, userLocation);

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,8,7,0.82)] backdrop-blur-sm">
      <div className="flex h-full items-end px-4 py-4 sm:items-center sm:justify-center sm:px-6">
        <section className="w-full max-w-lg rounded-[1.6rem] border border-white/10 bg-[color:var(--surface-dark)] p-5 text-white shadow-[var(--card-shadow)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/54">
                Cómo llegar
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{venueName}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="magnetic-button inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
              aria-label="Cerrar"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/54">
              Dirección
            </p>
            <p className="mt-3 text-sm leading-6 text-white/76">
              {address ?? "Dirección pendiente"}
            </p>
          </div>

          <p className="mt-5 text-sm leading-6 text-white/70">
            Abrimos Google Maps con la dirección del local para evitar rutas
            imprecisas dentro de ZylenPick.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-button inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
            >
              <LocationPinIcon size={18} />
              Abrir en Google Maps
            </a>

            <button
              type="button"
              onClick={onClose}
              className="magnetic-button inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
            >
              Cerrar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
