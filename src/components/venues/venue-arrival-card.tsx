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
  const distanceMeters = Math.max(50, Math.round(distanceKm * 1000));
  const walkingMinutes = Math.max(1, Math.round((distanceKm / 4.8) * 60));
  const drivingMinutes = Math.max(1, Math.round((distanceKm / 22) * 60));
  const steps = Math.max(60, Math.round(distanceKm * 1300));

  return {
    distanceMeters,
    walkingMinutes,
    drivingMinutes,
    steps,
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
      <div className="glass-panel rounded-[2.3rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Llegada al local
        </p>
        <p className="mt-4 text-3xl font-semibold leading-tight text-[color:var(--foreground)]">
          Recogida más clara y útil.
        </p>

        {arrivalMetrics ? (
          <div className="mt-6 grid gap-4">
            <div className="flex items-center gap-3 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
              <WalkIcon size={20} className="text-[color:var(--brand)]" />
              <div>
                <p className="text-sm text-[color:var(--muted)]">Tiempo andando</p>
                <p className="text-lg font-semibold text-[color:var(--foreground)]">
                  {arrivalMetrics.walkingMinutes} min
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
              <LocationPinIcon size={20} className="text-[color:var(--brand)]" />
              <div>
                <p className="text-sm text-[color:var(--muted)]">Distancia</p>
                <p className="text-lg font-semibold text-[color:var(--foreground)]">
                  {arrivalMetrics.distanceMeters} m
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
              <StepsIcon size={20} className="text-[color:var(--brand)]" />
              <div>
                <p className="text-sm text-[color:var(--muted)]">
                  Pasos estimados al recoger
                </p>
                <p className="text-lg font-semibold text-[color:var(--foreground)]">
                  {arrivalMetrics.steps} pasos
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
            <p className="text-sm leading-7 text-[color:var(--muted-strong)]">
              Usa tu ubicación para ver distancia aproximada, tiempo andando,
              tiempo en coche y pasos estimados hasta el local.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {!arrivalMetrics ? (
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-dark-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LocationPinIcon size={18} className="text-[color:var(--brand)]" />
              {isLocating ? "Buscando ubicación..." : "Activar ubicación"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-dark-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ClockIcon size={18} className="text-[color:var(--brand)]" />
              {isLocating ? "Actualizando ubicación..." : "Actualizar ubicación"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsRouteOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
          >
            <LocationPinIcon size={18} />
            Cómo llegar
          </button>
        </div>

        {feedback ? (
          <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
            {feedback}
          </p>
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
