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
  readUserLocation,
  saveUserLocation,
  USER_LOCATION_UPDATED_EVENT,
  type UserLocation,
} from "@/features/location/browser-location";

type VenueLocalInformationProps = {
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
  isOpenNow: boolean;
};

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(50, Math.round(distanceKm * 1000))} m`;
  }

  return `${new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: distanceKm < 10 ? 1 : 0,
  }).format(distanceKm)} km`;
}

export function VenueLocalInformation({
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
  isOpenNow,
}: VenueLocalInformationProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const hasCoordinates = latitude !== null && longitude !== null;

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
    if (!userLocation || !hasCoordinates) return null;

    const distanceKm = getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude,
    );

    return {
      distanceKm,
      distanceLabel: formatDistance(distanceKm),
      walkingMinutes: Math.max(1, Math.round((distanceKm / 4.8) * 60)),
    };
  }, [hasCoordinates, latitude, longitude, userLocation]);

  const destination = address?.trim() ? `${venueName}, ${address}` : venueName;
  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  const websiteHref = website
    ? website.startsWith("http")
      ? website
      : `https://${website}`
    : null;

  const handleUseLocation = () => {
    if (!hasCoordinates) {
      setFeedback("La ubicación exacta del local todavía no está disponible.");
      return;
    }

    if (!navigator.geolocation) {
      setFeedback("Tu navegador no permite calcular la distancia.");
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
        setFeedback("No hemos podido acceder a tu ubicación. Puedes abrir la ruta igualmente.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section
      aria-labelledby="venue-information-title"
      className="overflow-hidden rounded-[1.35rem] border border-[#741314]/14 bg-[#FFF7E8] text-[#741314] shadow-[0_20px_55px_rgba(116,19,20,0.10)]"
    >
      <div className="flex flex-col gap-3 border-b border-[#741314]/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/65">
            Información del local
          </p>
          <h2
            id="venue-information-title"
            className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl"
          >
            Todo claro antes de recoger.
          </h2>
        </div>
        <span
          role="status"
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
            isOpenNow
              ? "border-emerald-700/18 bg-emerald-100 text-emerald-800"
              : "border-[#741314]/12 bg-[#741314]/[0.05] text-[#741314]/72"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isOpenNow ? "bg-emerald-600" : "bg-[#741314]/40"}`} />
          {isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(17rem,0.78fr)_minmax(0,1.22fr)]">
        <div className="flex flex-col justify-between bg-[#741314] p-5 text-[#FFF7E8] sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-[#FFF7E8]">
              <LocateFixed aria-hidden="true" className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-[0.18em]">Distancia al local</p>
            </div>
            {journey ? (
              <>
                <p className="mt-5 text-[clamp(2.75rem,7vw,4.8rem)] font-semibold leading-none tracking-[-0.065em]">
                  {journey.distanceLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#FFF7E8]/72">
                  Aproximadamente {journey.walkingMinutes} min andando. Distancia orientativa en línea recta.
                </p>
              </>
            ) : (
              <>
                <p className="mt-5 max-w-[12ch] text-3xl font-semibold leading-[0.98] tracking-[-0.04em]">
                  Descubre qué tienes cerca.
                </p>
                <p className="mt-3 text-sm leading-6 text-[#FFF7E8]/72">
                  Usa tu ubicación para calcular la distancia aproximada hasta este local.
                </p>
              </>
            )}
          </div>

          {hasCoordinates ? (
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold text-[#741314] transition hover:bg-white disabled:cursor-wait disabled:opacity-65"
            >
              <LocateFixed aria-hidden="true" className="h-4.5 w-4.5" />
              {isLocating ? "Calculando…" : journey ? "Actualizar distancia" : "Calcular distancia"}
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
                Recogida
              </dt>
              <dd className="mt-3 text-sm font-semibold leading-6">
                {pickupEtaMin ? `Preparación aproximada: ${pickupEtaMin} min.` : "Tiempo de preparación por confirmar."}
              </dd>
              {pickupNotes ? (
                <dd className="mt-1 text-xs leading-5 text-[#741314]/62">{pickupNotes}</dd>
              ) : null}
            </div>
            <div className="border-b border-[#741314]/10 p-5 sm:border-b-0 sm:border-r sm:p-6">
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
            <div className="p-5 sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#741314]">
                <Navigation aria-hidden="true" className="h-4 w-4" />
                Zona
              </dt>
              <dd className="mt-3 text-sm font-semibold leading-6">{cityName}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2 border-t border-[#741314]/10 p-4 sm:p-5">
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#741314] px-4 py-2.5 text-sm font-bold text-[#FFF7E8] transition hover:bg-[#5F0F10]"
            >
              <Navigation aria-hidden="true" className="h-4 w-4" />
              Cómo llegar
            </a>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#741314]/14 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold transition hover:bg-white"
              >
                <Phone aria-hidden="true" className="h-4 w-4" />
                Llamar
              </a>
            ) : null}
            {websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#741314]/14 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold transition hover:bg-white"
              >
                <Globe2 aria-hidden="true" className="h-4 w-4" />
                Web
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {!websiteHref && email ? (
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#741314]/14 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold transition hover:bg-white"
              >
                <Mail aria-hidden="true" className="h-4 w-4" />
                Escribir
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
