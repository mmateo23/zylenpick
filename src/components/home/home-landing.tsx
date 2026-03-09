"use client";

import { useEffect, useState } from "react";
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
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    if (!isInfoOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsInfoOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isInfoOpen]);

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

  const handleExploreFood = () => {
    setIsInfoOpen(false);
  };

  return (
    <main
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(6, 9, 8, 0.22), rgba(6, 9, 8, 0.86)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(31,138,112,0.16),transparent_22%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),transparent)]" />

      <section className="relative z-10 w-full max-w-[34rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[color:var(--surface)]/86 p-4 shadow-[var(--shadow)] backdrop-blur-2xl sm:p-5">
        <div className="rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-7 sm:p-9">
          <div className="flex justify-center">
            <Logo
              priority
              mode="full"
              className="gap-4"
              iconClassName="h-12 w-auto sm:h-14"
              textClassName="text-3xl font-semibold text-white sm:text-4xl"
            />
          </div>

          <div className="mt-8 text-center">
            <h1 className="text-balance text-3xl font-semibold leading-[0.96] text-[color:var(--foreground)] sm:text-4xl">
              Comida local para recoger.
            </h1>
            <p className="mx-auto mt-4 max-w-[26rem] text-sm leading-7 text-[color:var(--muted-strong)] sm:text-base">
              Elige tu zona y entra directo al menú.
            </p>
          </div>

          <div className="mt-8 rounded-[1.7rem] border border-white/8 bg-[color:var(--surface-dark)]/74 p-4 sm:p-5">
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
              className="dark-form-field mt-4 w-full appearance-none rounded-[1.2rem] border border-white/8 bg-[color:var(--surface-strong)] px-4 py-4 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
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

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!isConfigured || cities.length === 0}
                className="magnetic-button inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continuar
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(true)}
                  className="magnetic-button inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-white/8"
                >
                  ¿Qué es ZylenPick?
                </button>

                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={!isConfigured || cities.length === 0 || isLocating}
                  className="magnetic-button inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LocationPinIcon
                    size={18}
                    className="text-[color:var(--accent)]"
                  />
                  {isLocating ? "Buscando ubicación..." : "Usar mi ubicación"}
                </button>
              </div>
            </div>
          </div>

          {feedback ? (
            <p className="mt-5 rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]">
              {feedback}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-white/40">by ZylenLabs</p>
        </div>
      </section>

      {isInfoOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zylenpick-info-title"
          onClick={() => setIsInfoOpen(false)}
        >
          <div className="absolute inset-0 bg-[rgba(3,6,5,0.72)] backdrop-blur-md" />

          <section
            className="spotlight-panel hover-lift-card relative z-10 w-full max-w-[34rem] rounded-[2rem] border border-white/10 bg-[color:var(--surface)]/96 p-6 shadow-[var(--shadow)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
                ZylenPick
              </p>
              <h2
                id="zylenpick-info-title"
                className="mt-4 text-balance text-3xl font-semibold leading-[0.98] text-[color:var(--foreground)] sm:text-4xl"
              >
                ¿Qué es ZylenPick?
              </h2>

              <div className="mt-6 space-y-4 text-sm leading-7 text-[color:var(--muted-strong)] sm:text-base">
                <p>
                  ZylenPick conecta a las personas con la comida local de su ciudad.
                </p>
                <p>
                  Descubre platos cercanos, haz tu pedido y recógelo directamente
                  en el local.
                </p>
                <p>Sin esperas, sin repartos innecesarios.</p>
                <p>Apoya a la hostelería de tu barrio.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleExploreFood}
                className="magnetic-button inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
              >
                Explorar comida cerca
              </button>

              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="magnetic-button inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-white/8"
              >
                Volver
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
