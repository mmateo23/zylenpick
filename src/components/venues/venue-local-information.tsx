"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  ExternalLink,
  Globe2,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";

import {
  getDistanceInKm,
  getUserLocationErrorMessage,
  readUserLocation,
  requestUserLocation,
  USER_LOCATION_UPDATED_EVENT,
  type UserLocation,
} from "@/features/location/browser-location";
import { VenueOpeningStatusBadge } from "@/components/venues/venue-opening-status-badge";
import type {
  OpeningHoursValue,
  OpeningStatus,
} from "@/features/venues/opening-hours";
import { resolveVenueCoordinates } from "@/features/venues/venue-meta";

type VenueLocalInformationProps = {
  venueSlug: string;
  venueName: string;
  cityName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  pickupNotes: string | null;
  pickupEtaMin: number | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: OpeningHoursValue;
  openingStatus: OpeningStatus;
};

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(50, Math.round(distanceKm * 1000))} m`;
  }

  return `${new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: distanceKm < 10 ? 1 : 0,
  }).format(distanceKm)} km`;
}

function formatAccuracy(accuracy: number) {
  if (accuracy < 1000) {
    return `${Math.max(10, Math.round(accuracy / 10) * 10)} m`;
  }

  return `${new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 1,
  }).format(accuracy / 1000)} km`;
}

export function VenueLocalInformation({
  venueSlug,
  venueName,
  cityName,
  address,
  phone,
  email,
  website,
  pickupNotes,
  pickupEtaMin,
  latitude,
  longitude,
  openingHours,
  openingStatus,
}: VenueLocalInformationProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const venueCoordinates = useMemo(
    () =>
      resolveVenueCoordinates({
        slug: venueSlug,
        latitude,
        longitude,
      }),
    [latitude, longitude, venueSlug],
  );
  const hasCoordinates = venueCoordinates !== null;

  useEffect(() => {
    setUserLocation(readUserLocation());

    const syncLocation = () => setUserLocation(readUserLocation());
    window.addEventListener(USER_LOCATION_UPDATED_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);

    return () => {
      window.removeEventListener(USER_LOCATION_UPDATED_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  const journey = useMemo(() => {
    if (!userLocation || !venueCoordinates) return null;

    const distanceKm = getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      venueCoordinates.latitude,
      venueCoordinates.longitude,
    );

    return {
      distanceKm,
      distanceLabel: formatDistance(distanceKm),
      walkingMinutes: Math.max(1, Math.round((distanceKm / 4.8) * 60)),
    };
  }, [userLocation, venueCoordinates]);

  const destination = address?.trim() ? `${venueName}, ${address}` : venueName;
  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  const websiteHref = website
    ? website.startsWith("http")
      ? website
      : `https://${website}`
    : null;

  const handleUseLocation = async () => {
    if (!hasCoordinates) {
      setFeedback("La ubicación exacta del local todavía no está disponible.");
      return;
    }

    setIsLocating(true);
    setFeedback(null);

    try {
      setUserLocation(await requestUserLocation());
      setFeedback("Distancia actualizada desde tu ubicación.");
    } catch (error) {
      setFeedback(getUserLocationErrorMessage(error));
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <section
      id="informacion"
      aria-labelledby="venue-information-title"
      className="scroll-mt-28 overflow-hidden rounded-[1.25rem] border border-[#741314]/14 bg-[#FFF7E8] text-[#741314] shadow-[0_16px_42px_rgba(116,19,20,0.08)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#741314]/10 px-4 py-4 sm:items-center sm:px-6 sm:py-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/65">
            Planifica tu visita
          </p>
          <h2
            id="venue-information-title"
            className="mt-1.5 text-xl font-semibold tracking-[-0.035em] sm:text-2xl"
          >
            Lo importante para llegar y recoger.
          </h2>
        </div>
        <VenueOpeningStatusBadge
          openingHours={openingHours}
          initialStatus={openingStatus}
        />
      </div>

      <div className="grid lg:grid-cols-[minmax(17rem,0.78fr)_minmax(0,1.22fr)]">
        <div className="flex flex-col justify-between bg-[#741314] p-5 text-[#FFF7E8] sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-[#FFF7E8]">
              <LocateFixed aria-hidden="true" className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-[0.18em]">Desde donde estás</p>
            </div>
            {journey ? (
              <>
                <p className="mt-4 text-[clamp(2.35rem,7vw,3.8rem)] font-semibold leading-none tracking-[-0.06em]">
                  {journey.distanceLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#FFF7E8]/72">
                  Unos {journey.walkingMinutes} min andando. La distancia es orientativa.
                </p>
                {userLocation?.accuracy && userLocation.accuracy > 250 ? (
                  <p className="mt-2 text-xs leading-5 text-[#FFF7E8]/62">
                    Ubicación aproximada con una precisión de ±{formatAccuracy(userLocation.accuracy)}.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="mt-4 max-w-[15ch] text-2xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-3xl">
                  ¿Te queda cerca?
                </p>
                <p className="mt-3 text-sm leading-6 text-[#FFF7E8]/72">
                  Comparte tu ubicación para calcular la distancia hasta el local.
                </p>
              </>
            )}
          </div>

          {hasCoordinates ? (
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold text-[#741314] outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#741314] disabled:cursor-wait disabled:opacity-65"
            >
              <LocateFixed aria-hidden="true" className="h-4.5 w-4.5" />
              {isLocating ? "Calculando…" : journey ? "Actualizar ubicación" : "Usar mi ubicación"}
            </button>
          ) : null}
          {feedback ? (
            <p className="mt-3 text-xs leading-5 text-[#FFF7E8]/72" role="status" aria-live="polite">
              {feedback}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <dl className="grid sm:grid-cols-2">
            <div className="border-b border-[#741314]/10 p-5 sm:border-r sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#741314]">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                Dirección
              </dt>
              <dd className="mt-3 text-sm font-semibold leading-6">
                {address ?? `Dirección pendiente en ${cityName}`}
              </dd>
            </div>
            <div className="border-b border-[#741314]/10 p-5 sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#741314]">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
                Tiempo de preparación
              </dt>
              <dd className="mt-3 text-sm font-semibold leading-6">
                {pickupEtaMin ? `Suele estar listo en unos ${pickupEtaMin} min.` : "El local confirmará cuánto tarda."}
              </dd>
              {pickupNotes ? (
                <dd className="mt-1 text-xs leading-5 text-[#741314]/62">{pickupNotes}</dd>
              ) : null}
            </div>
            <div className="hidden border-b border-[#741314]/10 p-5 sm:block sm:border-b-0 sm:border-r sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#741314]">
                <Phone aria-hidden="true" className="h-4 w-4" />
                Contacto
              </dt>
              <dd className="mt-3 space-y-2 text-sm font-semibold">
                {phone ? <a className="block underline decoration-[#741314]/30 underline-offset-4" href={`tel:${phone}`}>{phone}</a> : null}
                {email ? <a className="block break-all underline decoration-[#741314]/30 underline-offset-4" href={`mailto:${email}`}>{email}</a> : null}
                {!phone && !email ? <span className="text-[#741314]/62">Contacto pendiente</span> : null}
              </dd>
            </div>
            <div className="hidden p-5 sm:block sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#741314]">
                <Navigation aria-hidden="true" className="h-4 w-4" />
                Zona
              </dt>
              <dd className="mt-3 text-sm font-semibold leading-6">{cityName}</dd>
            </div>
          </dl>

          <details className="group border-t border-[#741314]/10 sm:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#741314] [&::-webkit-details-marker]:hidden">
              Contacto y otros datos
              <span aria-hidden="true" className="text-lg transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="grid gap-4 border-t border-[#741314]/10 px-5 py-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#741314]/62">Contacto</p>
                <div className="mt-2 space-y-2 font-semibold">
                  {phone ? <a className="block underline decoration-[#741314]/30 underline-offset-4" href={`tel:${phone}`}>{phone}</a> : null}
                  {email ? <a className="block break-all underline decoration-[#741314]/30 underline-offset-4" href={`mailto:${email}`}>{email}</a> : null}
                  {!phone && !email ? <span className="text-[#741314]/62">Contacto pendiente</span> : null}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#741314]/62">Zona</p>
                <p className="mt-2 font-semibold">{cityName}</p>
              </div>
            </div>
          </details>

          <div className="grid grid-cols-2 gap-2 border-t border-[#741314]/10 p-4 sm:flex sm:flex-wrap sm:p-5">
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#741314] px-4 py-2.5 text-sm font-bold text-[#FFF7E8] outline-none transition hover:bg-[#5F0F10] focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
            >
              <Navigation aria-hidden="true" className="h-4 w-4" />
              Abrir ruta
            </a>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#741314]/14 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
              >
                <Phone aria-hidden="true" className="h-4 w-4" />
                Llamar al local
              </a>
            ) : null}
            {websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#741314]/14 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 sm:col-span-1"
              >
                <Globe2 aria-hidden="true" className="h-4 w-4" />
                Visitar web
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {!websiteHref && email ? (
              <a
                href={`mailto:${email}`}
                className="col-span-2 inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#741314]/14 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 sm:col-span-1"
              >
                <Mail aria-hidden="true" className="h-4 w-4" />
                Enviar email
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
