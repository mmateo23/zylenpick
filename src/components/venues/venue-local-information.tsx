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
import { NativeDirectionsLink } from "@/components/maps/native-directions-link";
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
    <section id="informacion" aria-labelledby="venue-information-title" className="scroll-mt-28 rounded-[22px] border border-[#741314]/20 bg-[#fffdf8] p-5 text-[#24110E]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#741314]">Nos vemos aquí</p>
      <h2 id="venue-information-title" className="mt-2 text-2xl font-bold tracking-[-0.04em]">Cómo llegar.</h2>
      <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#61433A]"><MapPin size={17} className="mt-1 shrink-0 text-[#741314]" aria-hidden="true" />{address ?? `Dirección pendiente en ${cityName}`}</p>
      {venueCoordinates ? <NativeDirectionsLink
        destination={venueCoordinates} origin={userLocation} destinationLabel={venueName}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#741314] px-4 py-3 text-sm font-bold text-[#FFF7E8] hover:bg-[#541011]"
      ><Navigation size={16} aria-hidden="true" /> Abrir ruta</NativeDirectionsLink> : null}

      {hasCoordinates ? <div className="mt-5 border-t border-[#741314]/15 pt-4">
        {journey ? <p className="text-sm font-bold text-[#741314]">A {journey.distanceLabel} · Unos {journey.walkingMinutes} min a pie</p> : null}
        <button type="button" onClick={handleUseLocation} disabled={isLocating} className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#741314] underline underline-offset-4 disabled:opacity-60">
          <LocateFixed size={15} aria-hidden="true" />{isLocating ? "Calculando…" : journey ? "Actualizar mi distancia" : "Calcular distancia desde mí"}
        </button>
        {journey ? <p className="text-xs leading-5 text-[#61433A]">Distancia orientativa.{userLocation?.accuracy && userLocation.accuracy > 250 ? ` Precisión de tu ubicación: ±${formatAccuracy(userLocation.accuracy)}.` : ""}</p> : null}
        {feedback ? <p className="mt-2 text-xs leading-5 text-[#61433A]" role="status">{feedback}</p> : null}
      </div> : null}

      <div className="mt-5 grid gap-2 border-t border-[#741314]/15 pt-4">
        {phone ? <a href={`tel:${phone}`} className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#741314]"><Phone size={16} aria-hidden="true" />{phone}</a> : null}
        {websiteHref ? <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#741314]"><Globe2 size={16} aria-hidden="true" />Web del local <ExternalLink size={13} aria-hidden="true" /></a> : null}
        {email ? <a href={`mailto:${email}`} className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#741314]"><Mail size={16} className="shrink-0" aria-hidden="true" /><span className="break-all">{email}</span></a> : null}
      </div>
      {pickupNotes || pickupEtaMin ? <details className="mt-4 border-t border-[#741314]/15 pt-3">
        <summary className="min-h-11 cursor-pointer py-3 text-xs font-bold text-[#741314]">Sobre la recogida</summary>
        {pickupEtaMin ? <p className="flex items-center gap-2 text-xs leading-6 text-[#61433A]"><Clock3 size={14} aria-hidden="true" />Preparación: unos {pickupEtaMin} min.</p> : null}
        {pickupNotes ? <p className="mt-2 text-xs leading-6 text-[#61433A]">{pickupNotes}</p> : null}
      </details> : null}
    </section>
  );
}
