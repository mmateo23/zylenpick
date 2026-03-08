"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/branding/logo";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { MapIcon } from "@/components/icons/map-icon";
import {
  getDistanceInKm,
  saveUserLocation,
} from "@/features/location/browser-location";
import { saveSelectedCity } from "@/features/location/city-preference";
import type { City } from "@/features/cities/types";

type HomeLandingProps = {
  cities: City[];
  isConfigured: boolean;
};

type SupportedCityLocation = {
  slug: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
};

const supportedCityLocations: SupportedCityLocation[] = [
  {
    slug: "talavera-de-la-reina",
    latitude: 39.9635,
    longitude: -4.8308,
    radiusKm: 40,
  },
];

export function HomeLanding({ cities, isConfigured }: HomeLandingProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState(cities[0]?.slug ?? "");
  const [isLocating, setIsLocating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedCity) {
      setFeedback("Selecciona una zona para continuar.");
      return;
    }

    const selectedCityData = cities.find((city) => city.slug === selectedCity);

    if (selectedCityData) {
      saveSelectedCity({
        slug: selectedCityData.slug,
        name: selectedCityData.name,
      });
    }

    setFeedback(null);
    router.push(`/cities/${selectedCity}`);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setFeedback("Tu navegador no permite usar la ubicación.");
      return;
    }

    setIsLocating(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        const nearestCity = supportedCityLocations
          .map((city) => ({
            slug: city.slug,
            distanceKm: getDistanceInKm(
              position.coords.latitude,
              position.coords.longitude,
              city.latitude,
              city.longitude,
            ),
            radiusKm: city.radiusKm,
          }))
          .sort((cityA, cityB) => cityA.distanceKm - cityB.distanceKm)[0];

        const matchedCity =
          nearestCity && nearestCity.distanceKm <= nearestCity.radiusKm
            ? cities.find((city) => city.slug === nearestCity.slug)
            : null;

        if (!matchedCity) {
          setIsLocating(false);
          setFeedback(
            "Todavía no hemos podido identificar tu zona automáticamente. Elígela manualmente.",
          );
          return;
        }

        saveSelectedCity({
          slug: matchedCity.slug,
          name: matchedCity.name,
        });
        router.push(`/cities/${matchedCity.slug}`);
      },
      () => {
        setIsLocating(false);
        setFeedback(
          "No hemos podido acceder a tu ubicación. Elige tu zona manualmente.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <main
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(6, 9, 8, 0.28), rgba(6, 9, 8, 0.84)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(31,138,112,0.14),transparent_22%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),transparent)]" />

      <section className="relative z-10 w-full max-w-[34rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[color:var(--surface)]/88 p-4 shadow-[var(--shadow)] backdrop-blur-2xl sm:p-5">
        <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-7 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[color:var(--brand)]">
              <Logo
                priority
                mode="full"
                iconClassName="h-6 w-auto"
                textClassName="text-base font-semibold text-[color:var(--brand)]"
              />
            </span>
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">
              Comida local
            </span>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-white/56">Pide para recoger</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-[0.94] text-[color:var(--foreground)] sm:text-5xl">
              ZylenPick - Comida local para recoger
            </h1>
            <p className="mt-4 max-w-[34ch] text-base leading-7 text-[color:var(--muted-strong)]">
              Una entrada simple, visual y directa para descubrir comida local
              cerca de ti.
            </p>
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-white/8 bg-[color:var(--surface-dark)]/72 p-4 sm:p-5">
            <label
              htmlFor="city"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)]"
            >
              <MapIcon size={18} className="text-[color:var(--brand)]" />
              Selecciona tu zona
            </label>

            <select
              id="city"
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              disabled={!isConfigured || cities.length === 0}
              className="mt-3 w-full appearance-none rounded-[1.1rem] border border-white/8 bg-[color:var(--surface-strong)] px-4 py-4 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cities.length === 0 ? (
                <option value="">No hay zonas disponibles todavía</option>
              ) : null}
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!isConfigured || cities.length === 0}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={!isConfigured || cities.length === 0 || isLocating}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LocationPinIcon
                  size={18}
                  className="text-[color:var(--accent)]"
                />
                {isLocating ? "Buscando ubicación..." : "Usar mi ubicación"}
              </button>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-[color:var(--muted)]">
            {isConfigured
              ? "Puedes elegir una zona manualmente o intentar detectarla con tu ubicación actual."
              : "Supabase no está configurado todavía. Conéctalo para cargar las zonas reales."}
          </p>

          {feedback ? (
            <p className="mt-4 rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]">
              {feedback}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-white/44">by ZylenLabs</p>
        </div>
      </section>
    </main>
  );
}
