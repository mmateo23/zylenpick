"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { SmoothCursor } from "@/components/ui/smooth-cursor";
import type { City } from "@/features/cities/types";
import {
  readSelectedCity,
  SELECTED_CITY_UPDATED_EVENT,
  type StoredCity,
} from "@/features/location/city-preference";
import type { HomeShowcaseItem } from "@/features/venues/types";

export type DemoHomeTemplate = {
  logoSrc: string;
  logoAlt: string;
  badgeLabel: string;
  accentBadgeLabel: string;
  titleLeading: string;
  titleAccent: string;
  heroDescription: string;
  bodyCopy: string;
  primaryCtaWithCity: string;
  primaryCtaWithoutCity: string;
  secondaryCtaWithCity: string;
  secondaryCtaWithoutCity: string;
  previewPrimaryLabelWithCity: string;
  previewPrimaryLabelWithoutCity: string;
  fallbackPrimaryCardLabelWithCity: string;
  fallbackPrimaryCardLabelWithoutCity: string;
  fallbackPrimaryCardTitle: string;
  fallbackSecondaryCardLabel: string;
  fallbackMapCardLabel: string;
  primaryHref: string;
  cityHrefBase: string;
  citiesHref: string;
};

type DemoHomeProps = {
  cities: City[];
  heroImageUrl: string;
  featuredItems: HomeShowcaseItem[];
  latestItems: HomeShowcaseItem[];
  template?: DemoHomeTemplate;
};

const FALLBACK_BACKGROUND =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80";
const DEMO_BACKGROUND_VIDEO =
  "https://cdn.pixabay.com/video/2024/01/18/197190-904257543_large.mp4";
const FEATURED_LINKS = [
  { label: "Temas", href: "/el-proyecto#temas" },
  { label: "El proyecto", href: "/el-proyecto" },
  { label: "Únete", href: "/unete" },
];
const QUICK_LINKS = [
  { label: "🍔 #DobleCheese", href: "/platos?focus=doble-cheese" },
  { label: "🌮 #TacoLento", href: "/platos?focus=taco-lento" },
  { label: "🍕 #HornoDeDani", href: "/zonas?focus=horno-de-dani" },
  { label: "🍜 #RamenPM", href: "/platos?focus=ramen-pm" },
  { label: "🥟 #LaEsquina", href: "/zonas?focus=la-esquina" },
  { label: "🌯 #LoPillo", href: "/platos?focus=lo-pillo" },
  { label: "🍗 #BarrioFrito", href: "/zonas?focus=barrio-frito" },
];

function getZonesHref(selectedCity: StoredCity | null) {
  return selectedCity?.slug ? `/zonas/${selectedCity.slug}` : "/zonas";
}

export function DemoHome({
  heroImageUrl,
  template,
}: DemoHomeProps) {
  const [selectedCity, setSelectedCity] = useState<StoredCity | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isVisualReady, setIsVisualReady] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPromptExpanded, setLocationPromptExpanded] = useState(false);
  const [locationAccepted, setLocationAccepted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncSelectedCity = () => {
      setSelectedCity(readSelectedCity());
    };

    syncSelectedCity();
    window.addEventListener(
      SELECTED_CITY_UPDATED_EVENT,
      syncSelectedCity as EventListener,
    );

    return () => {
      window.removeEventListener(
        SELECTED_CITY_UPDATED_EVENT,
        syncSelectedCity as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const markPageReady = () => {
      setIsPageReady(true);
    };

    if (document.readyState === "complete") {
      markPageReady();

      return undefined;
    }

    window.addEventListener("load", markPageReady, { once: true });

    return () => {
      window.removeEventListener("load", markPageReady);
    };
  }, []);

  useEffect(() => {
    if (!isPageReady && !isVisualReady) {
      return undefined;
    }

    setShowLoader(false);
    const timeoutId = window.setTimeout(() => {
      setIsLoaderVisible(false);
    }, 720);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isPageReady, isVisualReady]);

  useEffect(() => {
    if (showLoader) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowLocationPrompt(true);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showLoader]);

  const zoneLabel = selectedCity?.name ?? "Tu zona";

  return (
    <main
      data-demo-home-root
      className="relative h-[100svh] overflow-hidden bg-[#070707] text-white md:cursor-none"
    >
      {isLoaderVisible ? (
        <div
          className={`absolute inset-0 z-[90] flex items-center justify-center bg-[#168453] transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showLoader
              ? "opacity-100"
              : "pointer-events-none scale-[1.015] opacity-0 blur-[1px]"
          } motion-reduce:transition-none`}
        >
          <div
            className={`flex flex-col items-center gap-4 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              showLoader ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            } motion-reduce:transition-none`}
          >
            <div className="w-28 sm:w-32">
              <Image
                src="/logo/ZyelnpickLOGO_282828.svg"
                alt="ZylenPick"
                width={128}
                height={44}
                priority
                className="h-auto w-full"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.32em] text-[#282828]">
              <span className="animate-pulse [animation-delay:0ms]">Loading</span>
              <span className="animate-pulse [animation-delay:120ms]">.</span>
              <span className="animate-pulse [animation-delay:240ms]">.</span>
              <span className="animate-pulse [animation-delay:360ms]">.</span>
            </div>
          </div>
        </div>
      ) : null}

      <SmoothCursor />

      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          showLoader ? "scale-[1.025] opacity-0" : "scale-100 opacity-100"
        } motion-reduce:transition-none`}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-38"
          autoPlay
          muted
          loop
          playsInline
          poster={heroImageUrl || FALLBACK_BACKGROUND}
          onLoadedData={() => setIsVisualReady(true)}
          onCanPlay={() => setIsVisualReady(true)}
        >
          <source src={DEMO_BACKGROUND_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_24%),radial-gradient(circle_at_82%_16%,_rgba(191,219,254,0.05),_transparent_20%),linear-gradient(180deg,_rgba(255,255,255,0.005)_0%,_rgba(255,255,255,0.0)_28%,_rgba(15,23,42,0.1)_62%,_rgba(2,6,23,0.28)_100%)] backdrop-blur-[3px]" />
        <div className="absolute -left-[18vw] bottom-[-8vh] h-[24vh] w-[52vw] rounded-full bg-emerald-400/12 blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes bellRing {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(12deg);
          }
          20% {
            transform: rotate(-10deg);
          }
          30% {
            transform: rotate(8deg);
          }
          40% {
            transform: rotate(-6deg);
          }
          50% {
            transform: rotate(4deg);
          }
          60% {
            transform: rotate(-2deg);
          }
        }
      `}</style>

      <div
        className={`relative z-10 flex h-full items-center justify-center px-4 py-4 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 sm:py-8 ${
          showLoader ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        } motion-reduce:transition-none`}
      >
        <div className="flex w-full max-w-6xl flex-col items-center text-center">
          <div className="relative w-24 sm:w-32 md:w-36">
            <Image
              src="/logo/ZyelnpickLOGO_green.png"
              alt={template?.logoAlt ?? "ZylenPick"}
              width={144}
              height={48}
              priority
              className="h-auto w-full"
            />

            {showLocationPrompt ? (
              <>
                <div className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center px-4 sm:hidden">
                  <div className="pointer-events-auto relative">
                    {locationAccepted ? (
                      <div className="mb-2 flex justify-center">
                        <div className="rounded-full border border-[#b8f3da]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,250,244,0.94)_100%)] px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                          <span className="text-[10px] font-medium tracking-[0.04em] text-[#355747]">
                            {zoneLabel}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {locationPromptExpanded ? (
                      <div className="w-[min(calc(100vw-2rem),17rem)] rounded-[1rem] border border-[#b8f3da]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,250,244,0.94)_100%)] p-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center">
                            <Bell
                              className={`h-4 w-4 ${locationAccepted ? "text-[#168453]" : "text-[#dc2626]"}`}
                              strokeWidth={2}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium leading-4 text-[#0d2a1e]">
                              Activa la ubicación para ver zonas cercanas.
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setLocationPromptExpanded(false);
                              setShowLocationPrompt(false);
                            }}
                            className="rounded-full border border-[#b8f3da]/60 bg-white/70 px-2.5 py-1 text-[10px] font-medium tracking-[0.04em] text-[#355747] transition hover:bg-white/90 hover:text-[#0d2a1e]"
                          >
                            Ahora no
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLocationAccepted(true);
                              setLocationPromptExpanded(false);
                              setShowLocationPrompt(false);
                            }}
                            className="rounded-full bg-[#168453] px-3 py-1 text-[10px] font-semibold tracking-[0.04em] text-white transition hover:bg-[#147549]"
                          >
                            Permitir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!locationAccepted) {
                            setLocationPromptExpanded(true);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-[#b8f3da]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,250,244,0.94)_100%)] px-3 py-1.5 text-left shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                      >
                        <span className="inline-flex items-center justify-center">
                          <span
                            className={
                              locationAccepted
                                ? "inline-block"
                                : "inline-block animate-[bellRing_1.8s_ease-in-out_infinite]"
                            }
                          >
                            <Bell
                              className={`h-3.5 w-3.5 ${locationAccepted ? "text-[#168453]" : "text-[#dc2626]"}`}
                              strokeWidth={2}
                            />
                          </span>
                        </span>
                        <span className="text-[10px] font-medium tracking-[0.04em] text-[#355747]">
                          {locationAccepted ? "Ubicación" : "Permisos"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="pointer-events-none absolute left-full top-[20%] z-20 ml-3 hidden -translate-y-1/2 sm:block">
                <div className="pointer-events-auto relative flex flex-col items-start gap-2">
                  {locationAccepted ? (
                    <div className="relative z-10 ml-4 rounded-full border border-[#b8f3da]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,250,244,0.94)_100%)] px-3 py-1.5 text-left shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                      <span className="text-[10px] font-medium tracking-[0.04em] text-[#355747] sm:whitespace-nowrap">
                        {zoneLabel}
                      </span>
                    </div>
                  ) : null}

                  <div className="relative">
                    <span className="absolute left-0 top-1/2 z-0 h-2.5 w-2.5 -translate-x-[45%] -translate-y-1/2 rotate-45 rounded-[2px] bg-[#eefaf4]" />
                    {locationPromptExpanded ? (
                      <div className="relative z-10 w-[min(calc(100vw-2rem),17rem)] rounded-[1rem] border border-[#b8f3da]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,250,244,0.94)_100%)] p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center">
                            <Bell
                              className={`h-4 w-4 ${locationAccepted ? "text-[#168453]" : "text-[#dc2626]"}`}
                              strokeWidth={2}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium leading-4 text-[#0d2a1e]">
                              Activa la ubicación para ver zonas cercanas.
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setLocationPromptExpanded(false);
                              setShowLocationPrompt(false);
                            }}
                            className="rounded-full border border-[#b8f3da]/60 bg-white/70 px-2.5 py-1 text-[10px] font-medium tracking-[0.04em] text-[#355747] transition hover:bg-white/90 hover:text-[#0d2a1e]"
                          >
                            Ahora no
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLocationAccepted(true);
                              setLocationPromptExpanded(false);
                            }}
                            className="rounded-full bg-[#168453] px-3 py-1 text-[10px] font-semibold tracking-[0.04em] text-white transition hover:bg-[#147549]"
                          >
                            Permitir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!locationAccepted) {
                            setLocationPromptExpanded(true);
                          }
                        }}
                        className="relative z-10 flex items-center gap-1.5 rounded-full border border-[#b8f3da]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,250,244,0.94)_100%)] px-3 py-1.5 text-left shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition hover:bg-[#f7fffb]"
                      >
                        <span className="inline-flex items-center justify-center">
                          <span
                            className={
                              locationAccepted
                                ? "inline-block"
                                : "inline-block animate-[bellRing_1.8s_ease-in-out_infinite]"
                            }
                          >
                            <Bell
                              className={`h-3.5 w-3.5 ${locationAccepted ? "text-[#168453]" : "text-[#dc2626]"}`}
                              strokeWidth={2}
                            />
                          </span>
                        </span>
                        <span className="text-[10px] font-medium tracking-[0.04em] text-[#355747]">
                          {locationAccepted ? "Ubicación" : "Permisos"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                </div>
              </>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-[12ch] text-balance text-[clamp(2.5rem,7.2vw,7rem)] font-semibold leading-[0.88] tracking-[-0.08em] text-white sm:mt-6 sm:max-w-5xl">
            Bienvenido a ZylenPick.
          </h1>

          <p className="mt-3 max-w-xl text-balance text-[13px] leading-5 text-white/68 sm:mt-4 sm:max-w-2xl sm:text-base sm:leading-7 md:text-lg">
            Descubre platos y zonas para recoger comida de forma visual, rápida y directa.
          </p>

          <div className="mt-6 flex w-full max-w-3xl flex-row gap-2 sm:mt-10 sm:gap-4">
            <Link
              href={template?.primaryHref ?? "/platos"}
              className="group relative flex aspect-[10/11] basis-1/2 flex-col items-center justify-center gap-2 overflow-hidden px-3 py-3 text-center transition duration-300 hover:-translate-y-0.5 sm:min-h-[92px] sm:basis-1/2 sm:flex-1 sm:aspect-auto sm:flex-row sm:items-center sm:justify-end sm:gap-0 sm:px-5 sm:py-4 sm:text-right md:cursor-none"
            >
              <div className="relative z-10 inline-flex flex-col items-center gap-2 rounded-[1.5rem] border border-white/16 bg-white/[0.08] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)] backdrop-blur-[18px] sm:ml-auto sm:flex-row sm:items-center sm:gap-4 sm:rounded-[1.4rem] sm:px-4 sm:py-3">
                <div className="flex items-center justify-center text-[1.9rem] sm:text-[2rem]">
                  🍽️
                </div>
                <div className="mt-0">
                  <p className="text-[0.96rem] font-semibold tracking-[-0.05em] text-white sm:text-[1.6rem]">
                    {"Platos"}
                  </p>
                  <p className="mt-1.5 text-[8px] uppercase tracking-[0.24em] text-white/42 sm:text-[10px] sm:tracking-[0.28em]">
                    #Explora
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={getZonesHref(selectedCity)}
              className="group relative flex aspect-[10/11] basis-1/2 flex-col items-center justify-center gap-2 overflow-hidden px-3 py-3 text-center transition duration-300 hover:-translate-y-0.5 sm:min-h-[92px] sm:basis-1/2 sm:flex-1 sm:aspect-auto sm:flex-row sm:items-center sm:justify-start sm:gap-0 sm:px-5 sm:py-4 sm:text-left md:cursor-none"
            >
              <div className="relative z-10 inline-flex flex-col items-center gap-2 rounded-[1.5rem] border border-white/14 bg-white/[0.07] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)] backdrop-blur-[18px] sm:flex-row sm:items-center sm:gap-4 sm:rounded-[1.4rem] sm:px-4 sm:py-3">
                <div className="flex items-center justify-center text-[2rem]">
                  📍
                </div>
                <div className="mt-0">
                  <p className="text-[0.96rem] font-semibold tracking-[-0.05em] text-white sm:text-[1.6rem]">
                    {"Zonas"}
                  </p>
                  <p className="mt-1.5 text-[8px] uppercase tracking-[0.24em] text-white/40 sm:text-[10px] sm:tracking-[0.28em]">
                    #Explora
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-3 flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-2.5">
            {FEATURED_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-white/18 bg-white/[0.1] px-4 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white/88 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.14] hover:text-white md:cursor-none sm:px-4.5 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-2.5 flex w-full max-w-3xl flex-wrap items-center justify-center gap-1.5 sm:mt-4 sm:gap-2">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium tracking-[0.07em] text-white/54 transition hover:bg-white/[0.07] hover:text-white md:cursor-none sm:px-3.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
