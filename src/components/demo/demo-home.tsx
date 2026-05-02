"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Eye,
  Info,
  MapPin,
  MoreHorizontal,
  MousePointerClick,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { CartIcon } from "@/components/icons/cart-icon";
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

function getPostModalHref(item: HomeShowcaseItem) {
  return `/platos?post=${encodeURIComponent(item.id)}`;
}

function shouldIgnorePostNavigation(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("a, button, input, textarea, select, [role='button']"))
  );
}

const HERO_BURST_LAYERS = [
  {
    src: "/home/hero/croquetas_hover_burst_transparent.png",
    className: "absolute hidden md:block",
    height: 560,
    style: {
      right: -150,
      top: -170,
    },
    width: 560,
    initialTransform: "translate3d(-86px, 112px, 0) scale(0.48) rotate(-10deg)",
    hoverTransform: "translate3d(0, 0, 0) scale(1) rotate(12deg)",
    hoverOpacity: 1,
    delay: 0,
  },
  {
    src: "/home/hero/jamon_iberico_hover_burst_transparent.png",
    className: "absolute hidden md:block",
    height: 340,
    style: {
      left: -145,
      top: 88,
    },
    width: 340,
    initialTransform: "translate3d(88px, 18px, 0) scale(0.48) rotate(-6deg)",
    hoverTransform: "translate3d(0, 0, 0) scale(1) rotate(15deg)",
    hoverOpacity: 0.96,
    delay: 110,
  },
  {
    src: "/home/hero/boletus_hover_burst_transparent.png",
    className: "absolute hidden md:block",
    height: 300,
    style: {
      bottom: -92,
      right: -142,
    },
    width: 300,
    initialTransform: "translate3d(-76px, -86px, 0) scale(0.48) rotate(8deg)",
    hoverTransform: "translate3d(0, 0, 0) scale(1) rotate(-18deg)",
    hoverOpacity: 0.94,
    delay: 190,
  },
];

const HERO_MOBILE_BURST_LAYERS = [
  {
    src: "/home/hero/croquetas_hover_burst_transparent.png",
    className: "absolute -right-14 -top-10 z-[2] h-56 w-56 rotate-[10deg] opacity-80",
  },
  {
    src: "/home/hero/jamon_iberico_hover_burst_transparent.png",
    className: "absolute -left-12 bottom-12 z-[2] h-36 w-36 rotate-[-14deg] opacity-62",
  },
];

const FEATURED_HOME_ZONE = {
  name: "Talavera de la Reina",
  subtitle: "Zona destacada",
  imageAlt: "Platos para recoger en Talavera de la Reina",
  avatarSrc:
    "https://tse3.mm.bing.net/th/id/OIP.a2oALG8ItEFAkuxZUKyfqgAAAA?pid=ImgDet&w=184&h=123&c=7&o=7&rm=3",
  posterSrc: "/home/zonas/talavera-poster.webp",
  videoSrc: "https://cdn.pixabay.com/video/2026/05/01/349917.mov",
  cta: "Ver zona",
  href: "/zonas/talavera-de-la-reina",
  stats: ["+12 locales", "Platos reales", "Recogida local"],
};

export function DemoHome({
  featuredItems,
  latestItems,
  template,
}: DemoHomeProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<StoredCity | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPromptExpanded, setLocationPromptExpanded] = useState(false);
  const [locationAccepted, setLocationAccepted] = useState(false);
  const [isHeroBurstActive, setIsHeroBurstActive] = useState(false);
  const isZoneBurstActive = false;
  const [shouldLoadZoneVideo, setShouldLoadZoneVideo] = useState(false);
  const zoneVideoRef = useRef<HTMLVideoElement | null>(null);

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
    const videoNode = zoneVideoRef.current;

    if (!videoNode || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadZoneVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(videoNode);

    return () => {
      observer.disconnect();
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
  const previewItems = useMemo(
    () =>
      [...featuredItems, ...latestItems]
        .filter((item, index, items) => {
          return (
            Boolean(item.imageUrl) &&
            items.findIndex((candidate) => candidate.id === item.id) === index
          );
        })
        .slice(0, 8),
    [featuredItems, latestItems],
  );
  const heroPostItem = useMemo(
    () =>
      previewItems.find((item) => {
      const venueName = item.venue.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const venueSlug = item.venue.slug.toLowerCase();

      return (
        venueName.includes("la comida de los dados") ||
        venueSlug.includes("comida-de-los-dados")
      );
      }) ?? previewItems[0] ?? null,
    [previewItems],
  );
  const dishMarqueeItems = useMemo(() => previewItems.slice(0, 6), [previewItems]);
  const venueMarqueeItems = useMemo(
    () =>
      previewItems
        .filter((item, index, items) => {
          return (
            Boolean(item.venue.coverUrl) &&
            items.findIndex((candidate) => candidate.venue.id === item.venue.id) ===
              index
          );
        })
        .slice(0, 6),
    [previewItems],
  );
  const dishWallColumns = useMemo(() => {
    const getShiftedDishItems = (offset: number) => {
      if (!dishMarqueeItems.length) {
        return [];
      }

      const normalizedOffset = offset % dishMarqueeItems.length;
      return [
        ...dishMarqueeItems.slice(normalizedOffset),
        ...dishMarqueeItems.slice(0, normalizedOffset),
      ];
    };

    const getShiftedVenueItems = (offset: number) => {
      if (!venueMarqueeItems.length) {
        return [];
      }

      const normalizedOffset = offset % venueMarqueeItems.length;
      return [
        ...venueMarqueeItems.slice(normalizedOffset),
        ...venueMarqueeItems.slice(0, normalizedOffset),
      ];
    };

    return [
      {
        id: "dishes",
        type: "dish",
        label: "Platos",
        items: [...getShiftedDishItems(0), ...getShiftedDishItems(0)],
        marqueeClass: "home-dish-marquee-up",
        duration: "38s",
        shellClass: "translate-y-8 scale-[0.94] opacity-[0.78]",
        itemClass: "h-44 w-full sm:h-56 lg:h-64",
        offsetClass: "translate-x-2",
      },
      {
        id: "venues",
        type: "venue",
        label: "Locales",
        items: [...getShiftedVenueItems(0), ...getShiftedVenueItems(0)],
        marqueeClass: "home-dish-marquee-down",
        duration: "34s",
        shellClass: "-translate-y-4 scale-100 opacity-100",
        itemClass: "h-48 w-full sm:h-64 lg:h-72",
        offsetClass: "-translate-x-1",
      },
    ];
  }, [dishMarqueeItems, venueMarqueeItems]);
  return (
    <main
      data-demo-home-root
      className="zylen-visual-skin relative min-h-[100svh] overflow-x-hidden text-white md:cursor-none"
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

        @keyframes homeHeroDeckFront {
          0% {
            opacity: 0;
            transform: translate3d(22px, -12px, 0) rotate(3deg) scale(0.965);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
        }

        @keyframes homeHeroDeckScene {
          0%,
          100% {
            transform: translate3d(0, -4px, 0) rotate(-0.35deg);
          }
          50% {
            transform: translate3d(0, 6px, 0) rotate(0.35deg);
          }
        }

        @keyframes homeRailDrift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-1.5rem, 0, 0);
          }
        }

        @keyframes homeRailDriftReverse {
          0%,
          100% {
            transform: translate3d(-1.25rem, 0, 0);
          }
          50% {
            transform: translate3d(0.75rem, 0, 0);
          }
        }

        @keyframes homeDishMarqueeUp {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -50%, 0);
          }
        }

        @keyframes homeDishMarqueeDown {
          0% {
            transform: translate3d(0, -50%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .home-dish-marquee-up {
          animation: homeDishMarqueeUp 34s linear infinite;
        }

        .home-dish-marquee-down {
          animation: homeDishMarqueeDown 40s linear infinite;
        }

        .home-dish-marquee-stage:hover .home-dish-marquee-up,
        .home-dish-marquee-stage:hover .home-dish-marquee-down {
          animation-play-state: paused;
        }

        @keyframes homeSoftPulse {
          0%,
          100% {
            opacity: 0.62;
            transform: scale(1);
          }
          50% {
            opacity: 0.92;
            transform: scale(1.04);
          }
        }

        @keyframes homeRouteFlow {
          0%,
          100% {
            opacity: 0.45;
            transform: translate3d(-0.35rem, 0, 0);
          }
          50% {
            opacity: 0.86;
            transform: translate3d(0.35rem, 0, 0);
          }
        }

        @keyframes localFoodAssetFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(-6deg) scale(1);
          }
          50% {
            transform: translate3d(0.35rem, -0.65rem, 0) rotate(-3deg) scale(1.045);
          }
        }

        @keyframes localFoodAssetFloatAlt {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(8deg) scale(1);
          }
          50% {
            transform: translate3d(-0.45rem, 0.55rem, 0) rotate(5deg) scale(1.04);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-hero-card-float {
            animation: none !important;
          }
          .home-hero-deck-scene {
            animation: none !important;
          }
          .home-rail-drift {
            animation: none !important;
          }
          .home-rail-drift-reverse,
          .home-dish-marquee-up,
          .home-dish-marquee-down,
          .home-soft-pulse,
          .home-route-flow,
          .local-food-asset {
            animation: none !important;
            transform: none !important;
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
        className={`fixed inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          showLoader ? "scale-[1.025] opacity-0" : "scale-100 opacity-100"
        } motion-reduce:transition-none`}
      >
        <div className="brand-particle-field" />
        <div className="brand-ambient-orb brand-ambient-orb--green left-[-12vw] top-[12vh] h-[36vh] w-[42vw]" />
        <div className="brand-ambient-orb brand-ambient-orb--amber right-[-14vw] top-[10vh] h-[38vh] w-[44vw]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(3,4,4,0.16)_46%,rgba(3,4,4,0.72)_100%)]" />
      </div>

      <div
        className={`relative z-10 flex min-h-[100svh] items-start justify-center overflow-visible px-4 pb-10 pt-5 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 sm:py-8 lg:items-center ${
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
                            className="rounded-full bg-[#11D470] px-3 py-1 text-[10px] font-semibold tracking-[0.04em] text-[#062113] transition hover:bg-[#0fc567]"
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
                              className="rounded-full bg-[#11D470] px-3 py-1 text-[10px] font-semibold tracking-[0.04em] text-[#062113] transition hover:bg-[#0fc567]"
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
              className="inline-flex items-center justify-center rounded-full bg-[#11D470] px-6 py-3.5 text-sm font-semibold text-[#062113] shadow-[0_20px_54px_rgba(17,212,112,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0fc567] md:cursor-none"
            >
              Ver platos
            </Link>
            <Link
              href={getZonesHref(selectedCity)}
              className="inline-flex items-center justify-center rounded-full border border-[#7cffb8]/24 bg-black/20 px-5 py-3.5 text-sm font-semibold text-[#dfffee] transition hover:-translate-y-0.5 hover:bg-[#168453]/18 md:cursor-none"
            >
              Explorar zonas
            </Link>
          </div>
          </div>

          <div className="relative mx-auto mt-8 flex w-full max-w-[20.5rem] items-center justify-center self-center overflow-visible px-2 pb-8 pt-5 sm:max-w-[22rem] lg:mx-auto lg:mt-0 lg:max-w-[24rem] lg:-translate-x-4 lg:px-0 lg:pb-0 lg:pt-0">
            <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.14),rgba(22,132,83,0.1)_38%,transparent_70%)] blur-3xl sm:h-[30rem] sm:w-[30rem]" />
            {heroPostItem ? (
              <div
                className="home-hero-deck-scene group relative isolate w-full transform-gpu overflow-visible motion-safe:animate-[homeHeroDeckScene_9s_ease-in-out_infinite]"
                onMouseEnter={() => setIsHeroBurstActive(true)}
                onMouseLeave={() => setIsHeroBurstActive(false)}
              >
                <div
                  aria-hidden="true"
                  className="absolute -inset-x-8 -inset-y-6 -z-20 rounded-[3rem] bg-[radial-gradient(circle_at_50%_42%,rgba(124,255,184,0.16),rgba(22,132,83,0.08)_38%,transparent_72%)] blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-7 left-1/2 -z-10 h-10 w-[76%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(0,0,0,0.42),rgba(0,0,0,0.18)_46%,transparent_72%)] blur-xl"
                />
                {HERO_MOBILE_BURST_LAYERS.map((layer) => (
                  <Image
                    key={`mobile-${layer.src}`}
                    src={layer.src}
                    alt=""
                    aria-hidden="true"
                    width={224}
                    height={224}
                    className={`pointer-events-none object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.32)] sm:hidden motion-reduce:hidden ${layer.className}`}
                  />
                ))}
                {HERO_BURST_LAYERS.map((layer) => (
                  <Image
                    key={layer.src}
                    src={layer.src}
                    alt=""
                    aria-hidden="true"
                    width={layer.width}
                    height={layer.height}
                    className={`pointer-events-none z-0 origin-center object-contain blur-[0.1px] drop-shadow-[0_28px_62px_rgba(0,0,0,0.36)] transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden motion-reduce:transition-none ${layer.className}`}
                    style={{
                      opacity: isHeroBurstActive ? layer.hoverOpacity : 0,
                      transitionDelay: `${layer.delay}ms`,
                      transform: isHeroBurstActive
                        ? layer.hoverTransform
                        : layer.initialTransform,
                      ...layer.style,
                    }}
                  />
                ))}
                <article
                  key={heroPostItem.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Ver ficha de ${heroPostItem.name}`}
                  onClick={(event) => {
                    if (shouldIgnorePostNavigation(event.target)) {
                      return;
                    }

                    router.push(getPostModalHref(heroPostItem));
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                      return;
                    }

                    if (shouldIgnorePostNavigation(event.target)) {
                      return;
                    }

                    event.preventDefault();
                    router.push(getPostModalHref(heroPostItem));
                  }}
                  className="home-hero-card-float relative z-10 flex w-full cursor-pointer flex-col overflow-hidden rounded-[1.85rem] bg-[#f8f7f3] text-[#111111] shadow-[0_36px_86px_rgba(0,0,0,0.52),0_0_70px_rgba(22,132,83,0.16)] transition duration-500 hover:scale-[1.04] md:cursor-none lg:max-h-[min(82svh,40rem)] motion-safe:animate-[homeHeroCardFloat_8s_ease-in-out_infinite]"
                >
                  <header className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <Link
                      href={getPostModalHref(heroPostItem)}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-sm font-semibold text-white">
                        {heroPostItem.venue.logoUrl ? (
                          <Image
                            src={heroPostItem.venue.logoUrl}
                            alt={heroPostItem.venue.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          heroPostItem.venue.name.trim().slice(0, 1).toUpperCase()
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold leading-4">
                          {heroPostItem.venue.name}
                        </span>
                        <span className="block truncate text-xs leading-4 text-[#6f6f6f]">
                          {heroPostItem.venue.cityName}
                        </span>
                      </span>
                    </Link>
                    <Link
                      href={getPostModalHref(heroPostItem)}
                      aria-label="Ver local"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Link>
                  </header>

                <Link href={getPostModalHref(heroPostItem)} className="block shrink-0">
                  <div className="relative h-[28svh] min-h-[11.5rem] max-h-[16.5rem] overflow-hidden bg-[#141414] sm:h-[40svh] sm:min-h-[13.5rem] sm:max-h-[23rem]">
                  <Image
                    src={heroPostItem.imageUrl ?? ""}
                    alt={heroPostItem.name}
                    fill
                    sizes="(max-width: 640px) 22rem, 25rem"
                    className="object-cover object-center transition duration-700 hover:scale-[1.025] motion-safe:animate-[homeHeroDeckFront_520ms_ease-out]"
                    priority
                  />
                  </div>
                </Link>

                <section className="shrink-0 bg-[#f8f7f3] px-3.5 pb-3.5 pt-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={getPostModalHref(heroPostItem)}
                        aria-label="Ver detalle del plato"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                      >
                        <Info className="h-5 w-5" />
                      </Link>
                      <Link
                        href={getPostModalHref(heroPostItem)}
                        aria-label="Compartir plato"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                      >
                        <Send className="h-5 w-5" />
                      </Link>
                    </div>
                    <Link
                      href={getPostModalHref(heroPostItem)}
                      aria-label="Añadir para recoger"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#11D470] text-[#062113] shadow-[0_14px_30px_rgba(17,212,112,0.34)] transition hover:bg-[#0fc567]"
                    >
                      <CartIcon size={20} aria-hidden />
                    </Link>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 min-w-0 text-lg font-semibold leading-5 tracking-[-0.04em] text-[#111111] sm:text-xl sm:leading-6">
                        {heroPostItem.name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-[#11D470] px-3 py-1.5 text-sm font-bold text-[#062113]">
                        {formatHomePrice(heroPostItem)}
                      </span>
                    </div>
                    {heroPostItem.description ? (
                      <p className="line-clamp-2 text-sm leading-5 text-[#5f5f5f]">
                        {heroPostItem.description}
                      </p>
                    ) : null}
                    <span className="inline-flex rounded-full bg-[#111111]/[0.06] px-3 py-1.5 text-xs font-medium text-[#4a4a4a]">
                      {heroPostItem.pickupEtaMin
                        ? `Listo en ${heroPostItem.pickupEtaMin} min`
                        : "Listo para recoger"}
                    </span>
                  </div>
                </section>
              </article>
              </div>
            ) : (
              <div className="relative flex aspect-[4/5] items-center justify-center rounded-[2.15rem] border border-white/14 bg-white/[0.075] px-8 text-center text-sm text-white/62 shadow-[0_46px_120px_rgba(0,0,0,0.58)] backdrop-blur-xl">
                Los platos aparecerán aquí cuando haya contenido visual.
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="relative z-10 overflow-hidden px-4 py-16 sm:px-8 lg:py-24">
        <div className="pointer-events-none absolute left-[-18vw] top-8 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.14),transparent_68%)] blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-[-12vw] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(22,132,83,0.12),transparent_70%)] blur-2xl" />
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7cffb8]">
                Platos reales
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.9] tracking-[-0.07em] text-white sm:text-6xl">
                Platos grandes, reales y listos para decidir.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/66">
                Ves la comida antes de perderte en una carta. Si entra por los ojos, entras al plato.
              </p>
            </div>
            <Link
              href="/platos"
              className="inline-flex w-fit rounded-full bg-[#11D470] px-5 py-3 text-sm font-semibold text-[#062113] shadow-[0_18px_46px_rgba(17,212,112,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0fc567]"
            >
              Explorar platos
            </Link>
          </div>

          <div className="group/preview relative mt-10 overflow-visible rounded-[2.35rem] bg-[linear-gradient(145deg,rgba(82,78,66,0.72),rgba(15,16,13,0.94))] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.34),0_0_70px_rgba(22,132,83,0.18)] sm:rounded-[2.8rem] sm:p-8 lg:p-10">
            <div className="absolute inset-0 rounded-[inherit] bg-[url('https://images.unsplash.com/photo-1584384689201-e0bcbe2c7f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-58" />
            <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(4,8,7,0.18),rgba(4,8,7,0.54)_62%,rgba(4,8,7,0.74)),radial-gradient(circle_at_22%_12%,rgba(124,255,184,0.18),transparent_34%)]" />
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex rounded-full border border-white/76 bg-black/28 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#9dffc7] backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-xs">
                Mira primero
              </span>
              <h3 className="mt-6 max-w-2xl text-4xl font-semibold leading-[0.94] tracking-[-0.07em] text-white sm:text-6xl">
                Una galería que abre el apetito antes de elegir.
              </h3>
              <span className="mt-6 inline-flex rounded-full border border-white/72 bg-black/34 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_46px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:px-5 sm:text-base">
                Platos reales de locales cercanos
              </span>
            </div>

            <div className="relative z-10 mt-10 min-h-[20rem] overflow-visible sm:min-h-[27rem] lg:min-h-[31rem]">
              <Image
                src="/home/assets/asset_tacos_transparent.png"
                alt="Tacos reales de locales cercanos"
                width={360}
                height={360}
                loading="lazy"
                className="absolute left-[-1%] top-[8%] h-36 w-36 object-contain drop-shadow-[0_28px_54px_rgba(0,0,0,0.32)] transition duration-700 group-hover/preview:-translate-y-2 group-hover/preview:rotate-[-3deg] sm:left-[5%] sm:h-56 sm:w-56 lg:h-72 lg:w-72"
              />
              <Image
                src="/home/assets/asset_jamon_iberico_transparent.png"
                alt="Jamón ibérico real de local cercano"
                width={520}
                height={520}
                loading="lazy"
                className="absolute left-1/2 top-[8%] h-60 w-60 -translate-x-1/2 object-contain drop-shadow-[0_34px_64px_rgba(0,0,0,0.36)] transition duration-700 group-hover/preview:-translate-y-3 group-hover/preview:scale-[1.03] sm:top-[5%] sm:h-[24rem] sm:w-[24rem] lg:h-[32rem] lg:w-[32rem]"
              />
              <Image
                src="/home/assets/asset_burger_transparent.png"
                alt="Hamburguesa real de local cercano"
                width={390}
                height={390}
                loading="lazy"
                className="absolute right-[-2%] top-[8%] h-40 w-40 object-contain drop-shadow-[0_28px_58px_rgba(0,0,0,0.34)] transition duration-700 group-hover/preview:-translate-y-2 group-hover/preview:rotate-[3deg] sm:right-[4%] sm:h-60 sm:w-60 lg:h-80 lg:w-80"
              />
              <Image
                src="/home/assets/asset_albondigas_transparent.png"
                alt="Albóndigas reales de local cercano"
                width={360}
                height={360}
                loading="lazy"
                className="absolute bottom-[0%] right-[2%] h-36 w-36 object-contain drop-shadow-[0_26px_54px_rgba(0,0,0,0.36)] transition duration-700 group-hover/preview:translate-y-[-0.35rem] group-hover/preview:rotate-[-4deg] sm:right-[13%] sm:h-56 sm:w-56 lg:h-72 lg:w-72"
              />
              <Image
                src="/home/assets/asset_bocadillo_calamares_transparent.png"
                alt="Bocadillo de calamares real de local cercano"
                width={360}
                height={360}
                loading="lazy"
                className="absolute bottom-[10%] left-[-1%] h-36 w-36 object-contain drop-shadow-[0_26px_54px_rgba(0,0,0,0.34)] transition duration-700 group-hover/preview:-translate-y-2 group-hover/preview:rotate-[3deg] sm:bottom-[14%] sm:left-[2%] sm:h-60 sm:w-60 lg:h-80 lg:w-80"
              />
              <Image
                src="/home/assets/asset_sushi_transparent.png"
                alt="Sushi real de local cercano"
                width={320}
                height={320}
                loading="lazy"
                className="absolute bottom-[30%] right-[2%] hidden h-28 w-28 object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.32)] transition duration-700 group-hover/preview:-translate-y-1.5 group-hover/preview:rotate-[-3deg] sm:block sm:h-48 sm:w-48 lg:h-64 lg:w-64"
              />
            </div>
          </div>

          <div className="home-dish-marquee-stage relative mt-10 overflow-hidden py-8 sm:py-10">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(124,255,184,0.12),rgba(22,132,83,0.06)_42%,transparent_72%)] blur-2xl" />

            {dishMarqueeItems.length ? (
              <div
                className="relative z-10 mx-auto h-[30rem] max-w-5xl overflow-hidden sm:h-[36rem] lg:h-[42rem]"
                style={{
                  perspective: "1500px",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                }}
              >
                <div
                  className="grid h-full origin-center transform-gpu grid-cols-2 gap-3 px-2 sm:gap-4 lg:gap-5"
                  style={{
                    transform:
                      "translate3d(0, 0, 0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {dishWallColumns.slice(0, 2).map((column) => (
                    <div
                      key={column.id}
                      className={`min-h-0 transform-gpu ${column.shellClass}`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7cffb8]/80">
                        {column.label}
                      </div>
                      <div
                        className={`${column.marqueeClass} flex flex-col gap-3 will-change-transform sm:gap-4`}
                        style={{ animationDuration: column.duration }}
                      >
                        {column.items.map((item, index) => (
                          <Link
                            key={`dish-wall-${column.id}-${item.id}-${index}`}
                            href={
                              column.type === "venue"
                                ? `/zonas/${item.venue.citySlug}/venues/${item.venue.slug}`
                                : getPreviewItemHref(item)
                            }
                            className={`group relative block shrink-0 overflow-hidden rounded-[1.15rem] border border-white/12 bg-white/[0.08] shadow-[0_18px_54px_rgba(0,0,0,0.32)] transition duration-500 hover:-translate-y-1 hover:scale-[1.025] hover:border-[#7cffb8]/26 hover:shadow-[0_26px_78px_rgba(22,132,83,0.22)] motion-reduce:transition-none ${
                              column.itemClass
                            } ${index % 3 === 1 ? column.offsetClass : ""}`}
                          >
                            {(column.type === "venue"
                              ? item.venue.coverUrl
                              : item.imageUrl) ? (
                              <Image
                                src={
                                  column.type === "venue"
                                    ? item.venue.coverUrl!
                                    : item.imageUrl ?? ""
                                }
                                alt={
                                  column.type === "venue"
                                    ? item.venue.name
                                    : item.name
                                }
                                fill
                                loading="lazy"
                                quality={55}
                                sizes="(max-width: 640px) 9rem, 11rem"
                                className={`transition duration-700 group-hover:scale-105 motion-reduce:transition-none ${
                                  column.type === "venue"
                                    ? "object-cover"
                                    : "object-cover"
                                }`}
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/24 to-transparent" />
                            {column.type === "venue" ? (
                              <div className="absolute inset-x-0 bottom-0 p-3">
                                <span className="mb-2 inline-flex rounded-full bg-[#11D470] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#062113]">
                                  Local
                                </span>
                                <p className="line-clamp-1 text-xs font-semibold text-white sm:text-sm">
                                  {item.venue.name}
                                </p>
                                <p className="mt-1 line-clamp-1 text-[10px] text-white/64 sm:text-xs">
                                  {item.venue.cityName}
                                </p>
                              </div>
                            ) : (
                              <div className="absolute inset-x-0 bottom-0 p-3">
                                <p className="line-clamp-1 text-xs font-semibold text-white sm:text-sm">
                                  {item.name}
                                </p>
                                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] sm:text-xs">
                                  <span className="line-clamp-1 min-w-0 text-white/64">
                                    {item.venue.name}
                                  </span>
                                  <span className="shrink-0 font-semibold text-[#7cffb8]">
                                    {formatHomePrice(item)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative z-10 mx-auto flex min-h-72 max-w-lg items-center justify-center px-8 text-center text-sm text-white/62">
                Los platos aparecerán aquí cuando haya contenido visual.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 [contain-intrinsic-size:760px] [content-visibility:auto] sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-[22.5rem] overflow-visible lg:mx-0">
              <div className="absolute left-1/2 top-1/2 h-[31rem] w-[31rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.24),rgba(22,132,83,0.18)_34%,rgba(22,132,83,0.08)_52%,transparent_72%)] blur-3xl" />
              <div className="group relative isolate w-full transform-gpu overflow-visible">
                <div
                  aria-hidden="true"
                  className="absolute -inset-x-10 -inset-y-8 -z-20 rounded-[3rem] bg-[radial-gradient(circle_at_50%_42%,rgba(124,255,184,0.28),rgba(22,132,83,0.16)_38%,rgba(22,132,83,0.06)_58%,transparent_74%)] blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-7 left-1/2 -z-10 h-10 w-[76%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(0,0,0,0.42),rgba(0,0,0,0.18)_46%,transparent_72%)] blur-xl"
                />
                {HERO_MOBILE_BURST_LAYERS.map((layer) => (
                  <Image
                    key={`zone-mobile-${layer.src}`}
                    src={layer.src}
                    alt=""
                    aria-hidden="true"
                    width={224}
                    height={224}
                    className={`pointer-events-none object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.32)] sm:hidden motion-reduce:hidden ${layer.className}`}
                  />
                ))}
                {HERO_BURST_LAYERS.map((layer) => (
                  <Image
                    key={`zone-${layer.src}`}
                    src={layer.src}
                    alt=""
                    aria-hidden="true"
                    width={layer.width}
                    height={layer.height}
                    className={`pointer-events-none z-0 origin-center object-contain blur-[0.1px] drop-shadow-[0_28px_62px_rgba(0,0,0,0.36)] transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden motion-reduce:transition-none ${layer.className}`}
                    style={{
                      opacity: isZoneBurstActive ? layer.hoverOpacity : 0,
                      transitionDelay: `${layer.delay}ms`,
                      transform: isZoneBurstActive
                        ? layer.hoverTransform
                        : layer.initialTransform,
                      ...layer.style,
                    }}
                  />
                ))}
                <article className="relative z-10 flex w-full flex-col overflow-hidden rounded-[1.85rem] bg-[#f8f7f3] text-[#111111] shadow-[0_36px_86px_rgba(0,0,0,0.52),0_0_70px_rgba(22,132,83,0.14)]">
                <header className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <Link
                    href={FEATURED_HOME_ZONE.href}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-sm font-semibold text-white">
                      <img
                        src={FEATURED_HOME_ZONE.avatarSrc}
                        alt={FEATURED_HOME_ZONE.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold leading-4">
                        {FEATURED_HOME_ZONE.name}
                      </span>
                      <span className="block truncate text-xs leading-4 text-[#6f6f6f]">
                        {FEATURED_HOME_ZONE.subtitle}
                      </span>
                    </span>
                  </Link>
                  <Link
                    href={FEATURED_HOME_ZONE.href}
                    aria-label="Ver zona"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Link>
                </header>

                <Link href={FEATURED_HOME_ZONE.href} className="block shrink-0">
                  <div className="relative aspect-square overflow-hidden bg-[#141414]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(124,255,184,0.32),rgba(22,132,83,0.18)_42%,rgba(7,14,10,1)_100%)]" />
                    <Image
                      src={FEATURED_HOME_ZONE.posterSrc}
                      alt={FEATURED_HOME_ZONE.imageAlt}
                      fill
                      sizes="(max-width: 640px) 22rem, 25rem"
                      className={`object-cover object-center transition duration-500 ${
                        shouldLoadZoneVideo ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    <video
                      ref={zoneVideoRef}
                      aria-label={FEATURED_HOME_ZONE.imageAlt}
                      autoPlay={shouldLoadZoneVideo}
                      className={`absolute inset-0 h-full w-full object-cover object-center transition duration-700 hover:scale-[1.025] ${
                        shouldLoadZoneVideo ? "opacity-100" : "opacity-0"
                      }`}
                      loop
                      muted
                      playsInline
                      preload="none"
                    >
                      {shouldLoadZoneVideo ? (
                        <source src={FEATURED_HOME_ZONE.videoSrc} type="video/quicktime" />
                      ) : null}
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/44 via-transparent to-transparent" />
                  </div>
                </Link>

                <section className="shrink-0 bg-[#f8f7f3] px-3.5 pb-3.5 pt-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={FEATURED_HOME_ZONE.href}
                        aria-label="Ver detalle de la zona"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                      >
                        <Info className="h-5 w-5" />
                      </Link>
                      <Link
                        href={FEATURED_HOME_ZONE.href}
                        aria-label="Compartir zona"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                      >
                        <Send className="h-5 w-5" />
                      </Link>
                    </div>
                    <Link
                      href={FEATURED_HOME_ZONE.href}
                      aria-label="Ver zona en Talavera de la Reina"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:bg-black"
                    >
                      <MapPin className="h-5 w-5" />
                    </Link>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 min-w-0 text-lg font-semibold leading-5 tracking-[-0.04em] text-[#111111] sm:text-xl sm:leading-6">
                        {FEATURED_HOME_ZONE.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-[#11D470] px-3 py-1.5 text-sm font-bold text-[#062113]">
                        {FEATURED_HOME_ZONE.cta}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-5 text-[#5f5f5f]">
                      Locales cercanos, platos claros y recogida local sin dar vueltas.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FEATURED_HOME_ZONE.stats.map((stat) => (
                        <span
                          key={stat}
                          className="inline-flex rounded-full bg-[#111111]/[0.06] px-3 py-1.5 text-xs font-medium text-[#4a4a4a]"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              </article>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7cffb8]">
              Zonas
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.9] tracking-[-0.07em] text-white sm:text-6xl">
              El mapa empieza por lo que te apetece.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
              Descubre locales por zona, compara platos de un vistazo y entra donde tenga sentido recoger.
            </p>
            <Link
              href={getZonesHref(selectedCity)}
              className="mt-7 inline-flex rounded-full border border-[#11D470]/32 bg-[#11D470]/14 px-5 py-3 text-sm font-semibold text-[#dfffee] transition hover:-translate-y-0.5 hover:bg-[#11D470]/22"
            >
              Ver zonas
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 [contain-intrinsic-size:680px] [content-visibility:auto] sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7cffb8]">
                Recogida
              </p>
              <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.9] tracking-[-0.07em] text-white sm:text-6xl">
                Del antojo al local en tres gestos.
              </h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-white/64">
              No hay menús infinitos. El flujo está pensado para mirar, decidir y recoger.
            </p>
          </div>
          <div className="group/route relative mt-12 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(124,255,184,0.13),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-5 shadow-[0_34px_100px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.14),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(22,132,83,0.16),transparent_70%)] blur-3xl" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:44px_44px]" />

            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-[6.5rem] hidden h-40 w-[calc(100%-4rem)] lg:block"
              viewBox="0 0 920 190"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pickup-route-main" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(124,255,184,0.04)" />
                  <stop offset="45%" stopColor="rgba(124,255,184,0.62)" />
                  <stop offset="100%" stopColor="rgba(124,255,184,0.12)" />
                </linearGradient>
              </defs>
              <path
                d="M40 120 C150 14 252 24 352 102 C460 186 554 176 650 88 C748 0 836 36 884 112"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeLinecap="round"
                strokeWidth="18"
              />
              <path
                className="home-route-flow motion-safe:animate-[homeRouteFlow_8s_ease-in-out_infinite]"
                d="M40 120 C150 14 252 24 352 102 C460 186 554 176 650 88 C748 0 836 36 884 112"
                fill="none"
                stroke="url(#pickup-route-main)"
                strokeDasharray="10 16"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>

            <div className="relative grid gap-5 lg:grid-cols-3 lg:gap-7">
              {[
                {
                  label: "Primer vistazo",
                  title: "Mira",
                  text: "Descubre platos reales de un vistazo.",
                  Icon: Eye,
                  lift: "lg:mt-10",
                  backgroundImage:
                    "https://images.unsplash.com/photo-1507766751782-a03b87a9de8d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
                {
                  label: "Decisión",
                  title: "Elige",
                  text: "Decide rápido lo que te apetece sin dar vueltas.",
                  Icon: MousePointerClick,
                  lift: "lg:mt-0",
                  backgroundImage:
                    "https://images.unsplash.com/photo-1768245342484-35667bcd7922?q=80&w=1309&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
                {
                  label: "Recogida",
                  title: "Recoge",
                  text: "Ve al local y recógelo sin complicaciones.",
                  Icon: CartIcon,
                  lift: "lg:mt-12",
                  backgroundImage:
                    "https://images.unsplash.com/photo-1594225123631-2a4f14bd75fe?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
              ].map(({ label, title, text, Icon, lift, backgroundImage }) => (
                <div
                  key={title}
                  className={`group/step relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07100d]/72 bg-cover bg-center p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-[#7cffb8]/30 hover:shadow-[0_28px_90px_rgba(22,132,83,0.18)] motion-reduce:transition-none ${lift}`}
                  style={
                    backgroundImage
                      ? {
                          backgroundImage: `linear-gradient(180deg, rgba(4, 8, 7, 0.34), rgba(4, 8, 7, 0.78)), url("${backgroundImage}")`,
                        }
                      : undefined
                  }
                >
                  {backgroundImage ? (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_12%,rgba(124,255,184,0.22),transparent_42%),linear-gradient(90deg,rgba(4,8,7,0.34),rgba(4,8,7,0.08)_45%,rgba(4,8,7,0.42))]" />
                  ) : null}
                  <div className="absolute -inset-2 rounded-[2.25rem] bg-[radial-gradient(circle_at_50%_0%,rgba(124,255,184,0.16),transparent_62%)] opacity-0 blur-xl transition duration-500 group-hover/step:opacity-100" />
                  <div className="relative">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-[#7cffb8]/28 bg-[#168453]/16 text-[#7cffb8] shadow-[0_0_42px_rgba(22,132,83,0.26)] transition duration-500 group-hover/step:scale-110 group-hover/step:bg-[#168453]/24 motion-reduce:transition-none">
                        <Icon className="h-6 w-6" strokeWidth={2.1} />
                      </div>
                      <div className="h-2 w-2 rounded-full bg-[#7cffb8] shadow-[0_0_22px_rgba(124,255,184,0.8)]" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/38">
                      {label}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">
                      {title}
                    </h3>
                    <p className="mt-3 max-w-xs text-base leading-7 text-white/64">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden px-4 py-16 [contain-intrinsic-size:760px] [content-visibility:auto] sm:px-8 lg:py-24">
        <div className="pointer-events-none absolute left-[-14vw] top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.12),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-[-14vw] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(22,132,83,0.15),transparent_72%)] blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="group/local relative overflow-visible">
            <div className="absolute -inset-5 rounded-[3rem] bg-[radial-gradient(circle_at_50%_44%,rgba(124,255,184,0.15),rgba(22,132,83,0.08)_42%,transparent_72%)] blur-2xl transition duration-500 group-hover/local:opacity-100" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.035))] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.32)] backdrop-blur-md sm:p-7 lg:p-8">
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute right-[-4rem] top-[-4rem] h-56 w-56 rounded-full bg-[#168453]/18 blur-3xl" />

              <div className="relative grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                <div>
                  <div className="inline-flex rounded-full border border-[#7cffb8]/24 bg-black/24 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7cffb8] backdrop-blur-md">
                    Para locales
                  </div>
                  <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.92] tracking-[-0.07em] text-white sm:text-6xl">
                    Que tu local entre por los ojos.
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-7 text-white/66">
                    Convierte tus platos en una carta visual fácil de elegir, pensada para que la gente descubra y recoja sin complicaciones.
                  </p>
                  <Link
                    href="/unete"
                    className="mt-7 inline-flex rounded-full bg-[#11D470] px-5 py-3 text-sm font-semibold text-[#062113] shadow-[0_18px_46px_rgba(17,212,112,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0fc567]"
                  >
                    Quiero que mi local está aquí
                  </Link>
                </div>

                <div className="relative min-h-[23rem]">
                  <div className="absolute inset-0 rounded-[2.3rem] border border-white/10 bg-[radial-gradient(circle_at_48%_45%,rgba(124,255,184,0.14),rgba(255,255,255,0.045)_42%,rgba(0,0,0,0.12)_100%)] shadow-[inset_0_20px_70px_rgba(255,255,255,0.04),0_26px_80px_rgba(0,0,0,0.22)]" />
                  <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.2),transparent_68%)] blur-3xl" />

                  <div className="absolute inset-0 z-10 overflow-visible">
                    <Image
                      src="/home/assets/asset_pizza_transparent.png"
                      alt="Pizza destacada para locales"
                      width={420}
                      height={420}
                      className="local-food-asset absolute -right-14 top-0 h-72 w-72 object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.38)] motion-safe:animate-[localFoodAssetFloat_9s_ease-in-out_infinite] sm:h-80 sm:w-80"
                    />
                    <Image
                      src="/home/assets/asset_burger_transparent.png"
                      alt="Hamburguesa destacada para locales"
                      width={380}
                      height={380}
                      className="local-food-asset absolute -left-12 -top-8 h-48 w-48 object-contain drop-shadow-[0_28px_58px_rgba(0,0,0,0.34)] motion-safe:animate-[localFoodAssetFloatAlt_10s_ease-in-out_infinite] sm:h-56 sm:w-56"
                    />
                    <Image
                      src="/home/assets/asset_jamon_iberico_transparent.png"
                      alt="Jamón ibérico destacado para locales"
                      width={380}
                      height={380}
                      className="local-food-asset absolute -bottom-8 -left-14 h-72 w-72 object-contain drop-shadow-[0_30px_62px_rgba(0,0,0,0.36)] motion-safe:animate-[localFoodAssetFloatAlt_10s_ease-in-out_infinite] sm:h-80 sm:w-80"
                    />
                  </div>

                  <div className="relative z-20 flex min-h-[23rem] flex-col justify-between p-4 sm:p-5">
                    <div className="self-end rounded-full border border-[#7cffb8]/20 bg-black/42 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7cffb8] backdrop-blur-md">
                      Visual real
                    </div>

                    <div className="rounded-[1.45rem] border border-white/10 bg-black/48 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-md">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7cffb8]">
                            Carta visual
                          </span>
                          <span className="mt-1 block max-w-[15rem] text-sm font-semibold leading-5 text-white/86">
                            Mejor escaparate para tus platos
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-wrap gap-2 sm:max-w-[17rem] sm:justify-end">
                          {["+ visibilidad", "Recogida local", "Sin líos"].map((chip) => (
                            <span
                              key={chip}
                              className="inline-flex shrink-0 rounded-[0.9rem] border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-semibold leading-4 text-white/88 shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative space-y-4">
            <div className="absolute -left-8 top-0 bottom-0 hidden w-px bg-gradient-to-b from-[#7cffb8]/0 via-[#7cffb8]/48 to-[#7cffb8]/0 lg:block" />
            {[
              {
                Icon: TrendingUp,
                title: "Más visibilidad en tu zona",
                text: "Aparece donde la gente ya está decidiendo qué comer.",
              },
              {
                Icon: CartIcon,
                title: "Pedidos pensados para recoger",
                text: "Sin prometer delivery: claro, directo y preparado para recoger.",
              },
              {
                Icon: Sparkles,
                title: "Menos lío, más claridad",
                text: "Una experiencia visual simple para enseñar mejor lo que haces.",
              },
            ].map(({ Icon, title, text }) => (
              <div
                key={title}
                className="group/benefit relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.16)] transition duration-500 hover:-translate-y-1 hover:border-[#7cffb8]/28 hover:bg-white/[0.065] hover:shadow-[0_28px_84px_rgba(22,132,83,0.16)] motion-reduce:transition-none"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#168453]/0 blur-2xl transition duration-500 group-hover/benefit:bg-[#168453]/14" />
                <div className="relative flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] border border-[#7cffb8]/22 bg-[#168453]/12 text-[#7cffb8] transition duration-500 group-hover/benefit:scale-105 group-hover/benefit:bg-[#168453]/20 motion-reduce:transition-none">
                    <Icon className="h-5 w-5" strokeWidth={2.1} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.05em] text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-[1.5rem] border border-[#7cffb8]/16 bg-[#168453]/10 p-5 text-sm font-medium leading-6 text-[#dfffee]">
              Una herramienta pensada para enseñar mejor lo que ya haces bien, sin añadir más trabajo al día.
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 [contain-intrinsic-size:520px] [content-visibility:auto] sm:px-8 lg:py-24">
        <div
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-cover bg-center px-6 py-12 shadow-[0_34px_100px_rgba(0,0,0,0.28)] sm:px-10 sm:py-16"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(5,8,6,0.86), rgba(5,8,6,0.48) 42%, rgba(5,8,6,0.88) 100%), url('https://images.unsplash.com/photo-1561632669-7f55f7975606?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(22,132,83,0.24),rgba(255,255,255,0.03)_36%,rgba(0,0,0,0.18)_100%)]" />
          <div className="absolute right-[-10%] top-[-20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.13),transparent_70%)] blur-3xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-[#7cffb8]">
            El proyecto
          </p>
          <div className="relative mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <h2 className="max-w-4xl text-4xl font-semibold leading-[0.92] tracking-[-0.07em] text-white sm:text-6xl">
              Menos vueltas. Más comida real. Más barrio.
            </h2>
            <Link
              href="/el-proyecto"
              className="inline-flex w-fit rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white/84 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
            >
              Conocer el proyecto
            </Link>
          </div>
          <p className="relative mt-6 max-w-2xl text-base leading-7 text-white/70">
            ZylenPick nace para que elegir qué comer sea más visual, más rápido y más justo para los locales que tienes cerca.
          </p>
        </div>
      </section>

      <footer className="relative z-10 px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-white/62 sm:flex-row sm:items-center sm:justify-between">
          <p>ZylenPick: platos reales, decisión rápida y recogida en local.</p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/platos" className="transition hover:text-white">
              Platos
            </Link>
            <Link href="/zonas" className="transition hover:text-white">
              Zonas
            </Link>
            <Link href="/unete" className="transition hover:text-white">
              Únete
            </Link>
            <Link href="/el-proyecto" className="transition hover:text-white">
              El proyecto
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

