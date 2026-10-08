"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  Info,
  LocateFixed,
  MapPin,
  MapPinned,
  Phone,
  Search,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { ManualLocationPicker } from "@/components/location/manual-location-picker";
import { ProductPriceBadge } from "@/components/pricing/product-price-badge";
import { DiscoveryVenueCard } from "@/components/venues/discovery-venue-card";
import type { DiscoveryVenue, DiscoveryShot } from "@/features/discovery/discovery-content";
import { matchesIntent, productCategory, discoveryDistance, getDiscoveryJourney, type DiscoveryIntent } from "@/features/discovery/discovery-filters";
import { resolveVenueCategory } from "@/features/venues/venue-meta";
import explorerStyles from "./discovery-explorer.module.css";
import type { SiteChip } from "@/features/chips/types";
import {
  curationOptions,
  getFilteredItems,
  getStableHash,
  type CurationFilter,
} from "@/features/chips/dish-curation";
import {
  defaultSiteFunnelSettings,
  type SiteFunnelSettings,
} from "@/features/funnel/site-funnel-settings";
import {
  getDistanceInKm,
  type UserLocation,
} from "@/features/location/browser-location";
import { useNearMode } from "@/features/location/use-near-mode";
import {
  readSelectedCity,
  SELECTED_CITY_UPDATED_EVENT,
} from "@/features/location/city-preference";
import {
  getPricePresentation,
  isDefinitivePrice,
} from "@/features/pricing/price-display";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { resolveVenueCoordinates } from "@/features/venues/venue-meta";
import {
  capturePlatoVisto,
  captureShotVisto,
} from "@/lib/analytics/posthog-events";

const editorialTagFilters: CurationFilter[] = [
  "raciones",
  "tapas",
  "daniHome",
  "bocatas",
  "mojarPan",
  "veggano",
  "quienNoApolla",
  "recommended",
  "hot",
  "finallyFriday",
  "surprise",
];

function getEditorialTagLabel(filter: CurationFilter) {
  return curationOptions.find((option) => option.id === filter)?.label ?? "";
}

gsap.registerPlugin(useGSAP);

type DemoDishesCarouselProps = {
  items: HomeShowcaseItem[];
  venues?: DiscoveryVenue[];
  shots?: DiscoveryShot[];
  template?: DemoDishesTemplate;
  funnelSettings?: SiteFunnelSettings;
  chips?: SiteChip[];
  heroImageUrl?: string;
  mapboxAccessToken: string;
  locationPickerCenter: { latitude: number; longitude: number };
};

export type DemoDishesTemplate = {
  logoSrc?: string;
  logoLightSrc?: string;
  logoDarkSrc?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoClassName?: string;
  compactLogoWidth?: number;
  compactLogoHeight?: number;
  compactLogoClassName?: string;
  homeHref?: string;
  emptyEyebrow?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  backLabel?: string;
  backCompactLabel?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  searchLabel?: string;
  searchInputId?: string;
  searchPlaceholder?: string;
  noResultsEyebrow?: string;
  noResultsDescription?: string;
  footerVariant?: "zylenpick" | "none";
  promoHrefs?: Partial<Record<PromoTileId, string>>;
};

const defaultTemplate: Required<Omit<DemoDishesTemplate, "promoHrefs">> & {
  promoHrefs: Record<PromoTileId, string>;
} = {
  logoSrc: "/icons/pickyalo-app.svg",
  logoLightSrc: "/icons/pickyalo-app.svg",
  logoDarkSrc: "/icons/pickyalo-app.svg",
  logoAlt: "Pickyalo",
  logoWidth: 56,
  logoHeight: 56,
  logoClassName: "h-12 w-12 sm:h-14 sm:w-14",
  compactLogoWidth: 48,
  compactLogoHeight: 48,
  compactLogoClassName: "h-11 w-11 rounded-[0.8rem] object-cover opacity-95 drop-shadow-[0_10px_22px_rgba(0,0,0,0.28)] sm:h-12 sm:w-12",
  homeHref: "/",
  emptyEyebrow: "Platos",
  emptyTitle: "La selección estará aquí pronto",
  emptyDescription:
    "Estamos preparando productos y propuestas de los locales de Talavera.",
  backLabel: "Volver al inicio",
  backCompactLabel: "Inicio",
  heroEyebrow: "Decide rapido",
  heroTitle: "¿Qué nos apetece hoy?",
  heroDescription:
    "Un laboratorio visual para descubrir platos como si fuera un explorador social: foto primero, contexto justo y detalle solo al abrir.",
  searchLabel: "Buscar productos",
  searchInputId: "demo-platos-search",
  searchPlaceholder: "Buscar producto, pack o local",
  noResultsEyebrow: "Sin coincidencias",
  noResultsDescription:
    "Prueba otro producto, local o categoría.",
  footerVariant: "zylenpick",
  promoHrefs: {
    "mira-que-pollo": "/platos",
    "simpre-fit": "/platos",
    "huelaa-bbq": "/platos",
    "sabor-en-video": "/platos",
  },
};

type FeedEntry =
  | { type: "venue"; venue: DiscoveryVenue }
  | {
      type: "dish";
      item: HomeShowcaseItem;
    }
  | {
      type: "featured";
      item: HomeShowcaseItem;
    }
  | {
      type: "promo";
      id: PromoTileId;
    };

type PromoTileId =
  | "mira-que-pollo"
  | "simpre-fit"
  | "huelaa-bbq"
  | "sabor-en-video";

const DISH_NAVIGATION_SHOT_THRESHOLDS = [5, 12] as const;


function formatPrice(item: HomeShowcaseItem) {
  return getPricePresentation({
    priceAmount: item.priceAmount,
    currency: item.currency,
    priceDisplayMode: item.priceDisplayMode,
    priceDisplayText: item.priceDisplayText,
    pricesVisible: item.venue.pricesVisible,
  }).label;
}

function getTrackedItemPrice(item: HomeShowcaseItem) {
  return isDefinitivePrice({
    priceAmount: item.priceAmount,
    currency: item.currency,
    priceDisplayMode: item.priceDisplayMode,
    priceDisplayText: item.priceDisplayText,
    pricesVisible: item.venue.pricesVisible,
  })
    ? item.priceAmount / 100
    : undefined;
}

function getDishDisplayName(item: HomeShowcaseItem) {
  const normalizedName = item.name.trim().toLocaleLowerCase("es");
  const genericNames = new Set([
    "plato",
    "menu",
    "menú",
    "especial",
    "clasico",
    "clásico",
    "combo",
    "racion",
    "ración",
    "tapa",
  ]);

  if (
    genericNames.has(normalizedName) &&
    item.categoryName &&
    item.categoryName.toLocaleLowerCase("es") !== normalizedName
  ) {
    return `${item.name} de ${item.categoryName}`;
  }

  return item.name;
}

function getDecisionSignal(item: HomeShowcaseItem) {
  if (item.isFeatured || item.isHomeFeatured) {
    return "Muy elegido";
  }

  if (item.isPickupMonthHighlight) {
    return "De los más pedidos";
  }

  if (item.pickupEtaMin) {
    return "Rápido";
  }

  return "Para recoger";
}

function getCardMicroContext(item: HomeShowcaseItem) {
  return item.venue.name;
}

function getVenueHref(item: HomeShowcaseItem) {
  return `/zonas/${item.venue.citySlug}/venues/${item.venue.slug}`;
}

function getVenueDistanceLabel(
  item: HomeShowcaseItem,
  userLocation: UserLocation | null,
) {
  const venueCoordinates = resolveVenueCoordinates({
    slug: item.venue.slug,
    latitude: item.venue.latitude,
    longitude: item.venue.longitude,
  });

  if (!userLocation || !venueCoordinates) {
    return item.venue.cityName;
  }

  const distanceKm = getDistanceInKm(
    userLocation.latitude,
    userLocation.longitude,
    venueCoordinates.latitude,
    venueCoordinates.longitude,
  );

  if (distanceKm < 1) {
    return `${Math.max(Math.round(distanceKm * 1000), 1)} m`;
  }

  return `${distanceKm.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  })} km`;
}

function getVenueDistanceInKm(
  item: HomeShowcaseItem,
  userLocation: UserLocation | null,
) {
  if (!userLocation) {
    return null;
  }

  const venueCoordinates = resolveVenueCoordinates({
    slug: item.venue.slug,
    latitude: item.venue.latitude,
    longitude: item.venue.longitude,
  });

  if (!venueCoordinates) {
    return null;
  }

  return getDistanceInKm(
    userLocation.latitude,
    userLocation.longitude,
    venueCoordinates.latitude,
    venueCoordinates.longitude,
  );
}

function getShortDescription(item: HomeShowcaseItem) {
  return item.description?.trim() || "Plato real de un local cercano.";
}

function getVenueAvatarLabel(item: HomeShowcaseItem) {
  return item.venue.name.trim().slice(0, 1).toLocaleUpperCase("es");
}

function DishVisualMedia({
  item,
  src,
  className,
  sizes,
  priority = false,
  fit = "cover",
}: {
  item: HomeShowcaseItem;
  src?: string | null;
  className: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const mediaClassName = `absolute inset-0 h-full w-full object-${fit} ${className}`;

  return (
    <Image
      src={src ?? item.imageUrl ?? ""}
      alt={item.name}
      fill
      sizes={sizes}
      className={mediaClassName}
      priority={priority}
    />
  );
}

function getWrappedIndex(itemsLength: number, index: number) {
  if (itemsLength === 0) {
    return 0;
  }

  return (index + itemsLength) % itemsLength;
}

function getContextualNavigationIndex(
  items: HomeShowcaseItem[],
  currentIndex: number,
  direction: -1 | 1,
) {
  const currentItem = items[currentIndex];

  if (!currentItem) {
    return currentIndex;
  }

  const sameVenueIndexes = items.reduce<number[]>((indexes, item, index) => {
    if (item.venue.slug === currentItem.venue.slug) {
      indexes.push(index);
    }

    return indexes;
  }, []);

  const currentVenuePosition = sameVenueIndexes.indexOf(currentIndex);

  if (currentVenuePosition < 0 || sameVenueIndexes.length <= 1) {
    return currentIndex;
  }

  const nextVenuePosition = getWrappedIndex(
    sameVenueIndexes.length,
    currentVenuePosition + direction,
  );

  return sameVenueIndexes[nextVenuePosition] ?? currentIndex;
}

function shuffleItems(items: HomeShowcaseItem[]) {
  return [...items].sort((left, right) => {
    const leftHash = getStableHash(
      `${left.id}:${left.venue.slug}:${left.categoryName ?? ""}`,
    );
    const rightHash = getStableHash(
      `${right.id}:${right.venue.slug}:${right.categoryName ?? ""}`,
    );

    if (leftHash === rightHash) {
      return left.id.localeCompare(right.id, "es");
    }

    return leftHash - rightHash;
  });
}

function distributeShowcaseItems(items: HomeShowcaseItem[]) {
  const featured = shuffleItems(
    items.filter((item) => item.isFeatured || item.isHomeFeatured),
  );
  const pickupHighlights = shuffleItems(
    items.filter(
      (item) =>
        !item.isFeatured && !item.isHomeFeatured && item.isPickupMonthHighlight,
    ),
  );
  const regular = shuffleItems(
    items.filter(
      (item) =>
        !item.isFeatured && !item.isHomeFeatured && !item.isPickupMonthHighlight,
    ),
  );

  const arranged: HomeShowcaseItem[] = [];

  // The feed can rotate, but the opening row should always start with a featured dish.
  if (featured.length > 0) {
    arranged.push(featured.shift()!);
  } else if (pickupHighlights.length > 0) {
    arranged.push(pickupHighlights.shift()!);
  } else if (regular.length > 0) {
    arranged.push(regular.shift()!);
  }

  const pattern: Array<"featured" | "regular" | "pickup"> = [
    "regular",
    "regular",
    "pickup",
    "regular",
    "featured",
    "regular",
    "pickup",
    "regular",
  ];

  const takeFromQueue = (type: "featured" | "regular" | "pickup") => {
    if (type === "featured" && featured.length > 0) {
      return featured.shift() ?? null;
    }

    if (type === "pickup" && pickupHighlights.length > 0) {
      return pickupHighlights.shift() ?? null;
    }

    if (regular.length > 0) {
      return regular.shift() ?? null;
    }

    if (pickupHighlights.length > 0) {
      return pickupHighlights.shift() ?? null;
    }

    if (featured.length > 0) {
      return featured.shift() ?? null;
    }

    return null;
  };

  while (featured.length || pickupHighlights.length || regular.length) {
    for (const slot of pattern) {
      const nextItem = takeFromQueue(slot);

      if (nextItem) {
        arranged.push(nextItem);
      }

      if (!featured.length && !pickupHighlights.length && !regular.length) {
        break;
      }
    }
  }

  return arranged;
}

function getPromoCardClassName(
  variant: "wide" | "tall" | "standard",
  isLightTheme: boolean,
) {
  const sizeClassName =
    variant === "wide"
      ? "lg:col-span-2 lg:row-span-1"
      : variant === "tall"
        ? "lg:row-span-2"
        : "lg:row-span-1";

  return `pickyalo-media-card explore-card group block w-full overflow-hidden rounded-none text-left row-span-3 active:scale-[0.992] sm:rounded-[1rem] lg:h-full ${sizeClassName} ${
    isLightTheme
      ? "bg-[linear-gradient(135deg,rgba(255,250,240,0.96),rgba(245,255,248,0.94),rgba(255,245,214,0.96))] shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      : "bg-[linear-gradient(135deg,rgba(19,30,24,0.96),rgba(11,23,18,0.96),rgba(64,48,18,0.82))] shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
  }`;
}

function getExploreCardClassName(
  item: HomeShowcaseItem,
  index: number,
  isLightTheme: boolean,
  isPromoted = false,
) {
  const surfaceClassName = isLightTheme
    ? "bg-white/64 shadow-[0_16px_36px_rgba(0,0,0,0.08)]"
    : "bg-black/10";
  const contentScore =
    item.name.length +
    Math.min(item.description?.length ?? 0, 120) +
    (item.categoryName?.length ?? 0);
  const shouldUseTallCard =
    contentScore >= 76 && getStableHash(`${item.id}:${index}:feed`) % 4 === 0;

  if (isPromoted) {
    return `pickyalo-media-card explore-card featured-feed-glow group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName}`;
  }

  if (item.isFeatured || item.isHomeFeatured) {
    return `pickyalo-media-card explore-card featured-feed-glow group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName}`;
  }

  if (item.isPickupMonthHighlight) {
    return `pickyalo-media-card explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName}`;
  }

  return `pickyalo-media-card explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] ${
    shouldUseTallCard ? "lg:row-span-2" : "lg:row-span-1"
  } lg:h-full ${surfaceClassName}`;
}

function getHoverTitleClassName(item: HomeShowcaseItem) {
  const isLargeCard = item.isFeatured || item.isHomeFeatured;

  return isLargeCard
    ? "line-clamp-4 max-w-[84%] text-balance text-center text-[clamp(2.3rem,3.4vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-white"
    : "line-clamp-4 max-w-[88%] text-balance text-center text-[clamp(1.8rem,2.8vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white";
}

function renderHoverTitle(item: HomeShowcaseItem) {
  const titleClassName = getHoverTitleClassName(item);

  return (
    <p
      className={`${titleClassName} relative translate-y-3 scale-[0.96] opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:lg:translate-y-0 group-hover:lg:scale-100 group-hover:lg:opacity-100 group-focus-visible:lg:translate-y-0 group-focus-visible:lg:scale-100 group-focus-visible:lg:opacity-100`}
    >
      {getDishDisplayName(item)}
    </p>
  );
}

function getHoverGlassClassName(item: HomeShowcaseItem) {
  if (item.isFeatured || item.isHomeFeatured) {
    return "pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,228,160,0.1),rgba(255,211,102,0.05)_32%,rgba(44,26,4,0.16))] opacity-0 backdrop-blur-[7px] transition-opacity duration-500 ease-out group-hover:lg:opacity-100 group-focus-visible:lg:opacity-100 lg:block";
  }

  return "pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015)_34%,rgba(6,10,12,0.1))] opacity-0 backdrop-blur-[5px] transition-opacity duration-500 ease-out group-hover:lg:opacity-100 group-focus-visible:lg:opacity-100 lg:block";
}


function getMostCommonCity(items: HomeShowcaseItem[]) {
  const cityMap = new Map<string, { slug: string; name: string; count: number }>();

  items.forEach((item) => {
    const current = cityMap.get(item.venue.citySlug);

    if (current) {
      current.count += 1;
      return;
    }

    cityMap.set(item.venue.citySlug, {
      slug: item.venue.citySlug,
      name: item.venue.cityName,
      count: 1,
    });
  });

  return (
    Array.from(cityMap.values()).sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.name.localeCompare(right.name, "es");
    })[0] ?? null
  );
}


function getCurationInfoText(filter: CurationFilter, cityName?: string | null) {
  switch (filter) {
    case "worldCup":
      return "Selecci\u00f3n de campa\u00f1a para locales con m\u00e1s visibilidad durante el Mundial: platos potentes, destacados y con m\u00e1s empuje comercial.";
    case "finallyFriday":
      return "Una mezcla pensada para arrancar el viernes con platos de capricho, compartibles y muy de empezar bien el finde.";
    case "raciones":
      return "Platos para pedir al centro y compartir con colegas: raciones, tapas y picoteo con m\u00e1s recorrido en grupo.";
    case "daniHome":
      return "Los platos que recomendar\u00eda ese amigo que siempre sabe qu\u00e9 pedir: apuestas seguras que suelen caer cada vez que vais a casa de Dani.";
    case "tapas":
      return "Selecci\u00f3n centrada en tapeo: bocados cortos, montados, croquetas, pinchos y platos r\u00e1pidos para ir probando.";
    case "quienNoApolla":
      return "Todo lo que entra por el lado m\u00e1s crujiente y directo: pollo, alitas y platos que casi nunca fallan.";
    case "mojarPan":
      return "Platos con salsa, jugo o cremosidad suficiente como para dejar el pan trabajando hasta el final.";
    case "bocatas":
      return "Bocadillos, s\u00e1ndwiches, molletes y formatos de pan que merecen categor\u00eda propia dentro del explorador.";
    case "veggano":
      return "Opciones vegetales o con perfil veggie para quien quiere algo m\u00e1s verde sin perder gracia.";
    case "recommended":
      return "Los platos que mejor representan el escaparate actual: destacados, favoritos de home y picks con m\u00e1s tracci\u00f3n.";
    case "premium":
      return "Selecci\u00f3n priorizada de locales con suscripci\u00f3n activa y platos con m\u00e1s empuje visual dentro de la demo.";
    case "hot":
      return "Lo m\u00e1s caliente del feed ahora mismo: picks del mes y platos que merecen un primer vistazo.";
    case "cityStars":
      return cityName
        ? `Lo que m\u00e1s brilla ahora mismo en ${cityName}: mezcla de platos fuertes y locales con mejor presencia.`
        : "Lo que m\u00e1s brilla ahora mismo en tu zona: mezcla de platos fuertes y locales con mejor presencia.";
    case "city":
      return cityName
        ? `Una lectura m\u00e1s localizada del explorador, centrada solo en platos que est\u00e1n funcionando en ${cityName}.`
        : "Una lectura m\u00e1s localizada del explorador, centrada solo en platos que est\u00e1n funcionando en tu zona.";
    case "surprise":
      return "Una ruta menos previsible para descubrir platos fuera del patr\u00f3n habitual y encontrar cosas que normalmente no buscar\u00edas.";
    case "all":
    default:
      return null;
  }
}
function getCurationInfoSurface(filter: CurationFilter, isLightTheme: boolean) {
  if (filter === "worldCup") {
    return isLightTheme
      ? {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#0f4fff]/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(240,245,255,0.82),rgba(255,246,214,0.92))] shadow-[0_18px_42px_rgba(21,62,158,0.08)] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(15,79,255,0.34),rgba(116,19,20,0.42),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#0f4fff]/12 bg-[linear-gradient(135deg,rgba(15,79,255,0.08),rgba(116,19,20,0.18))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#1840a8]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-[#153b8d]",
          body: "mt-3 text-sm leading-6 text-black/64",
          close: "pickyalo-light-control inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0f4fff]/10 bg-[#FFF7E8] text-[#153b8d] transition hover:text-[#153b8d]/72",
        }
      : {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#4f86ff]/18 bg-[linear-gradient(160deg,rgba(18,28,58,0.84),rgba(10,26,44,0.9),rgba(65,52,18,0.72))] shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(116,162,255,0.42),rgba(116,19,20,0.46),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#4f86ff]/16 bg-[linear-gradient(135deg,rgba(57,95,196,0.28),rgba(116,19,20,0.14))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#dfe7ff]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-white/42",
          body: "mt-3 text-sm leading-6 text-white/68",
          close: "pickyalo-light-control inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/44 transition hover:text-white/74",
        };
  }

  if (filter === "premium" || filter === "hot") {
    return isLightTheme
      ? {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#ffd766]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,249,236,0.82))] shadow-[0_16px_36px_rgba(0,0,0,0.05)] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,161,47,0.24),rgba(116,19,20,0.42),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#ffd766]/18 bg-[linear-gradient(135deg,rgba(255,186,73,0.12),rgba(255,236,174,0.2))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#8b5d10]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-[#61433A]",
          body: "mt-3 text-sm leading-6 text-black/62",
          close: "pickyalo-light-control inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-[#FFF7E8] text-black/40 transition hover:text-black/70",
        }
      : {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#ffd766]/14 bg-[linear-gradient(180deg,rgba(49,33,8,0.52),rgba(255,255,255,0.04))] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,190,88,0.28),rgba(116,19,20,0.44),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#ffd766]/14 bg-[linear-gradient(135deg,rgba(255,183,66,0.12),rgba(255,240,187,0.06))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#ffe2a6]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-[#FDE3AD]",
          body: "mt-3 text-sm leading-6 text-white/64",
          close: "pickyalo-light-control inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 transition hover:text-white/70",
        };
  }

  return isLightTheme
    ? {
        panel: "overflow-hidden rounded-[1.15rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.6))] shadow-[0_16px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl",
        line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(15,79,255,0.22),rgba(116,19,20,0.32),transparent)]",
        badge: "mt-2 inline-flex rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-black/62",
        eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-[#61433A]",
        body: "mt-3 text-sm leading-6 text-black/62",
        close: "pickyalo-light-control inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-[#FFF7E8] text-black/40 transition hover:text-black/70",
      }
    : {
        panel: "overflow-hidden rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.035))] backdrop-blur-xl",
        line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(116,162,255,0.28),rgba(116,19,20,0.38),transparent)]",
        badge: "mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-white/62",
        eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34",
        body: "mt-3 text-sm leading-6 text-white/62",
        close: "pickyalo-light-control inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 transition hover:text-white/70",
      };
}

function getCurationInfoBadge(filter: CurationFilter) {
  switch (filter) {
    case "worldCup":
      return "\uD83C\uDFC6\u26BD #EspecialMundial26";
    case "finallyFriday":
      return "\uD83C\uDF89 #PorFinViernes";
    case "raciones":
      return "\uD83C\uDF7B #RacionesConLosColegas";
    case "daniHome":
      return "\uD83C\uDFE0 #EnCasaDeDani";
    case "tapas":
      return "\uD83C\uDF62 #EspecialTapas";
    case "quienNoApolla":
      return "\uD83D\uDC14 #QuienNoApolla";
    case "mojarPan":
      return "\uD83E\uDD56 #ParaMojarPan";
    case "bocatas":
      return "\uD83E\uDD6A #Bocatas";
    case "veggano":
      return "\uD83C\uDF31 #VegganoHermano";
    case "recommended":
      return "\u2B50 #Recomendados";
    case "premium":
      return "\uD83D\uDC51 #MuyTOP";
    case "hot":
      return "\uD83D\uDD25 #NoTeLoPierdas";
    case "cityStars":
      return "\u2728 Top de tu zona";
    case "city":
      return "\uD83D\uDCCD Lo mejor de tu zona";
    case "surprise":
      return "\uD83C\uDFB2 Sorpr\u00E9ndete";
    case "all":
    default:
      return "Selecci\u00f3n curada";
  }
}


export function DemoDishesCarousel({
  items,
  venues = [],
  shots = [],
  template,
  funnelSettings = defaultSiteFunnelSettings,
  chips = [],
  mapboxAccessToken,
  locationPickerCenter,
}: DemoDishesCarouselProps) {
  const { resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    setThemeReady(true);
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const content = {
    ...defaultTemplate,
    ...template,
    promoHrefs: {
      ...defaultTemplate.promoHrefs,
      ...template?.promoHrefs,
    },
  };
  const rootRef = useRef<HTMLElement>(null);
  const openedPostParamRef = useRef<string | null>(null);
  const capturedPostViewsRef = useRef<Set<string>>(new Set());
  const curationInfoRef = useRef<HTMLDivElement>(null);
  const searchShellRef = useRef<HTMLDivElement>(null);
  const searchFieldRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shotPanelRef = useRef<HTMLElement>(null);
  const shotTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const shotWheelTimestampRef = useRef(0);
  const lastTrackedShotRef = useRef<string | null>(null);
  const dishWheelTimestampRef = useRef(0);
  const dishNavigationCountRef = useRef(0);
  const injectedShotCountRef = useRef(0);
  const mobileOverlayTouchStartRef = useRef<{ x: number; y: number } | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCitySlug, setSelectedCitySlug] = useState<string | null>(null);
  const curationFilter: CurationFilter = curationOptions.find(
    (option) => option.id === searchParams.get("filter"),
  )?.id ?? "all";
  const selectTag = (selection: { filter: CurationFilter } | { chip: string } | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filter");
    params.delete("chip");
    if (selection && "filter" in selection && selection.filter !== curationFilter) {
      params.set("filter", selection.filter);
    } else if (selection && "chip" in selection && selection.chip !== activeChipSlug) {
      params.set("chip", selection.chip);
    }
    setActiveCurationInfo(null);
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}${window.location.hash}`, { scroll: false });
  };
  const [activeCurationInfo, setActiveCurationInfo] = useState<CurationFilter | null>(null);
  const activeChipSlug = searchParams.get("chip");
  const setActiveChipSlug = useCallback((slug: string | null, replace = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("chip", slug);
    else params.delete("chip");
    const query = params.toString();
    const href = `${pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (replace) router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }, [pathname, router, searchParams]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [browseMode, setBrowseMode] = useState<"products" | "venues">(
    searchParams.get("modo") === "locales" ? "venues" : "products",
  );
  const [intent, setIntent] = useState<DiscoveryIntent>("all");
  const shotIds = useMemo(() => shots.map(shot => shot.slot), [shots]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isPostImageFullscreen, setIsPostImageFullscreen] = useState(false);
  const [activePostImageIndex, setActivePostImageIndex] = useState(0);
  const [showDishSwipeHint, setShowDishSwipeHint] = useState(false);
  const [isManualLocationOpen, setIsManualLocationOpen] = useState(false);
  const dishSwipeHintShownForOpenRef = useRef(false);
  const [postFeedback, setPostFeedback] = useState<string | null>(null);
  const [activeShotId, setActiveShotId] = useState<PromoTileId | null>(null);
  const [activeShotOrigin, setActiveShotOrigin] = useState<"feed" | "interstitial" | null>(null);
  const [isShotMuted, setIsShotMuted] = useState(true);
  const [shotFeedback, setShotFeedback] = useState<string | null>(null);
  const [shotDirection, setShotDirection] = useState<-1 | 1>(1);
  const [showShotSwipeHint, setShowShotSwipeHint] = useState(false);
  const [overlayDirection, setOverlayDirection] = useState<-1 | 1>(1);
  const {
    location: userLocation,
    isLocating,
    feedback: locationFeedback,
    activate: activateNearMode,
  } = useNearMode();

  const selectBrowseMode = (mode: "products" | "venues") => {
    setBrowseMode(mode);
    const params = new URLSearchParams(window.location.search);
    if (mode === "venues") params.set("modo", "locales");
    else params.delete("modo");
    const query = params.toString();
    window.history.replaceState({}, "", `${pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  };

  const cityScopedItems = useMemo(() => {
    if (!selectedCitySlug) {
      return items;
    }

    const scopedItems = items.filter(
      (item) => item.venue.citySlug === selectedCitySlug,
    );

    return scopedItems.length > 0 ? scopedItems : items;
  }, [items, selectedCitySlug]);
  const displayItems = useMemo(
    () => distributeShowcaseItems(cityScopedItems),
    [cityScopedItems],
  );
  const primaryCity = useMemo(() => getMostCommonCity(displayItems), [displayItems]);
  const scopedVenues = useMemo(() => venues.filter(venue => !selectedCitySlug || venue.citySlug === selectedCitySlug), [venues, selectedCitySlug]);
  const categoryOptions = useMemo(() => Array.from(new Set([
    ...displayItems.filter(item => matchesIntent(item.categoryName, intent)).map(productCategory),
    ...(browseMode === "venues" ? scopedVenues.map(venue => resolveVenueCategory(venue.slug, venue.discoveryCategory)).filter(category => matchesIntent(category, intent)) : []),
  ])).sort((a,b) => a.localeCompare(b, "es")), [displayItems, scopedVenues, intent, browseMode]);
  const tagCandidateItems = useMemo(() => getFilteredItems(
    displayItems.filter(item => matchesIntent(item.categoryName, intent)),
    "all", "all", primaryCity?.slug ?? null, searchQuery,
  ).filter(item => categoryFilter === "all" || productCategory(item) === categoryFilter), [categoryFilter, displayItems, primaryCity, searchQuery, intent]);
  const baseFilteredItems = useMemo(() => getFilteredItems(
    tagCandidateItems, curationFilter, "all", primaryCity?.slug ?? null, "",
  ), [tagCandidateItems, curationFilter, primaryCity]);
  const visibleEditorialTags = useMemo(() => curationOptions.filter(option =>
    option.id !== "all" && (option.id === curationFilter || (
      editorialTagFilters.includes(option.id) && getFilteredItems(
        tagCandidateItems, option.id, "all", primaryCity?.slug ?? null, "",
      ).length > 0
    )),
  ), [curationFilter, tagCandidateItems, primaryCity]);
  const visibleChips = useMemo(() => {
    const availableItemIds = new Set(tagCandidateItems.map((item) => item.id));

    return chips.filter(chip => chip.slug === activeChipSlug || chip.itemIds.some(itemId => availableItemIds.has(itemId)));
  }, [tagCandidateItems, chips, activeChipSlug]);
  const activeChip = useMemo(
    () => chips.find((chip) => chip.slug === activeChipSlug) ?? null,
    [activeChipSlug, chips],
  );
  const filteredItems = useMemo(() => {
    let nextItems = baseFilteredItems;

    if (activeChip) {
      const chipItemIds = new Set(activeChip.itemIds);
      nextItems = baseFilteredItems.filter((item) => chipItemIds.has(item.id));
    }

    if (!userLocation) {
      return nextItems;
    }

    return [...nextItems].sort((left, right) => {
      const leftDistance = getVenueDistanceInKm(left, userLocation);
      const rightDistance = getVenueDistanceInKm(right, userLocation);

      if (leftDistance === null && rightDistance === null) return 0;
      if (leftDistance === null) return 1;
      if (rightDistance === null) return -1;

      return leftDistance - rightDistance;
    });
  }, [activeChip, baseFilteredItems, userLocation]);
  const filteredVenues = useMemo(() => {
    const matchingIds = new Set(filteredItems.map(item => item.venue.id));
    const q = searchQuery.trim().toLocaleLowerCase("es");
    const results = scopedVenues.filter(venue => {
      const category = resolveVenueCategory(venue.slug, venue.discoveryCategory);
      const directMatch = matchesIntent(category, intent) && (categoryFilter === "all" || categoryFilter === category)
        && (!q || [venue.name, venue.description, category].some(text => text?.toLocaleLowerCase("es").includes(q)));
      if (activeChipSlug || curationFilter !== "all") return matchingIds.has(venue.id);
      return directMatch || matchingIds.has(venue.id);
    });
    if (!userLocation) return results;
    const distance = (venue: DiscoveryVenue) => venue.latitude !== null && venue.longitude !== null
      ? getDistanceInKm(userLocation.latitude, userLocation.longitude, venue.latitude, venue.longitude) : Infinity;
    return [...results].sort((a,b) => distance(a) - distance(b));
  }, [filteredItems, scopedVenues, searchQuery, intent, categoryFilter, activeChipSlug, curationFilter, userLocation]);
  const feedEntries = useMemo<FeedEntry[]>(() => {
    const featuredConfig = funnelSettings.platos.featuredFeed;
    const featuredItem =
      featuredConfig.enabled && featuredConfig.itemId
        ? filteredItems.find((item) => item.id === featuredConfig.itemId) ?? null
        : null;
    const feedItems = filteredItems.filter(
      (item) => item.id !== featuredItem?.id,
    );
    const entries = feedItems.map<FeedEntry>((item) => ({ type: "dish", item }));
    const promoEntries: FeedEntry[] = shotIds.slice(0, Math.floor(feedItems.length / 4)).map((id) => ({
      type: "promo",
      id,
    }));

    if (!featuredItem) {
      promoEntries.forEach((promoEntry, promoIndex) => {
        const insertIndex = Math.min(2 + promoIndex * 5, entries.length);
        entries.splice(insertIndex, 0, promoEntry);
      });

      return entries;
    }

    const insertIndex = Math.min(
      Math.max(featuredConfig.insertAfter, 0),
      entries.length,
    );

    entries.splice(insertIndex, 0, { type: "featured", item: featuredItem });
    promoEntries.forEach((promoEntry, promoIndex) => {
      const safeInsertIndex = Math.min(3 + promoIndex * 5, entries.length);
      entries.splice(safeInsertIndex, 0, promoEntry);
    });

    return entries;
  }, [filteredItems, funnelSettings, shotIds]);
  const visibleFeed = useMemo<FeedEntry[]>(() => {
    if (browseMode === "products") return feedEntries;
    const entries: FeedEntry[] = filteredVenues.map(venue => ({type:"venue",venue}));
    shotIds.slice(0, Math.floor(filteredVenues.length / 4)).forEach((id,index) => entries.splice(4 + index * 5,0,{type:"promo",id}));
    return entries;
  }, [browseMode, feedEntries, filteredVenues, shotIds]);
  const itemIndexById = useMemo(
    () =>
      new Map(filteredItems.map((item, index) => [item.id, index] as const)),
    [filteredItems],
  );
  const activeShot = useMemo(() => {
    const shot = shots.find(shot => shot.slot === activeShotId);
    if (!shot) return null;
    return { ...shot, venueName: shot.label, locationLabel: discoveryDistance(shot, userLocation) ?? "Talavera de la Reina", priceLabel: shot.dateLabel ?? "Una parada por descubrir" };
  }, [activeShotId, shots, userLocation]);
  const activeShotPosition = activeShotId ? shotIds.findIndex(id => id === activeShotId) : -1;

  useEffect(() => {
    if (!activeShot || !activeShotId || !activeShotOrigin) {
      lastTrackedShotRef.current = null;
      return;
    }

    const signature = `${activeShotId}:${activeShotOrigin}`;
    if (lastTrackedShotRef.current === signature) return;
    lastTrackedShotRef.current = signature;
    captureShotVisto({
      shot_id: activeShotId,
      shot_name: activeShot.title,
      source: activeShotOrigin,
    });
  }, [activeShot, activeShotId, activeShotOrigin]);
  const activeItem = useMemo(
    () => (activeIndex === null ? null : filteredItems[activeIndex] ?? null),
    [activeIndex, filteredItems],
  );
  const activeVenueItems = useMemo(
    () =>
      activeItem
        ? filteredItems.filter((item) => item.venue.slug === activeItem.venue.slug)
        : [],
    [activeItem, filteredItems],
  );
  const activeVenuePosition = useMemo(
    () =>
      activeItem
        ? activeVenueItems.findIndex((item) => item.id === activeItem.id)
        : -1,
    [activeItem, activeVenueItems],
  );
  const hasActiveVenueNavigation = activeVenueItems.length > 1;
  const isLightTheme = !themeReady || resolvedTheme !== "dark";
  const filterChipClass = (active: boolean) => `relative inline-flex min-h-10 items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.025em] transition after:absolute after:-inset-y-1 after:inset-x-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isLightTheme ? "focus-visible:outline-[#741314]" : "focus-visible:outline-[#FDE3AD]"} ${
    active
      ? isLightTheme ? "border-[#741314] bg-[#741314] text-[#FFF7E8] shadow-[0_3px_0_#4e1011]" : "border-[#FDE3AD] bg-[#FDE3AD] text-[#741314] shadow-[0_3px_0_#b59460]"
      : isLightTheme ? "border-[#741314]/25 bg-[#FFF7E8] text-[#741314] hover:bg-[#FDE3AD]" : "border-[#FDE3AD]/50 bg-[#24110E] text-[#FDE3AD] hover:bg-[#741314]"
  }`;

  const activeLogoSrc = isLightTheme
    ? content.logoLightSrc ?? content.logoSrc
    : content.logoDarkSrc ?? content.logoSrc;
  const shouldKeepSearchOpen = isSearchExpanded || searchQuery.trim().length > 0;
  const activeCurationInfoText = useMemo(
    () =>
      activeCurationInfo
        ? getCurationInfoText(activeCurationInfo, primaryCity?.name ?? null)
        : null,
    [activeCurationInfo, primaryCity],
  );
  const activeCurationInfoSurface = useMemo(
    () => getCurationInfoSurface(activeCurationInfo ?? "all", isLightTheme),
    [activeCurationInfo, isLightTheme],
  );

  useEffect(() => {
    const requestedPostId =
      searchParams.get("post") ?? searchParams.get("plato");

    if (!requestedPostId) {
      openedPostParamRef.current = null;
      return;
    }

    if (openedPostParamRef.current === requestedPostId) {
      return;
    }

    const targetIndex = filteredItems.findIndex(
      (item) => item.id === requestedPostId,
    );

    if (targetIndex < 0) {
      return;
    }

    openedPostParamRef.current = requestedPostId;
    setOverlayDirection(1);
    setActiveIndex(targetIndex);
    setPostFeedback(null);
  }, [filteredItems, searchParams]);

  useEffect(() => {
    if (!activeItem || capturedPostViewsRef.current.has(activeItem.id)) {
      return;
    }

    capturedPostViewsRef.current.add(activeItem.id);
    capturePlatoVisto({
      city_slug: activeItem.venue.citySlug,
      venue_id: activeItem.venue.id,
      venue_slug: activeItem.venue.slug,
      venue_name: activeItem.venue.name,
      item_id: activeItem.id,
      item_name: getDishDisplayName(activeItem),
      item_price: getTrackedItemPrice(activeItem),
      item_category: activeItem.categoryName,
      currency: activeItem.currency,
      source: "feed",
    });
  }, [activeItem]);

  useEffect(() => {
    if (activeChipSlug && !activeChip) {
      setActiveChipSlug(null, true);
    }
  }, [activeChip, activeChipSlug, setActiveChipSlug]);

  useEffect(() => {
    const syncSelectedCity = () => {
      const storedCity = readSelectedCity();
      setSelectedCitySlug(storedCity?.slug ?? null);
    };

    syncSelectedCity();
    window.addEventListener("storage", syncSelectedCity);
    window.addEventListener(SELECTED_CITY_UPDATED_EVENT, syncSelectedCity);

    return () => {
      window.removeEventListener("storage", syncSelectedCity);
      window.removeEventListener(SELECTED_CITY_UPDATED_EVENT, syncSelectedCity);
    };
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearchMouseEnter = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setIsSearchExpanded(true);
    }
  };

  const handleSearchMouseLeave = () => {
    if (window.matchMedia("(hover: hover)").matches && !searchQuery.trim()) {
      setIsSearchExpanded(false);
    }
  };

  const handleSearchToggle = () => {
    if (shouldKeepSearchOpen) {
      if (!searchQuery.trim()) {
        setIsSearchExpanded(false);
        return;
      }

      searchInputRef.current?.focus();
      return;
    }

    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    window.setTimeout(() => {
      if (!searchQuery.trim()) {
        setIsSearchExpanded(false);
      }
    }, 120);
  };

  const handleShareDish = async (item: HomeShowcaseItem) => {
    const href = `${window.location.origin}${getVenueHref(item)}#plato-${item.id}`;
    const shareText = `Mira esto \uD83D\uDC40 ${getDishDisplayName(item)} en ${item.venue.name} — Pickyalo`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pickyalo",
          text: shareText,
          url: href,
        });
        setPostFeedback("Compartido");
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard?.writeText(`${shareText}\n${href}`);
    setPostFeedback("Enlace copiado");
  };

  const handleShareShot = async () => {
    if (!activeShot) {
      return;
    }

    const href = new URL(activeShot.href, window.location.origin).href;
    const shareText = `Mira este Shot: ${activeShot.title} — Pickyalo`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pickyalo Shot",
          text: shareText,
          url: href,
        });
        setShotFeedback("Compartido");
        return;
      } catch {
        return;
      }
    }

    try { await navigator.clipboard.writeText(`${shareText}\n${href}`); setShotFeedback("Enlace copiado"); } catch { setShotFeedback("No se ha podido copiar el enlace."); }
  };


  const handleMobileOverlayTouchStart = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    mobileOverlayTouchStartRef.current = {
      x: event.touches[0]?.clientX ?? 0,
      y: event.touches[0]?.clientY ?? 0,
    };
  };

  const navigateDish = useCallback(
    (direction: -1 | 1) => {
      if (filteredItems.length === 0 || activeIndex === null) return;

      setOverlayDirection(direction);
      setPostFeedback(null);
      setShowDishSwipeHint(false);
      setActiveIndex(
        getContextualNavigationIndex(filteredItems, activeIndex, direction),
      );

      if (direction < 0) return;

      const navigationCount = dishNavigationCountRef.current + 1;
      dishNavigationCountRef.current = navigationCount;
      const nextThreshold =
        DISH_NAVIGATION_SHOT_THRESHOLDS[injectedShotCountRef.current];

      if (!nextThreshold || navigationCount < nextThreshold || shotIds.length === 0) return;

      const nextShotId =
        shotIds[injectedShotCountRef.current % shotIds.length];
      injectedShotCountRef.current += 1;
      setActiveShotOrigin("interstitial");
      setShotFeedback(null);
      setIsShotMuted(true);
      setShotDirection(direction);
      setShowShotSwipeHint(true);
      setActiveShotId(nextShotId);
    },
    [activeIndex, filteredItems, shotIds],
  );
  const activePostImages = useMemo(() => {
    if (!activeItem) return [];

    return Array.from(
      new Set(
        [activeItem.imageUrl, ...activeItem.galleryImageUrls].filter(
          (url): url is string => Boolean(url),
        ),
      ),
    );
  }, [activeItem]);
  const activePostImage =
    activePostImages[activePostImageIndex] ?? activePostImages[0] ?? null;

  useEffect(() => {
    setActivePostImageIndex(0);
    setIsPostImageFullscreen(false);
  }, [activeItem?.id]);

  const handleMobileOverlayTouchEnd = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    setShowDishSwipeHint(false);

    if (filteredItems.length === 0 || activeIndex === null) {
      mobileOverlayTouchStartRef.current = null;
      return;
    }

    const start = mobileOverlayTouchStartRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    const endY = event.changedTouches[0]?.clientY ?? null;

    mobileOverlayTouchStartRef.current = null;

    if (!start || endX === null || endY === null) {
      return;
    }

    const deltaX = endX - start.x;
    const deltaY = endY - start.y;

    if (Math.abs(deltaX) < 58 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) {
      return;
    }

    navigateDish(deltaX < 0 ? 1 : -1);
  };

  const handleDishWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (
      Math.abs(event.deltaY) < 36 ||
      activeShot ||
      isPostImageFullscreen
    ) {
      return;
    }

    const now = Date.now();
    if (now - dishWheelTimestampRef.current < 650) return;

    dishWheelTimestampRef.current = now;
    navigateDish(event.deltaY > 0 ? 1 : -1);
  };

  const navigateShot = useCallback((direction: -1 | 1) => {
    if (activeShotOrigin === "interstitial") {
      setActiveShotId(null);
      setActiveShotOrigin(null);
      setIsShotMuted(true);
      setShowShotSwipeHint(false);
      return;
    }

    setShotDirection(direction);
    setShotFeedback(null);
    setShowShotSwipeHint(false);
    setActiveShotId((current) => {
      if (!current) return current;

      const currentIndex = shotIds.findIndex((id) => id === current);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex =
        (safeIndex + direction + shotIds.length) % shotIds.length;

      return shotIds[nextIndex] ?? null;
    });
  }, [activeShotOrigin, shotIds]);

  const handleShotTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    shotTouchStartRef.current = {
      x: event.touches[0]?.clientX ?? 0,
      y: event.touches[0]?.clientY ?? 0,
    };
  };

  const handleShotTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = shotTouchStartRef.current;
    shotTouchStartRef.current = null;

    if (!start) return;

    const endX = event.changedTouches[0]?.clientX ?? start.x;
    const endY = event.changedTouches[0]?.clientY ?? start.y;
    const deltaX = endX - start.x;
    const deltaY = endY - start.y;

    if (Math.abs(deltaY) < 58 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.2) {
      return;
    }

    navigateShot(deltaY < 0 ? 1 : -1);
  };

  const handleShotWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 36) return;

    const now = Date.now();
    if (now - shotWheelTimestampRef.current < 650) return;

    shotWheelTimestampRef.current = now;
    navigateShot(event.deltaY > 0 ? 1 : -1);
  };

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    if (activeIndex > filteredItems.length - 1) {
      setActiveIndex(filteredItems.length > 0 ? 0 : null);
    }
  }, [activeIndex, filteredItems.length]);

  useEffect(() => {
    if (activeIndex === null && !activeShot) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, activeShot]);

  useEffect(() => {
    if (!activeShotId || !showShotSwipeHint) return;

    const timeoutId = window.setTimeout(() => {
      setShowShotSwipeHint(false);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [activeShotId, showShotSwipeHint]);

  useGSAP(
    () => {
      if (!activeShotId || !shotPanelRef.current) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      gsap.fromTo(
        shotPanelRef.current,
        { yPercent: shotDirection > 0 ? 8 : -8, opacity: 0.62 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.42,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    },
    { dependencies: [activeShotId, shotDirection] },
  );

  useEffect(() => {
    if (activeIndex === null) {
      dishSwipeHintShownForOpenRef.current = false;
      setShowDishSwipeHint(false);
      setIsPostImageFullscreen(false);
      return;
    }

    if (!dishSwipeHintShownForOpenRef.current) {
      dishSwipeHintShownForOpenRef.current = true;
      setShowDishSwipeHint(true);
    }

    setPostFeedback(null);
  }, [activeIndex]);

  useEffect(() => {
    if (!showDishSwipeHint) return;

    const timeoutId = window.setTimeout(() => {
      setShowDishSwipeHint(false);
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [showDishSwipeHint]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeShot) {
        setActiveShotId(null);
        setActiveShotOrigin(null);
        setIsShotMuted(true);
        return;
      }

      if (activeShot && (event.key === "ArrowDown" || event.key === "PageDown")) {
        event.preventDefault();
        navigateShot(1);
        return;
      }

      if (activeShot && (event.key === "ArrowUp" || event.key === "PageUp")) {
        event.preventDefault();
        navigateShot(-1);
        return;
      }

      if (filteredItems.length === 0) {
        return;
      }

      if (event.key === "Escape") {
        if (isPostImageFullscreen) {
          setIsPostImageFullscreen(false);
          return;
        }

        setActiveIndex(null);
        return;
      }

      if (activeIndex === null) {
        return;
      }

      if (isPostImageFullscreen) {
        return;
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        navigateDish(-1);
      }

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        navigateDish(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeIndex,
    activeShot,
    filteredItems,
    isPostImageFullscreen,
    navigateDish,
    navigateShot,
  ]);

  useGSAP(
    () => {
      if (activeIndex === null) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        return;
      }

      gsap.set(".dish-overlay-panel", {
        willChange: "transform, opacity",
      });

      gsap.fromTo(
        ".dish-overlay-panel",
        {
          yPercent: overlayDirection > 0 ? 8 : -8,
          opacity: 0.62,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.42,
          ease: "power3.out",
          clearProps: "transform,opacity,willChange",
        },
      );
    },
    {
      scope: rootRef,
      dependencies: [activeIndex, overlayDirection],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    () => {
      if (!curationInfoRef.current || !activeCurationInfoText) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(curationInfoRef.current, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      gsap.fromTo(
        curationInfoRef.current,
        {
          autoAlpha: 0,
          y: -8,
          scale: 0.985,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.26,
          ease: "power2.out",
        },
      );
    },
    {
      scope: rootRef,
      dependencies: [activeCurationInfoText],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    () => {
      if (!searchFieldRef.current) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(searchFieldRef.current, {
          autoAlpha: shouldKeepSearchOpen ? 1 : 0,
          x: shouldKeepSearchOpen ? 0 : 8,
        });
        return;
      }

      gsap.to(searchFieldRef.current, {
        autoAlpha: shouldKeepSearchOpen ? 1 : 0,
        x: shouldKeepSearchOpen ? 0 : 8,
        duration: 0.26,
        ease: "power2.out",
      });
    },
    {
      scope: searchShellRef,
      dependencies: [shouldKeepSearchOpen],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    if (!shouldKeepSearchOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 90);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [shouldKeepSearchOpen]);

  if (displayItems.length === 0 && venues.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <div className="max-w-lg text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-white/44">
            {content.emptyEyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
            {content.emptyTitle}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/58">
            {content.emptyDescription}
          </p>
          <Link
            href={content.homeHref}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.1]"
          >
            <ArrowLeft className="h-4 w-4" />
            {content.backLabel}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={rootRef}
      className={
        isLightTheme
          ? "public-light-theme pickyalo-public-canvas min-h-screen text-[#141414]"
          : "zylen-visual-skin min-h-screen text-white"
      }
    >
      <style jsx global>{`
        @keyframes heroDishBreath {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes heroPlateFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(-2deg) scale(1);
          }
          50% {
            transform: translate3d(0, -12px, 0) rotate(1deg) scale(1.025);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-plate-float {
            animation: none !important;
          }
        }
      `}</style>
      <SiteHeader />
      <section className="relative overflow-hidden px-1.5 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-7 lg:px-8 lg:pt-9">
        <div className="relative z-10 mx-auto max-w-[1600px]">
          <div className="flex min-h-[min(52svh,31rem)] flex-col">
            <div className="mt-4 flex flex-1 flex-col justify-center sm:mt-6">
              <header className={explorerStyles.header}>
                <p className={explorerStyles.eyebrow}>Pickyalo · Lo bueno de aquí</p>
                <h1>Déjate llevar.<em>Lo tienes cerca.</em></h1>
                <p>Encuentra <strong>algo que te apetezca</strong> o descubre los locales que tienes <em>aquí al lado.</em></p>
                <Image src="/home/hero/pickyalo-sticker.png" alt="" width={180} height={180} className={explorerStyles.mascot} />
              </header>
              <div className={explorerStyles.controls}>
                <div className={explorerStyles.modes} role="group" aria-label="Explorar por productos o locales">
                  <button type="button" aria-pressed={browseMode === "products"} onClick={() => selectBrowseMode("products")}>Productos</button>
                  <button type="button" aria-pressed={browseMode === "venues"} onClick={() => selectBrowseMode("venues")}>Locales</button>
                </div>
                <p className={explorerStyles.question}>¿Qué buscas hoy?</p>
                <div className={explorerStyles.chips}>
                  {([{id:"all",label:"Ver todo"},{id:"food",label:"Algo para comer"},{id:"local",label:"Otros productos"}] as const).map(option => <button key={option.id} type="button" className={filterChipClass(intent === option.id)} aria-pressed={intent === option.id} onClick={() => { setIntent(option.id); setCategoryFilter("all"); }}>{option.label}</button>)}
                </div>
                <div className={explorerStyles.locationActions}>
                  <button type="button" className={explorerStyles.near} onClick={() => void activateNearMode()} disabled={isLocating}><LocateFixed size={16} />{isLocating ? "Buscando tu ubicación…" : userLocation ? "Actualizar GPS" : "Usar GPS"}</button>
                  <button type="button" className={explorerStyles.manualLocation} onClick={() => setIsManualLocationOpen(true)}><MapPinned size={16} aria-hidden="true" />Elegir mi punto</button>
                  <Link href="/mapa" className={explorerStyles.mapLink}><MapPin size={16} aria-hidden="true" />Ver mapa</Link>
                </div>
                {locationFeedback ? <p role="status" className={explorerStyles.status}>{locationFeedback}</p> : null}
              </div>
              <div className="mx-auto mt-5 flex w-full max-w-xl justify-center">
                <label className="sr-only" htmlFor={content.searchInputId}>{content.searchLabel}</label>
                <div
                  ref={searchShellRef}
                  onMouseEnter={handleSearchMouseEnter}
                  onMouseLeave={handleSearchMouseLeave}
                  className={
                    isLightTheme
                      ? `flex h-12 items-center overflow-hidden rounded-[1.15rem] border border-black/8 bg-white/66 shadow-[0_16px_36px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-[width] duration-500 ease-out ${shouldKeepSearchOpen ? "w-full sm:w-[24rem]" : "w-12"}`
                      : `flex h-12 items-center overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-[width] duration-500 ease-out ${shouldKeepSearchOpen ? "w-full sm:w-[24rem]" : "w-12"}`
                  }
                >
                  <button type="button" onClick={handleSearchToggle} aria-label={"Abrir b\u00FAsqueda"} className={isLightTheme ? "inline-flex h-12 w-12 shrink-0 items-center justify-center text-[#741314] transition hover:text-[#5F0F10]" : "inline-flex h-12 w-12 shrink-0 items-center justify-center text-[#FDE3AD] transition hover:text-[#FFF7E8]"}>
                    <Search className="h-4 w-4" />
                  </button>
                  <div ref={searchFieldRef} className="flex min-w-0 flex-1 items-center pr-4 opacity-0">
                    <input ref={searchInputRef} id={content.searchInputId} type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onFocus={() => setIsSearchExpanded(true)} onBlur={handleSearchBlur} placeholder={content.searchPlaceholder} className={isLightTheme ? "w-full bg-transparent text-sm text-black placeholder:text-black/36 focus:outline-none" : "w-full bg-transparent text-sm text-white placeholder:text-white/34 focus:outline-none"} />
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-4 w-full max-w-4xl space-y-5 pb-4 text-center sm:pb-5">
                {visibleEditorialTags.length > 0 || visibleChips.length > 0 ? (
                  <div role="group" aria-label="Filtrar por etiquetas" className="flex flex-wrap justify-center gap-1.5 px-1 pb-1">
                    <button type="button" onClick={() => selectTag(null)} aria-pressed={curationFilter === "all" && !activeChipSlug} className={filterChipClass(curationFilter === "all" && !activeChipSlug)}>
                      Todos
                    </button>
                    {visibleEditorialTags.map(option => (
                      <button key={option.id} type="button" onClick={() => selectTag({ filter: option.id })} aria-pressed={curationFilter === option.id} className={filterChipClass(curationFilter === option.id)}>
                        {getEditorialTagLabel(option.id)}
                      </button>
                    ))}
                    {visibleChips.map(chip => (
                      <button key={chip.id} type="button" onClick={() => selectTag({ chip: chip.slug })} aria-pressed={activeChipSlug === chip.slug} className={filterChipClass(activeChipSlug === chip.slug)}>
                        {chip.name}
                      </button>
                    ))}
                  </div>
                ) : null}

                {activeCurationInfoText ? (
                  <div
                    ref={curationInfoRef}
                    className={activeCurationInfoSurface.panel}
                  >
                    <div className={activeCurationInfoSurface.line} />
                    <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className={activeCurationInfoSurface.eyebrow}>
                          Lectura editorial
                        </p>
                        <p className={activeCurationInfoSurface.badge}>
                          {getCurationInfoBadge(activeCurationInfo ?? "all")}
                        </p>
                        <p className={activeCurationInfoSurface.body}>
                          {activeCurationInfoText}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveCurationInfo(null)}
                        className={activeCurationInfoSurface.close}
                        aria-label={"Cerrar informaci\u00F3n"}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}

                {intent !== "all" || categoryFilter !== "all" ? <>
                <div className="space-y-2">
                  <p className={isLightTheme ? "text-[10px] font-semibold uppercase tracking-[0.22em] text-[#61433A]" : "text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FDE3AD]"}>
                    ¿Qué te apetece descubrir?
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 pb-1">
                  <button type="button" onClick={() => setCategoryFilter("all")} aria-pressed={categoryFilter === "all"} className={filterChipClass(categoryFilter === "all")}>
                    Todas
                  </button>
                  {categoryOptions.map((category) => {
                    const isActive = categoryFilter === category;
                    return (
                      <button key={category} type="button" onClick={() => setCategoryFilter(category)} aria-pressed={isActive} className={filterChipClass(isActive)}>
                        {category}
                      </button>
                    );
                  })}
                  </div>
                </div>

                </> : null}
                <div className="flex justify-center pt-1.5 sm:pt-2">
                  <div className={isLightTheme ? "inline-flex items-center gap-1.5 text-black/32" : "inline-flex items-center gap-1.5 text-white/28"}>
                    <ChevronDown className="h-4 w-4 animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(browseMode === "products" ? filteredItems.length : filteredVenues.length) > 0 ? (
            <>
              <div id="platos-feed" className="-mx-1.5 mt-5 grid scroll-mt-28 grid-cols-2 auto-rows-[8.8rem] gap-1.5 sm:mx-0 sm:mt-8 sm:auto-rows-[9.6rem] sm:gap-2.5 md:grid-cols-3 md:auto-rows-[7.2rem] lg:auto-rows-[10.2rem] lg:grid-flow-dense lg:gap-3 xl:auto-rows-[11.4rem]">
                {visibleFeed.map((entry, index) => {
                if (entry.type === "venue") return <DiscoveryVenueCard key={entry.venue.id} venue={entry.venue} items={displayItems} presentation={funnelSettings.platos.discovery?.venues[entry.venue.id]} location={userLocation} />;
                if (entry.type === "promo") {
                  const shot = shots.find(shot => shot.slot === entry.id);
                  if (!shot) return null;
                  const promo = { ...shot, dish: shot.title, variant: "standard" as const };

                  return (
                    <button
                      type="button"
                      key={entry.id}
                      onClick={() => {
                        setShotFeedback(null);
                        setIsShotMuted(true);
                        setShotDirection(1);
                        setShowShotSwipeHint(true);
                        setActiveShotOrigin("feed");
                        setActiveShotId(entry.id);
                      }}
                      className={getPromoCardClassName(promo.variant, isLightTheme)}
                      aria-label={`Abrir Shot ${promo.dish} a pantalla completa`}
                    >
                      <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[inherit] p-4 sm:p-5 lg:p-6">
                        {promo.videoUrl ? (
                          <video
                            src={promo.videoUrl}
                            aria-hidden="true"
                            muted
                            loop
                            playsInline
                            preload="none"
                            poster={promo.imageUrl ?? undefined}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        {promo.imageUrl ? (
                          <Image
                            src={promo.imageUrl}
                            unoptimized
                            alt=""
                            aria-hidden="true"
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 24vw"
                            className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:lg:scale-[1.03] ${promo.videoUrl ? "opacity-100" : "opacity-100"}`}
                          />
                        ) : null}
                        <div
                          className={
                            isLightTheme
                              ? "absolute left-3 top-3 z-[2] inline-flex items-center sm:left-3.5 sm:top-3.5"
                              : "absolute left-3 top-3 z-[2] inline-flex items-center sm:left-3.5 sm:top-3.5"
                          }
                        >
                          <Image
                            src={activeLogoSrc}
                            alt=""
                            aria-hidden="true"
                            width={content.compactLogoWidth}
                            height={content.compactLogoHeight}
                            className={content.compactLogoClassName}
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(116,19,20,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(116,19,20,0.14),transparent_36%)] transition-opacity duration-500 ease-out group-hover:lg:opacity-0" />
                        <div className={isLightTheme ? "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_34%,rgba(20,16,8,0.06))] transition-opacity duration-500 ease-out group-hover:lg:opacity-0" : "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01)_32%,rgba(0,0,0,0.12))] transition-opacity duration-500 ease-out group-hover:lg:opacity-0"}/>
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.02),rgba(4,7,11,0.05)_35%,rgba(4,7,11,0.85))]" />
                        <div className="relative z-[1] flex h-full w-full flex-col justify-end px-1 py-1 text-left transition-opacity duration-400 ease-out">
                          <div>
                            <p className="line-clamp-2 text-[0.82rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[1rem]">
                              {promo.dish}
                            </p>
                            <p className="mt-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#FFF7E8]">
                              {promo.sponsored ? "Patrocinado" : discoveryDistance(promo, userLocation) ?? promo.dateLabel ?? promo.label}
                            </p>
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-0 z-[1] hidden opacity-0 transition-opacity duration-500 ease-out group-hover:lg:block group-hover:lg:opacity-100 lg:block" />
                      </div>
                    </button>
                  );
                }

                const item = entry.item;
                const itemIndex = itemIndexById.get(item.id);
                const itemVenueCoordinates = resolveVenueCoordinates({
                  slug: item.venue.slug,
                  latitude: item.venue.latitude,
                  longitude: item.venue.longitude,
                });
                const itemJourney = getDiscoveryJourney(
                  {
                    latitude: itemVenueCoordinates?.latitude ?? null,
                    longitude: itemVenueCoordinates?.longitude ?? null,
                  },
                  userLocation,
                );

                if (itemIndex === undefined) {
                  return null;
                }

                if (entry.type === "featured") {
                  return (
                    <button type="button" key={`featured-${item.id}`} className={getExploreCardClassName(item, index, isLightTheme, true)} onClick={() => { setOverlayDirection(1); setActiveIndex(itemIndex); }} aria-label={`Abrir ${item.name}${itemJourney ? `. ${itemJourney.timeLabel}. ${itemJourney.quip}.` : ""}`}>
                      <div className="relative h-full overflow-hidden rounded-[inherit]">
                        <div className="absolute inset-0">
                          <DishVisualMedia
                            item={item}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="transition duration-500 group-hover:scale-[1.035]"
                          />
                          <div className={isLightTheme ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02)_30%,rgba(12,14,16,0.54))]" : "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.01),rgba(4,7,11,0.08)_34%,rgba(4,7,11,0.48))]"} />
                        </div>
                        <div className="pointer-events-none absolute left-2 top-2 z-[2] inline-flex rounded-full border border-[#FDE3AD]/80 bg-[#741314] px-2.5 py-1.5 text-[10px] font-extrabold uppercase leading-none tracking-[0.11em] text-[#FDE3AD] shadow-[0_6px_16px_rgba(36,17,14,0.38)] sm:left-2.5 sm:top-2.5 sm:px-3">
                          Destacado
                        </div>
                        {itemJourney ? <div className="pointer-events-none absolute right-2 top-2 z-[3] flex flex-col items-end rounded-xl border border-[#FDE3AD]/75 bg-[#24110E]/88 px-2 py-1.5 text-right text-[#FFF7E8] shadow-[0_8px_22px_rgba(36,17,14,0.34)] backdrop-blur-md sm:right-2.5 sm:top-2.5">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-[0.58rem] font-extrabold leading-none"><Clock3 className="h-3 w-3 text-[#FDE3AD]" aria-hidden="true" />{itemJourney.timeLabel}</span>
                          <span className="mt-1 whitespace-nowrap font-serif text-[0.56rem] font-semibold italic leading-none text-[#FDE3AD]">{itemJourney.quip}</span>
                        </div> : null}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] p-2.5 text-right sm:hidden">
                          <div className="ml-auto max-w-[84%]">
                            <p className="line-clamp-2 text-[0.875rem] font-extrabold leading-[1.18] tracking-[-0.035em] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]">
                              {getDishDisplayName(item)}
                            </p>
                            <div className="mt-2 flex min-w-0 items-center justify-end gap-2">
                              <span className="shrink-0 rounded-[0.45rem] bg-[#741314] px-1.5 py-1 text-[0.62rem] font-black leading-none text-[#FDE3AD] shadow-[0_8px_18px_rgba(0,0,0,0.26)]">
                                {formatPrice(item)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden px-3 pb-3 pt-8 sm:block sm:px-4">
                          <div className="space-y-1.5">
                            <p className="line-clamp-2 text-[0.92rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.38)] sm:text-[1.06rem]">{getDishDisplayName(item)}</p>
                            <p className="font-serif text-[0.9rem] font-semibold italic leading-none tracking-[-0.02em] text-[#FDE3AD] opacity-100 [text-shadow:0_3px_12px_rgba(0,0,0,0.48)]">{getDecisionSignal(item)}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }

                return (
                  <button type="button" key={item.id} className={getExploreCardClassName(item, index, isLightTheme)} onClick={() => { setOverlayDirection(1); setActiveIndex(itemIndex); }} aria-label={`Abrir ${item.name}${itemJourney ? `. ${itemJourney.timeLabel}. ${itemJourney.quip}.` : ""}`}>
                    <div className="relative h-full overflow-hidden rounded-[inherit]">
                      <DishVisualMedia
                        item={item}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="transition duration-500 group-hover:scale-[1.035]"
                      />
                      <div className={isLightTheme ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02)_38%,rgba(12,14,16,0.82))]" : "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.01),rgba(4,7,11,0.06)_40%,rgba(4,7,11,0.82))]"} />
                      <div className={getHoverGlassClassName(item)} />
                      {itemJourney ? <>
                      <div className="pointer-events-none absolute left-2 top-2 z-[3] flex flex-col items-start rounded-xl border border-[#FDE3AD]/70 bg-[#741314]/92 px-2 py-1.5 text-[#FFF7E8] shadow-[0_8px_20px_rgba(116,19,20,0.32)] backdrop-blur-md">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-[0.58rem] font-extrabold leading-none"><Clock3 className="h-3 w-3 text-[#FDE3AD]" aria-hidden="true" />{itemJourney.timeLabel}</span>
                        <span className="mt-1 whitespace-nowrap font-serif text-[0.56rem] font-semibold italic leading-none text-[#FDE3AD]">{itemJourney.quip}</span>
                      </div>
                      </> : null}
                      <div className="pointer-events-none absolute inset-0 z-[1] hidden items-center justify-center p-6 opacity-0 transition-opacity duration-500 ease-out group-hover:lg:flex group-hover:lg:opacity-100 group-focus-visible:lg:flex group-focus-visible:lg:opacity-100 lg:flex">
                        <div className="flex max-w-[88%] flex-col items-center">
                          {renderHoverTitle(item)}
                          <p className="mt-3 flex translate-y-2 items-center justify-center gap-2 font-serif text-[1.28rem] font-semibold italic leading-none tracking-[-0.02em] text-[#741314] opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:lg:translate-y-0 group-hover:lg:opacity-100 group-focus-visible:lg:translate-y-0 group-focus-visible:lg:opacity-100">
                            <span className="bg-[#FDE3AD]/95 px-3 py-2 shadow-[0_12px_28px_rgba(36,17,14,0.18)]">
                              {formatPrice(item)}
                            </span>
                            <span className="text-[#FDE3AD] drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
                              {getDecisionSignal(item)}
                            </span>
                          </p>
                          <p className="mt-2 translate-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#FDE3AD] opacity-0 drop-shadow-[0_4px_14px_rgba(0,0,0,0.48)] transition-[transform,opacity] duration-500 ease-out group-hover:lg:translate-y-0 group-hover:lg:opacity-100 group-focus-visible:lg:translate-y-0 group-focus-visible:lg:opacity-100">{getCardMicroContext(item)}</p>
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 z-[3] p-2.5 text-right sm:hidden">
                        <div className="ml-auto max-w-[84%]">
                          <p className="line-clamp-2 text-[0.875rem] font-extrabold leading-[1.18] tracking-[-0.035em] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]">
                            {getDishDisplayName(item)}
                          </p>
                          <div className="mt-2 flex min-w-0 items-center justify-end gap-2">
                            <span className="shrink-0 rounded-[0.45rem] bg-[#741314] px-1.5 py-1 text-[0.62rem] font-black leading-none text-[#FDE3AD] shadow-[0_8px_18px_rgba(0,0,0,0.26)]">
                              {formatPrice(item)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 hidden px-3 pb-3 pt-8 sm:block sm:px-4">
                        <div className="translate-y-0 transition-[transform,opacity] duration-500 ease-out will-change-transform group-hover:sm:-translate-y-2 group-focus-visible:sm:-translate-y-2 group-hover:lg:opacity-0 group-focus-visible:lg:opacity-0">
                          <p className="line-clamp-2 text-[0.92rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.38)] sm:text-[1.06rem]">{getDishDisplayName(item)}</p>
                          <p className="mt-1.5 font-serif text-[0.9rem] font-semibold italic leading-none tracking-[-0.02em] text-[#FDE3AD] opacity-100 [text-shadow:0_3px_12px_rgba(0,0,0,0.48)]">{getDecisionSignal(item)}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
                })}
              </div>
            </>
          ) : (
            <div className={isLightTheme ? "mt-6 rounded-[1.5rem] border border-black/8 bg-white/56 px-5 py-8 text-center shadow-[0_16px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:mt-10" : "mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-8 text-center backdrop-blur-xl sm:mt-10"}>
              <p className={isLightTheme ? "text-[11px] font-medium uppercase tracking-[0.28em] text-black/42" : "text-[11px] font-medium uppercase tracking-[0.28em] text-white/42"}>{content.noResultsEyebrow}</p>
              <p className={isLightTheme ? "mt-3 text-sm leading-7 text-black/58" : "mt-3 text-sm leading-7 text-white/58"}>{content.noResultsDescription}</p>
            </div>
          )}

          <div className="mt-6 flex justify-center sm:mt-10">
            <button type="button" onClick={handleScrollTop} className={isLightTheme ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-[#FFF7E8] text-black/70 backdrop-blur-xl transition hover:bg-white" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/76 backdrop-blur-xl transition hover:bg-white/[0.09]"} aria-label="Subir arriba">
              <ArrowUp className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {content.footerVariant === "zylenpick" ? (
        <ZylenPickFooter theme={isLightTheme ? "light" : "dark"} />
      ) : null}
      {activeShot ? (
        <div
          className="fixed inset-0 z-[100] overflow-hidden bg-[#120708] text-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="active-shot-title"
          onWheel={handleShotWheel}
        >
          <article
            key={activeShotId}
            ref={shotPanelRef}
            className="relative h-[100svh] w-full touch-pan-x overflow-hidden bg-black"
            onTouchStart={handleShotTouchStart}
            onTouchEnd={handleShotTouchEnd}
          >
            {activeShot.videoUrl ? (
              <video
                key={activeShot.videoUrl}
                src={activeShot.videoUrl}
                className="absolute inset-0 h-full w-full object-cover"
                muted={isShotMuted}
                loop
                playsInline
                autoPlay
                preload="metadata"
              />
            ) : activeShot.imageUrl ? (
              <Image
                src={activeShot.imageUrl}
                unoptimized
                alt={activeShot.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,4,5,0.52),transparent_22%,transparent_46%,rgba(10,3,4,0.9)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_52%,transparent_0%,rgba(18,7,8,0.12)_55%,rgba(18,7,8,0.42)_100%)]" />

            <header className="absolute inset-x-0 top-0 z-[4] flex items-center justify-between gap-4 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-7 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FDE3AD]/35 bg-[#741314]/90 text-[#FDE3AD] shadow-[0_10px_32px_rgba(0,0,0,0.22)] backdrop-blur-md">
                  <span className="font-pickyalo-wordmark text-lg leading-none">P</span>
                </span>
                <div className="min-w-0">
                  <p className="font-pickyalo-wordmark truncate text-base text-[#FFF7E8]">
                    Pickyalo
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFF7E8]/62">
                    {activeShot.sponsored ? "Patrocinado" : "Pickyalo · Descubre"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setActiveShotId(null);
                  setActiveShotOrigin(null);
                  setIsShotMuted(true);
                }}
                className="pickyalo-light-control inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FDE3AD]/32 bg-[#FFF7E8]/90 text-[#741314] shadow-[0_10px_32px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:bg-[#FFF7E8] motion-reduce:transition-none"
                aria-label="Cerrar Shot"
              >
                <X className="h-7 w-7" />
              </button>
            </header>

            {activeShotOrigin !== "interstitial" && activeShotPosition >= 0 ? (
              <div
                className="absolute left-1/2 top-[max(1.25rem,env(safe-area-inset-top))] z-[5] flex w-24 -translate-x-1/2 gap-1.5 sm:w-32"
                aria-label={`Shot ${activeShotPosition + 1} de ${shotIds.length}`}
              >
                {shotIds.map((id, index) => (
                  <span
                    key={id}
                    className={`h-1 flex-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-colors motion-reduce:transition-none ${
                      index === activeShotPosition ? "bg-[#FDE3AD]" : "bg-white/32"
                    }`}
                  />
                ))}
              </div>
            ) : null}

            {showShotSwipeHint ? (
              <div className="pointer-events-none absolute left-1/2 top-[max(5rem,calc(env(safe-area-inset-top)+4rem))] z-[4] flex -translate-x-1/2 flex-col items-center text-[#FFF7E8]">
                <ChevronUp className="h-5 w-5 animate-bounce motion-reduce:animate-none" />
                <span className="rounded-full border border-[#FDE3AD]/24 bg-black/32 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] backdrop-blur-md">
                  {activeShotOrigin === "interstitial" ? "Sigue deslizando" : "Desliza"}
                </span>
              </div>
            ) : null}

            <div className="absolute bottom-0 left-0 right-[4.9rem] z-[3] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:right-[7rem] sm:px-8 sm:pb-[max(2rem,env(safe-area-inset-bottom))] lg:max-w-[46rem]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FFF7E8]/72">
                <span className="truncate text-sm font-black text-[#FFF7E8]">
                  {activeShot.venueName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{activeShot.locationLabel}</span>
              </div>
              <h2
                id="active-shot-title"
                className="mt-2 max-w-[14ch] text-[clamp(2rem,7vw,4.75rem)] font-black leading-[0.9] tracking-[-0.06em] text-white [text-shadow:0_10px_34px_rgba(0,0,0,0.55)]"
              >
                {activeShot.title}
              </h2>
              <p className="mt-3 max-w-[34rem] text-sm leading-5 text-[#FFF7E8]/82 [text-shadow:0_4px_18px_rgba(0,0,0,0.7)] sm:text-base sm:leading-6">
                {activeShot.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#FDE3AD]/38 bg-[#741314]/90 px-3 py-1.5 text-xs font-black text-[#FDE3AD] backdrop-blur-md">
                  {activeShot.priceLabel}
                </span>
                <Link href={activeShot.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FFF7E8] px-5 text-sm font-bold text-[#741314]">{activeShot.ctaLabel} <ChevronRight size={18} /></Link>
              </div>
              {shotFeedback ? (
                <p
                  className="mt-3 max-w-[30rem] rounded-xl border border-[#FDE3AD]/25 bg-[#18090A]/72 px-3 py-2 text-xs font-semibold leading-5 text-[#FFF7E8] backdrop-blur-md"
                  role="status"
                >
                  {shotFeedback}
                </p>
              ) : null}
            </div>

            <div className="absolute bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-2.5 z-[4] flex w-[4.4rem] flex-col items-center gap-3 sm:bottom-[max(2rem,env(safe-area-inset-bottom))] sm:right-5 sm:w-[5rem] sm:gap-4">

              <button
                type="button"
                onClick={() => void handleShareShot()}
                className="group flex min-h-[3.7rem] w-full flex-col items-center justify-center gap-1 text-[#FFF7E8]"
                aria-label="Compartir Shot"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FDE3AD]/32 bg-[#FFF7E8]/88 text-[#741314] shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur-md transition group-hover:scale-105 group-hover:bg-[#FFF7E8] motion-reduce:transition-none sm:h-14 sm:w-14">
                  <Send className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span className="text-[9px] font-bold leading-none text-[#FFF7E8]/82 sm:text-[10px]">
                  Compartir
                </span>
              </button>

              {activeShot.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setIsShotMuted((current) => !current)}
                  className="group flex min-h-[3.7rem] w-full flex-col items-center justify-center gap-1 text-[#FFF7E8]"
                  aria-label={isShotMuted ? "Activar sonido" : "Silenciar vídeo"}
                  aria-pressed={!isShotMuted}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FDE3AD]/32 bg-[#FFF7E8]/14 text-[#FFF7E8] shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur-md transition group-hover:scale-105 group-hover:bg-[#FFF7E8]/22 motion-reduce:transition-none sm:h-14 sm:w-14">
                    {isShotMuted ? (
                      <VolumeX className="h-6 w-6 sm:h-7 sm:w-7" />
                    ) : (
                      <Volume2 className="h-6 w-6 sm:h-7 sm:w-7" />
                    )}
                  </span>
                  <span className="text-[9px] font-bold leading-none text-[#FFF7E8]/82 sm:text-[10px]">
                    {isShotMuted ? "Sonido" : "Silenciar"}
                  </span>
                </button>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}

      {activeItem ? (
        <div
          className="dish-overlay fixed inset-0 z-50 flex touch-pan-x items-center justify-center bg-[#18090a]/82 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de ${getDishDisplayName(activeItem)}`}
          onWheel={handleDishWheel}
          onTouchStart={handleMobileOverlayTouchStart}
          onTouchEnd={handleMobileOverlayTouchEnd}
        >
          <button
            type="button"
            className="dish-overlay-backdrop absolute inset-0"
            aria-label="Cerrar producto"
            onClick={() => setActiveIndex(null)}
          />

          <article className="dish-overlay-panel relative z-10 mx-auto h-[min(94svh,52rem)] w-full max-w-[29rem] overflow-hidden rounded-[2rem] border border-[#FFF7E8]/22 bg-[#24110E] text-[#FFF7E8] shadow-[0_34px_110px_rgba(0,0,0,0.56)] md:h-[min(88dvh,46rem)] md:max-w-[72rem] md:rounded-[2.4rem]">
            <button
              type="button"
              onClick={() => setIsPostImageFullscreen(true)}
              className="absolute inset-0 w-full md:right-auto md:w-[56%]"
              aria-label="Ver imagen del producto en grande"
            >
              {activePostImage ? (
                <DishVisualMedia
                  item={activeItem}
                  src={activePostImage}
                  sizes="(max-width: 767px) 100vw, 56vw"
                  className="scale-[1.01] transition-transform duration-700 ease-out hover:scale-[1.035] motion-reduce:transition-none motion-reduce:hover:scale-[1.01]"
                  priority
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center px-6 text-sm text-[#FFF7E8]/70">
                  Imagen no disponible
                </span>
              )}
            </button>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,7,7,0.42)_0%,rgba(20,7,7,0.04)_25%,rgba(20,7,7,0.10)_42%,rgba(25,8,9,0.92)_73%,rgba(18,6,7,0.99)_100%)] md:w-[56%] md:bg-[linear-gradient(90deg,rgba(16,5,6,0.08)_0%,rgba(16,5,6,0.02)_72%,rgba(18,6,7,0.32)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(circle_at_50%_120%,rgba(116,19,20,0.42),transparent_72%)] md:inset-y-0 md:left-auto md:h-auto md:w-[56%] md:bg-[radial-gradient(circle_at_110%_50%,rgba(116,19,20,0.40),transparent_72%)]" />

            <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4 md:p-6">
              <Link
                href={getVenueHref(activeItem)}
                className="flex min-w-0 items-center gap-2.5 rounded-full border border-[#FFF7E8]/20 bg-[#16090a]/42 py-1.5 pl-1.5 pr-3 text-[#FFF7E8] shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:bg-[#16090a]/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D]"
              >
                <span className="relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#FFF7E8]/24 bg-[#741314] text-sm font-semibold text-[#FFF7E8]">
                  {(activeItem.venue.logoUrl ?? activeItem.venue.coverUrl) ? (
                    <Image
                      src={activeItem.venue.logoUrl ?? activeItem.venue.coverUrl ?? ""}
                      alt={activeItem.venue.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      {getVenueAvatarLabel(activeItem)}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block max-w-[10.5rem] truncate text-xs font-extrabold leading-4 text-[#FFF7E8] sm:max-w-[16rem] sm:text-sm">
                    {activeItem.venue.name}
                  </span>
                  <span className="block max-w-[10.5rem] truncate text-[10px] font-medium leading-4 text-[#FFF7E8]/72 sm:max-w-[16rem] sm:text-xs">
                    {getVenueDistanceLabel(activeItem, userLocation)}
                  </span>
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleShareDish(activeItem)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFF7E8]/20 bg-[#16090a]/42 text-[#FFF7E8] shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:bg-[#16090a]/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D]"
                  aria-label="Compartir producto"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="pickyalo-light-control inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFF7E8]/20 bg-[#16090a]/42 text-[#FFF7E8] shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:bg-[#16090a]/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D]"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </header>

            {activePostImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePostImageIndex((current) =>
                      getWrappedIndex(activePostImages.length, current - 1),
                    )
                  }
                  className="absolute left-3 top-[43%] z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-[#FFF7E8] drop-shadow-[0_4px_12px_rgba(0,0,0,0.72)] transition hover:-translate-x-1 hover:text-[#FDE3AD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D] md:left-6"
                  aria-label="Ver imagen anterior"
                >
                  <ArrowLeft className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePostImageIndex((current) =>
                      getWrappedIndex(activePostImages.length, current + 1),
                    )
                  }
                  className="absolute right-3 top-[43%] z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-[#FFF7E8] drop-shadow-[0_4px_12px_rgba(0,0,0,0.72)] transition hover:translate-x-1 hover:text-[#FDE3AD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D] md:left-[50.5%] md:right-auto"
                  aria-label="Ver imagen siguiente"
                >
                  <ArrowRight className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <p className="absolute inset-x-0 top-[52%] z-20 text-center text-[11px] font-extrabold tabular-nums tracking-[0.18em] text-[#FFF7E8] drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] md:bottom-7 md:left-[8%] md:right-auto md:top-auto md:w-[40%]" aria-label={`Imagen ${activePostImageIndex + 1} de ${activePostImages.length}`}>
                  {activePostImageIndex + 1} / {activePostImages.length}
                </p>
              </>
            ) : null}

            <section className="absolute inset-x-0 bottom-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 md:left-auto md:flex md:h-full md:w-[44%] md:flex-col md:justify-center md:border-l md:border-[#FFF7E8]/12 md:bg-[#180809]/94 md:p-7 md:pt-24 md:backdrop-blur-xl lg:p-9 lg:pt-24">
              {showDishSwipeHint ? (
                <div className="pointer-events-none mb-3 flex justify-center md:justify-start" role="status">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#FDE3AD]/26 bg-[#16090a]/44 px-3 py-2 text-[10px] font-bold text-[#FFF7E8]/84 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-lg">
                    <ArrowLeft className="h-3.5 w-3.5 text-[#FED47D] motion-safe:animate-pulse" aria-hidden="true" />
                    Desliza o usa las flechas
                    <ArrowRight className="h-3.5 w-3.5 text-[#FED47D] motion-safe:animate-pulse" aria-hidden="true" />
                  </span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                {activeItem.categoryName ? (
                  <span className="inline-flex min-h-8 items-center rounded-full border border-[#FDE3AD]/28 bg-[#FFF7E8]/13 px-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#FFF7E8] backdrop-blur-lg">
                    {activeItem.categoryName}
                  </span>
                ) : null}
                {activeItem.pickupEtaMin ? (
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#FFF7E8]/18 bg-[#16090a]/28 px-3 text-[10px] font-bold text-[#FFF7E8]/82 backdrop-blur-lg">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {activeItem.pickupEtaMin} min
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <h2 className="min-w-0 text-[clamp(1.75rem,8vw,2.65rem)] font-black leading-[0.96] tracking-[-0.045em] text-[#FFF7E8] md:text-[clamp(2.3rem,4vw,3.8rem)]">
                  {getDishDisplayName(activeItem)}
                </h2>
                <ProductPriceBadge
                  priceAmount={activeItem.priceAmount}
                  currency={activeItem.currency}
                  priceDisplayMode={activeItem.priceDisplayMode}
                  priceDisplayText={activeItem.priceDisplayText}
                  pricesVisible={activeItem.venue.pricesVisible}
                  className="shrink-0 border-[#FDE3AD]/22 bg-[#FDE3AD] text-[#24110E] shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
                />
              </div>

              {activeItem.description ? (
                <p className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-[#FFF7E8]/74 md:max-w-[36rem] md:text-base md:leading-6">
                  {getShortDescription(activeItem)}
                </p>
              ) : null}

              <Link
                href={getVenueHref(activeItem)}
                className="mt-3 flex min-h-11 items-center gap-2.5 rounded-2xl border border-[#FFF7E8]/14 bg-[#FFF7E8]/8 px-3 text-xs font-semibold text-[#FFF7E8]/88 backdrop-blur-lg transition hover:bg-[#FFF7E8]/13 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D]"
              >
                <MapPin className="h-4 w-4 shrink-0 text-[#FED47D]" aria-hidden="true" />
                <span className="min-w-0 truncate">{activeItem.venue.name}</span>
                <span className="ml-auto shrink-0 text-[#FFF7E8]/60">{getVenueDistanceLabel(activeItem, userLocation)}</span>
              </Link>

              {postFeedback ? (
                <p className="mt-3 rounded-xl border border-[#FDE3AD]/22 bg-[#16090a]/40 px-3 py-2 text-xs font-semibold leading-4 text-[#FFF7E8] backdrop-blur-lg" role="status">
                  {postFeedback}
                </p>
              ) : null}

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={getVenueHref(activeItem)}
                  aria-label="Ver ficha del local e información completa del producto"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#fff4df] px-5 text-sm font-black text-[#531013] shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition hover:bg-[#f9d99e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24110E]"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  Ver el local
                </Link>
                {activeItem.venue.phone ? (
                  <a
                    href={`tel:${activeItem.venue.phone}`}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#FDE3AD]/26 bg-[#741314] text-[#FDE3AD] shadow-[0_14px_34px_rgba(0,0,0,0.24)] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24110E]"
                    aria-label={`Llamar a ${activeItem.venue.name}`}
                  >
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              {hasActiveVenueNavigation ? (
                <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#FFF7E8]/58">
                  <button
                    type="button"
                    onClick={() => navigateDish(-1)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[#FFF7E8]/78 transition hover:text-[#FDE3AD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D]"
                    aria-label="Producto anterior del local"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Anterior
                  </button>
                  <span>{activeVenuePosition + 1} / {activeVenueItems.length}</span>
                  <button
                    type="button"
                    onClick={() => navigateDish(1)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[#FFF7E8]/78 transition hover:text-[#FDE3AD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D]"
                    aria-label="Producto siguiente del local"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </section>
          </article>

          {isPostImageFullscreen ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black p-4">
              <button
                type="button"
                onClick={() => setIsPostImageFullscreen(false)}
                className="pickyalo-light-control absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition hover:bg-white/18"
                aria-label="Cerrar imagen"
              >
                <X className="h-6 w-6" />
              </button>
              {activePostImage ? (
                <DishVisualMedia
                  item={activeItem}
                  src={activePostImage}
                  sizes="100vw"
                  className=""
                  fit="contain"
                  priority
                />
              ) : null}
              {activePostImages.length > 1 ? (
                <div className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-2">
                  {activePostImages.map((image, index) => (
                    <button
                      key={`fullscreen-${activeItem.id}-${image}`}
                      type="button"
                      onClick={() => setActivePostImageIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full border border-white/80 shadow-[0_1px_4px_rgba(0,0,0,0.65)] transition-[background-color,transform] ${
                        index === activePostImageIndex
                          ? "scale-110 bg-[#FDE3AD]"
                          : "bg-white/35"
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {isManualLocationOpen ? (
        <ManualLocationPicker
          accessToken={mapboxAccessToken}
          center={locationPickerCenter}
          currentLocation={userLocation}
          onClose={() => setIsManualLocationOpen(false)}
        />
      ) : null}
    </main>
  );
}




