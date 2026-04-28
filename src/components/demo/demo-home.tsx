"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Info, MoreHorizontal, Send, ShoppingBag } from "lucide-react";

import { SmoothCursor } from "@/components/ui/smooth-cursor";
import type { City } from "@/features/cities/types";
import type { SiteDesignConfig } from "@/features/design/site-design-config";
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
  design?: SiteDesignConfig;
  featuredItems: HomeShowcaseItem[];
  latestItems: HomeShowcaseItem[];
  template?: DemoHomeTemplate;
};

function getZonesHref(selectedCity: StoredCity | null) {
  return selectedCity?.slug ? `/zonas/${selectedCity.slug}` : "/zonas";
}

function formatHomePrice(item: HomeShowcaseItem) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: item.currency,
  }).format(item.priceAmount / 100);
}

function getPreviewItemHref(item: HomeShowcaseItem) {
  return `/zonas/${item.venue.citySlug}/venues/${item.venue.slug}#plato-${item.id}`;
}

export function DemoHome({
  featuredItems,
  latestItems,
  template,
}: DemoHomeProps) {
  const [selectedCity, setSelectedCity] = useState<StoredCity | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);
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
    if (!isPageReady) {
      return undefined;
    }

    setShowLoader(false);
    const timeoutId = window.setTimeout(() => {
      setIsLoaderVisible(false);
    }, 720);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isPageReady]);

  const zoneLabel = selectedCity?.name ?? "Tu zona";
  const previewItems = [...featuredItems, ...latestItems]
    .filter((item, index, items) => {
      return (
        Boolean(item.imageUrl) &&
        items.findIndex((candidate) => candidate.id === item.id) === index
      );
    })
    .slice(0, 8);

  return (
    <main
      data-demo-home-root
      className="zylen-visual-skin relative min-h-[100svh] overflow-x-hidden overflow-y-visible text-white md:cursor-none lg:h-[100svh] lg:overflow-hidden"
    >
      <style jsx global>{`
        @keyframes homeHeroCardFloat {
          0%,
          100% {
            transform: perspective(900px) translate3d(0, -12px, 0) rotateX(6deg) rotateY(-6deg) rotateZ(-1deg) scale(1.05);
          }
          50% {
            transform: perspective(900px) translate3d(0, 0, 0) rotateX(5deg) rotateY(-4deg) rotateZ(1deg) scale(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-hero-card-float {
            animation: none !important;
          }
        }
      `}</style>
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
              showLoader
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
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
              <span className="animate-pulse [animation-delay:0ms]">
                Loading
              </span>
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
        <div className="brand-particle-field" />
        <div className="brand-ambient-orb brand-ambient-orb--green left-[-12vw] top-[12vh] h-[36vh] w-[42vw]" />
        <div className="brand-ambient-orb brand-ambient-orb--amber right-[-14vw] top-[10vh] h-[38vh] w-[44vw]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(3,4,4,0.16)_46%,rgba(3,4,4,0.72)_100%)]" />
      </div>

      <div
        className={`relative z-10 flex min-h-[100svh] items-start justify-center overflow-visible px-4 pb-10 pt-5 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 sm:py-8 lg:h-full lg:min-h-0 lg:items-center lg:overflow-hidden ${
          showLoader ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        } motion-reduce:transition-none`}
      >
        <div className="grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(19rem,0.9fr)] lg:gap-10">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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

          <h1 className="mt-4 max-w-[12ch] text-balance text-[clamp(2.8rem,10vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-white drop-shadow-[0_22px_56px_rgba(0,0,0,0.5)] sm:mt-6 lg:max-w-[9ch]">
            {"Elige qu\u00e9 comer en segundos"}
          </h1>

          <p className="mt-3 max-w-sm text-balance text-[18px] font-medium leading-7 text-white/84 drop-shadow-[0_10px_28px_rgba(0,0,0,0.42)] sm:mt-4 sm:text-xl sm:leading-8">
            {"Mira platos. Decide. Rec\u00f3gelo."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href={template?.primaryHref ?? "/platos"}
              className="inline-flex items-center justify-center rounded-full bg-[#ffb45d] px-6 py-3.5 text-sm font-semibold text-[#1b0d04] shadow-[0_20px_54px_rgba(255,159,72,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ffc87d] md:cursor-none"
            >
              Ver platos
            </Link>
            <Link
              href={getZonesHref(selectedCity)}
              className="inline-flex items-center justify-center rounded-full border border-white/16 bg-black/20 px-5 py-3.5 text-sm font-semibold text-white/82 transition hover:-translate-y-0.5 hover:bg-black/28 md:cursor-none"
            >
              Explorar zonas
            </Link>
          </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[21.75rem] items-center justify-center self-center lg:mx-auto lg:max-w-[24rem] lg:-translate-x-4">
            <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,180,93,0.28),rgba(124,255,184,0.08)_42%,transparent_70%)] blur-3xl" />
            {previewItems[0] ? (
              <article className="home-hero-card-float relative flex w-full flex-col overflow-hidden rounded-[1.85rem] bg-[#f8f7f3] text-[#111111] shadow-[0_36px_86px_rgba(0,0,0,0.52),0_0_70px_rgba(255,180,93,0.14)] transition duration-500 hover:scale-[1.04] md:cursor-none lg:max-h-[min(82svh,40rem)] motion-safe:animate-[homeHeroCardFloat_8s_ease-in-out_infinite]">
                <header className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <Link
                    href={getPreviewItemHref(previewItems[0])}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-sm font-semibold text-white">
                      {previewItems[0].venue.logoUrl ? (
                        <Image
                          src={previewItems[0].venue.logoUrl}
                          alt={previewItems[0].venue.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        previewItems[0].venue.name.trim().slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold leading-4">
                        {previewItems[0].venue.name}
                      </span>
                      <span className="block truncate text-xs leading-4 text-[#6f6f6f]">
                        {previewItems[0].venue.cityName}
                      </span>
                    </span>
                  </Link>
                  <Link
                    href={getPreviewItemHref(previewItems[0])}
                    aria-label="Ver local"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Link>
                </header>

                <Link href={getPreviewItemHref(previewItems[0])} className="block shrink-0">
                  <div className="relative h-[28svh] min-h-[11.5rem] max-h-[16.5rem] overflow-hidden bg-[#141414] sm:h-[40svh] sm:min-h-[13.5rem] sm:max-h-[23rem]">
                  <Image
                    src={previewItems[0].imageUrl ?? ""}
                    alt={previewItems[0].name}
                    fill
                    sizes="(max-width: 640px) 22rem, 25rem"
                    className="object-cover object-center transition duration-700 hover:scale-[1.025]"
                    priority
                  />
                  </div>
                </Link>

                <section className="shrink-0 bg-[#f8f7f3] px-3.5 pb-3.5 pt-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={getPreviewItemHref(previewItems[0])}
                        aria-label="Ver detalle del plato"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                      >
                        <Info className="h-5 w-5" />
                      </Link>
                      <Link
                        href={getPreviewItemHref(previewItems[0])}
                        aria-label="Compartir plato"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                      >
                        <Send className="h-5 w-5" />
                      </Link>
                    </div>
                    <Link
                      href={getPreviewItemHref(previewItems[0])}
                      aria-label="Añadir para recoger"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:bg-black"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </Link>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 min-w-0 text-lg font-semibold leading-5 tracking-[-0.04em] text-[#111111] sm:text-xl sm:leading-6">
                        {previewItems[0].name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-[#ffb45d] px-3 py-1.5 text-sm font-bold text-[#1b0d04]">
                        {formatHomePrice(previewItems[0])}
                      </span>
                    </div>
                    {previewItems[0].description ? (
                      <p className="line-clamp-2 text-sm leading-5 text-[#5f5f5f]">
                        {previewItems[0].description}
                      </p>
                    ) : null}
                    <span className="inline-flex rounded-full bg-[#111111]/[0.06] px-3 py-1.5 text-xs font-medium text-[#4a4a4a]">
                      {previewItems[0].pickupEtaMin
                        ? `Listo en ${previewItems[0].pickupEtaMin} min`
                        : "Listo para recoger"}
                    </span>
                  </div>
                </section>
              </article>
            ) : (
              <div className="relative flex aspect-[4/5] items-center justify-center rounded-[2.15rem] border border-white/14 bg-white/[0.075] px-8 text-center text-sm text-white/62 shadow-[0_46px_120px_rgba(0,0,0,0.58)] backdrop-blur-xl">
                Los platos aparecerán aquí cuando haya contenido visual.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

