"use client";

import { useEffect, useMemo, useState } from "react";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { StepsIcon } from "@/components/icons/steps-icon";
import { WalkIcon } from "@/components/icons/walk-icon";
import {
  getDistanceInKm,
  readUserLocation,
  saveUserLocation,
  type UserLocation,
} from "@/features/location/browser-location";

type VenueArrivalCardProps = {
  venueSlug: string;
  venueName: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

type ArrivalMetrics = {
  distanceMeters: number;
  walkingMinutes: number;
  steps: number;
};

function buildGoogleMapsUrl(venueName: string, address: string | null) {
  const query = address?.trim() ? `${venueName}, ${address}` : venueName;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}

export function VenueArrivalCard({
  venueName,
  address,
  latitude,
  longitude,
}: VenueArrivalCardProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const mapsUrl = buildGoogleMapsUrl(venueName, address);
  const hasVenueCoordinates = latitude !== null && longitude !== null;

  useEffect(() => {
    setUserLocation(readUserLocation());
  }, []);

  const arrivalMetrics = useMemo<ArrivalMetrics | null>(() => {
    if (!hasVenueCoordinates || !userLocation) {
      return null;
    }

    const distanceKm = getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude,
    );

    return {
      distanceMeters: Math.max(50, Math.round(distanceKm * 1000)),
      walkingMinutes: Math.max(1, Math.round((distanceKm / 4.8) * 60)),
      steps: Math.max(60, Math.round(distanceKm * 1300)),
    };
  }, [hasVenueCoordinates, latitude, longitude, userLocation]);

  const handleUseLocation = () => {
    if (!hasVenueCoordinates) {
      setFeedback("La ubicación exacta del local todavía no está validada.");
      return;
    }

    if (!navigator.geolocation) {
      setFeedback("Tu navegador no permite usar la ubicación.");
      return;
    }

    setIsLocating(true);
    setFeedback(null);

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
        setFeedback(
          "No hemos podido acceder a tu ubicación. Puedes abrir la ruta igualmente.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
        Llegada
      </p>
      <p className="mt-3 text-2xl font-semibold leading-tight text-text-primary">
        Recoge tu pedido aquí.
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Abre la ruta cuando vayas a salir y llega directamente al local.
      </p>

      <div className="mt-5 rounded-[0.9rem] border border-border-subtle bg-surface-muted px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
          Dirección
        </p>
        <p className="mt-2 text-sm leading-6 text-text-primary">
          {address ?? "Dirección pendiente"}
        </p>
      </div>

      {arrivalMetrics ? (
        <div className="mt-4 grid gap-2.5">
          <div className="flex items-center gap-3 rounded-[0.9rem] border border-border-subtle bg-surface-muted px-3 py-2.5">
            <WalkIcon size={19} className="text-icon-highlight" />
            <div>
              <p className="text-sm text-text-muted">Andando</p>
              <p className="text-base font-semibold text-text-primary">
                {arrivalMetrics.walkingMinutes} min
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-3 rounded-[0.9rem] border border-border-subtle bg-surface-muted px-3 py-2.5">
              <LocationPinIcon size={19} className="text-icon-highlight" />
              <div>
                <p className="text-sm text-text-muted">Distancia</p>
                <p className="text-base font-semibold text-text-primary">
                  {arrivalMetrics.distanceMeters} m
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[0.9rem] border border-border-subtle bg-surface-muted px-3 py-2.5">
              <StepsIcon size={19} className="text-icon-highlight" />
              <div>
                <p className="text-sm text-text-muted">Pasos</p>
                <p className="text-base font-semibold text-text-primary">
                  {arrivalMetrics.steps}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : hasVenueCoordinates ? (
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={isLocating}
          className="magnetic-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-strong px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ClockIcon size={18} className="text-icon-highlight" />
          {isLocating ? "Buscando ubicación..." : "Ver distancia aproximada"}
        </button>
      ) : null}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="magnetic-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent-border bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft"
      >
        <LocationPinIcon size={18} />
        Cómo llegar
      </a>

      {feedback ? (
        <p className="mt-4 text-sm leading-6 text-text-muted">{feedback}</p>
      ) : null}
    </div>
  );
}
