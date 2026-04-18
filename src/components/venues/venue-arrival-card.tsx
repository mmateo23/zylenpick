"use client";

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
import { getVenueCoordinates } from "@/features/venues/venue-meta";

type VenueArrivalCardProps = {
  venueSlug: string;
  venueName: string;
  address: string | null;
};

type ArrivalMetrics = {
  distanceMeters: number;
  walkingMinutes: number;
  drivingMinutes: number;
  steps: number;
};

function calculateArrivalMetrics(
  userLocation: UserLocation,
  venueSlug: string,
): ArrivalMetrics | null {
  const venueCoordinates = getVenueCoordinates(venueSlug);

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
    drivingMinutes: Math.max(1, Math.round((distanceKm / 22) * 60)),
    steps: Math.max(60, Math.round(distanceKm * 1300)),
  };
}

export function VenueArrivalCard({
  venueSlug,
  venueName,
  address,
}: VenueArrivalCardProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setUserLocation(readUserLocation());
  }, []);

  const arrivalMetrics = useMemo(() => {
    if (!userLocation) {
      return null;
    }

    return calculateArrivalMetrics(userLocation, venueSlug);
  }, [userLocation, venueSlug]);

  const handleUseLocation = () => {
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
          "No hemos podido acceder a tu ubicación. Puedes seguir sin esta información.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <>
      <div className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
          Llegada
        </p>
        <p className="mt-3 text-2xl font-semibold leading-tight text-text-primary">
          Cómo llegar.
        </p>

        {arrivalMetrics ? (
          <div className="mt-5 grid gap-2.5">
            <div className="flex items-center gap-3 rounded-[0.9rem] border border-border-subtle bg-surface-muted px-3 py-2.5">
              <WalkIcon size={19} className="text-icon-highlight" />
              <div>
                <p className="text-sm text-text-muted">Andando</p>
                <p className="text-base font-semibold text-text-primary">
                  {arrivalMetrics.walkingMinutes} min
                </p>
              </div>
            </div>

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
        ) : (
          <div className="mt-5 rounded-[0.9rem] border border-border-subtle bg-surface-muted px-3 py-3">
            <p className="text-sm leading-6 text-text-secondary">
              Activa ubicación para ver distancia y tiempo aproximado.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className="magnetic-button inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-strong px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {arrivalMetrics ? (
              <ClockIcon size={18} className="text-icon-highlight" />
            ) : (
              <LocationPinIcon size={18} className="text-icon-highlight" />
            )}
            {isLocating
              ? arrivalMetrics
                ? "Actualizando ubicación..."
                : "Buscando ubicación..."
              : arrivalMetrics
                ? "Actualizar ubicación"
                : "Activar ubicación"}
          </button>

          <button
            type="button"
            onClick={() => setIsRouteOpen(true)}
            className="magnetic-button inline-flex items-center justify-center gap-2 rounded-full border border-accent-border bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft"
          >
            <LocationPinIcon size={18} />
            Cómo llegar
          </button>
        </div>

        {feedback ? (
          <p className="mt-4 text-sm leading-6 text-text-muted">{feedback}</p>
        ) : null}
      </div>

      <VenueRouteModal
        isOpen={isRouteOpen}
        onClose={() => setIsRouteOpen(false)}
        venueSlug={venueSlug}
        venueName={venueName}
        address={address}
        userLocation={userLocation}
        onRequestLocation={handleUseLocation}
        isLocating={isLocating}
      />
    </>
  );
}
