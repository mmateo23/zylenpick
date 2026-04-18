"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  MoveLeft,
  MoveRight,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";

import { CartIcon } from "@/components/icons/cart-icon";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  readSelectedCity,
  SELECTED_CITY_UPDATED_EVENT,
} from "@/features/location/city-preference";
import type { HomeShowcaseItem } from "@/features/venues/types";

gsap.registerPlugin(useGSAP);

function getBadgeLabel(totalItems: number) {
  return totalItems > 9 ? "9+" : String(totalItems);
}

function CartBadge({ totalItems }: { totalItems: number }) {
  if (totalItems <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[9px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
      {getBadgeLabel(totalItems)}
    </span>
  );
}

type DemoDishesCarouselProps = {
  items: HomeShowcaseItem[];
  template?: DemoDishesTemplate;
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
  logoSrc: "/logo/ZylenPick_LOGO.svg",
  logoLightSrc: "/logo/ZyelnpickLOGO_green.png",
  logoDarkSrc: "/logo/ZyelnpickLOGO_green.png",
  logoAlt: "ZylenPick",
  logoWidth: 210,
  logoHeight: 44,
  logoClassName: "h-auto w-[50px] sm:w-[54px]",
  compactLogoWidth: 40,
  compactLogoHeight: 9,
  compactLogoClassName: "h-auto w-[1.05rem] opacity-90 sm:w-[2.1rem]",
  homeHref: "/",
  emptyEyebrow: "Platos",
  emptyTitle: "No hay platos disponibles",
  emptyDescription:
    "En cuanto haya platos con imagen en el showcase, esta demo usara ese contenido real para construir el explorador visual.",
  backLabel: "Volver al inicio",
  backCompactLabel: "Inicio",
  heroEyebrow: "Explorador visual",
  heroTitle: "¿Qué nos apetece hoy?",
  heroDescription:
    "Un laboratorio visual para descubrir platos como si fuera un explorador social: foto primero, contexto justo y detalle solo al abrir.",
  searchLabel: "Buscar platos",
  searchInputId: "demo-platos-search",
  searchPlaceholder: "Buscar plato, local o categoria",
  noResultsEyebrow: "Sin coincidencias",
  noResultsDescription:
    "Prueba otra categoria o cambia la seleccion curada para ver mas platos.",
  footerVariant: "zylenpick",
  promoHrefs: {
    "mira-que-pollo": "/platos",
    "simpre-fit": "/platos",
    "huelaa-bbq": "/platos",
    "sabor-en-video": "/platos",
  },
};

type FeedEntry =
  | {
      type: "item";
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

type CurationFilter =
  | "all"
  | "worldCup"
  | "finallyFriday"
  | "raciones"
  | "daniHome"
  | "tapas"
  | "quienNoApolla"
  | "mojarPan"
  | "bocatas"
  | "veggano"
  | "recommended"
  | "city"
  | "surprise"
  | "premium"
  | "hot"
  | "cityStars";

function formatPrice(item: HomeShowcaseItem) {
  const normalizedAmount =
    Number.isInteger(item.priceAmount) && item.priceAmount >= 100
      ? item.priceAmount / 100
      : item.priceAmount;

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: item.currency,
    minimumFractionDigits: 2,
  }).format(normalizedAmount);
}

function getVenueHref(item: HomeShowcaseItem) {
  return `/zonas/${item.venue.citySlug}/venues/${item.venue.slug}`;
}

function getMenuItemHref(item: HomeShowcaseItem) {
  return `${getVenueHref(item)}#plato-${item.id}`;
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

  if (currentItem.venue.subscriptionActive) {
    const sameVenueIndexes = items.reduce<number[]>((indexes, item, index) => {
      if (item.venue.slug === currentItem.venue.slug) {
        indexes.push(index);
      }

      return indexes;
    }, []);

    const currentVenuePosition = sameVenueIndexes.indexOf(currentIndex);

    if (currentVenuePosition >= 0 && sameVenueIndexes.length > 1) {
      const nextVenuePosition = getWrappedIndex(
        sameVenueIndexes.length,
        currentVenuePosition + direction,
      );

      return sameVenueIndexes[nextVenuePosition] ?? currentIndex;
    }
  }

  const candidateIndexes = items
    .map((_, index) => index)
    .filter((index) => index !== currentIndex);

  if (candidateIndexes.length === 0) {
    return currentIndex;
  }

  const randomOffset = Math.floor(Math.random() * candidateIndexes.length);
  return candidateIndexes[randomOffset] ?? currentIndex;
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

function getExploreCardClassName(
  item: HomeShowcaseItem,
  index: number,
  isLightTheme: boolean,
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

  if (item.isFeatured || item.isHomeFeatured) {
    return `explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-3 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName}`;
  }

  if (item.isPickupMonthHighlight) {
    return `explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-3 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName}`;
  }

  return `explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-3 active:scale-[0.992] sm:rounded-[1rem] ${
    shouldUseTallCard ? "lg:row-span-2" : "lg:row-span-1"
  } lg:h-full ${surfaceClassName}`;
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

  return `explore-card group block w-full overflow-hidden rounded-none text-left row-span-3 active:scale-[0.992] sm:rounded-[1rem] lg:h-full ${sizeClassName} ${
    isLightTheme
      ? "bg-[linear-gradient(135deg,rgba(255,250,240,0.96),rgba(245,255,248,0.94),rgba(255,245,214,0.96))] shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      : "bg-[linear-gradient(135deg,rgba(19,30,24,0.96),rgba(11,23,18,0.96),rgba(64,48,18,0.82))] shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
  }`;
}

function getPromoLabelClassName(
  variant: "wide" | "tall" | "standard",
  isLightTheme: boolean,
) {
  const sizeClassName =
    variant === "wide"
      ? "text-[clamp(1.55rem,5vw,5.6rem)]"
      : variant === "tall"
        ? "text-[clamp(1.35rem,4vw,4.1rem)]"
        : "text-[clamp(1.05rem,2.7vw,2.2rem)]";

  return `${sizeClassName} text-balance font-semibold leading-[0.9] tracking-[-0.06em] ${
    isLightTheme ? "text-[#111111]" : "text-white"
  }`;
}

function getPromoTileConfig(
  id: PromoTileId,
  promoHrefs: Record<PromoTileId, string>,
) {
  switch (id) {
    case "sabor-en-video":
      return {
        href: promoHrefs["sabor-en-video"],
        label: "\ud83c\udfac #SaborEnVideo",
        dish: "Selección en movimiento",
        imageUrl: null,
        videoUrl:
          "https://cdn.pixabay.com/video/2024/01/18/197190-904257543_large.mp4",
        variant: "wide" as const,
      };
    case "simpre-fit":
      return {
        href: promoHrefs["simpre-fit"],
        label: "\uD83E\uDD57 #SimpreFIT",
        dish: "Ensalada C\u00e9sar Fit",
        imageUrl:
          "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1400&q=80",
        videoUrl: null,
        variant: "tall" as const,
      };
    case "huelaa-bbq":
      return {
        href: promoHrefs["huelaa-bbq"],
        label: "\uD83D\uDD25 #HuelaaBBQ",
        dish: "Costillas BBQ Ahumadas",
        imageUrl:
          "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1400&q=80",
        videoUrl: null,
        variant: "standard" as const,
      };
    case "mira-que-pollo":
    default:
      return {
        href: promoHrefs["mira-que-pollo"],
        label: "\uD83C\uDF57 #MiraQuePollo",
        dish: "Pollo Asado Entero",
        imageUrl:
          "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1600&q=80",
        videoUrl: null,
        variant: "wide" as const,
      };
  }
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
      {item.name}
    </p>
  );
}

function getHoverGlassClassName(item: HomeShowcaseItem) {
  if (item.isFeatured || item.isHomeFeatured) {
    return "pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,228,160,0.1),rgba(255,211,102,0.05)_32%,rgba(44,26,4,0.16))] opacity-0 backdrop-blur-[7px] transition-opacity duration-500 ease-out group-hover:lg:opacity-100 group-focus-visible:lg:opacity-100 lg:block";
  }

  return "pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015)_34%,rgba(6,10,12,0.1))] opacity-0 backdrop-blur-[5px] transition-opacity duration-500 ease-out group-hover:lg:opacity-100 group-focus-visible:lg:opacity-100 lg:block";
}

function getStableHash(value: string) {
  return Array.from(value).reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
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

function getItemSearchBlob(item: HomeShowcaseItem) {
  return [
    item.name,
    item.description ?? "",
    item.categoryName ?? "",
    item.venue.name,
    item.venue.cityName,
  ]
    .join(" ")
    .toLocaleLowerCase("es");
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
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(15,79,255,0.34),rgba(255,215,102,0.42),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#0f4fff]/12 bg-[linear-gradient(135deg,rgba(15,79,255,0.08),rgba(255,215,102,0.18))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#1840a8]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-[#153b8d]/56",
          body: "mt-3 text-sm leading-6 text-black/64",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0f4fff]/10 bg-white/72 text-[#153b8d]/44 transition hover:text-[#153b8d]/72",
        }
      : {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#4f86ff]/18 bg-[linear-gradient(160deg,rgba(18,28,58,0.84),rgba(10,26,44,0.9),rgba(65,52,18,0.72))] shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(116,162,255,0.42),rgba(255,215,102,0.46),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#4f86ff]/16 bg-[linear-gradient(135deg,rgba(57,95,196,0.28),rgba(255,215,102,0.14))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#dfe7ff]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-white/42",
          body: "mt-3 text-sm leading-6 text-white/68",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/44 transition hover:text-white/74",
        };
  }

  if (filter === "premium" || filter === "hot") {
    return isLightTheme
      ? {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#ffd766]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,249,236,0.82))] shadow-[0_16px_36px_rgba(0,0,0,0.05)] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,161,47,0.24),rgba(255,215,102,0.42),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#ffd766]/18 bg-[linear-gradient(135deg,rgba(255,186,73,0.12),rgba(255,236,174,0.2))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#8b5d10]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-black/34",
          body: "mt-3 text-sm leading-6 text-black/62",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white/72 text-black/40 transition hover:text-black/70",
        }
      : {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#ffd766]/14 bg-[linear-gradient(180deg,rgba(49,33,8,0.52),rgba(255,255,255,0.04))] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,190,88,0.28),rgba(255,215,102,0.44),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#ffd766]/14 bg-[linear-gradient(135deg,rgba(255,183,66,0.12),rgba(255,240,187,0.06))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#ffe2a6]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38",
          body: "mt-3 text-sm leading-6 text-white/64",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 transition hover:text-white/70",
        };
  }

  return isLightTheme
    ? {
        panel: "overflow-hidden rounded-[1.15rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.6))] shadow-[0_16px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl",
        line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(15,79,255,0.22),rgba(255,215,102,0.32),transparent)]",
        badge: "mt-2 inline-flex rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-black/62",
        eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-black/34",
        body: "mt-3 text-sm leading-6 text-black/62",
        close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white/72 text-black/40 transition hover:text-black/70",
      }
    : {
        panel: "overflow-hidden rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.035))] backdrop-blur-xl",
        line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(116,162,255,0.28),rgba(255,215,102,0.38),transparent)]",
        badge: "mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-white/62",
        eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34",
        body: "mt-3 text-sm leading-6 text-white/62",
        close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 transition hover:text-white/70",
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

function getFilteredItems(
  items: HomeShowcaseItem[],
  curationFilter: CurationFilter,
  categoryFilter: string,
  primaryCitySlug: string | null,
  searchQuery: string,
) {
  const matchesAny = (item: HomeShowcaseItem, needles: string[]) => {
    const blob = getItemSearchBlob(item);
    return needles.some((needle) => blob.includes(needle));
  };

  const curatedItems =
    curationFilter === "worldCup"
      ? [...items]
          .filter(
            (item) =>
              item.venue.subscriptionActive ||
              item.isFeatured ||
              item.isHomeFeatured ||
              item.isPickupMonthHighlight,
          )
          .sort((left, right) => {
            const leftScore =
              (left.venue.subscriptionActive ? 4 : 0) +
              (left.isFeatured || left.isHomeFeatured ? 2 : 0) +
              (left.isPickupMonthHighlight ? 1 : 0);
            const rightScore =
              (right.venue.subscriptionActive ? 4 : 0) +
              (right.isFeatured || right.isHomeFeatured ? 2 : 0) +
              (right.isPickupMonthHighlight ? 1 : 0);

            return rightScore - leftScore;
          })
      : curationFilter === "finallyFriday"
        ? items.filter(
            (item) =>
              item.venue.subscriptionActive ||
              item.isFeatured ||
              item.isHomeFeatured ||
              matchesAny(item, [
                "burger",
                "pizza",
                "nachos",
                "bocata",
                "croqueta",
                "tapa",
                "raci\u00f3n",
                "cerveza",
              ]),
          )
      : curationFilter === "raciones"
        ? items.filter((item) =>
            matchesAny(item, [
              "raci\u00f3n",
              "racion",
              "para compartir",
              "croqueta",
              "croquetas",
              "nachos",
              "alitas",
              "patatas",
              "tapa",
              "tapas",
            ]),
          )
      : curationFilter === "daniHome"
        ? items.filter((item) =>
            matchesAny(item, [
              "casero",
              "casera",
              "casa",
              "tradicional",
              "de la abuela",
              "guiso",
              "cuchara",
            ]),
          )
      : curationFilter === "tapas"
        ? items.filter((item) =>
            matchesAny(item, [
              "tapa",
              "tapas",
              "pincho",
              "pinchos",
              "montadito",
              "montaditos",
              "croqueta",
              "croquetas",
            ]),
          )
      : curationFilter === "quienNoApolla"
        ? items.filter((item) =>
            matchesAny(item, [
              "pollo",
              "alitas",
              "crispy",
              "finger",
              "nugget",
              "kebab",
            ]),
          )
      : curationFilter === "mojarPan"
        ? items.filter((item) =>
            matchesAny(item, [
              "salsa",
              "guiso",
              "huevo",
              "tomate",
              "caldo",
              "crema",
              "queso",
              "boletus",
            ]),
          )
      : curationFilter === "bocatas"
        ? items.filter((item) =>
            matchesAny(item, [
              "bocata",
              "bocadillo",
              "s\u00e1ndwich",
              "mollete",
              "panini",
            ]),
          )
      : curationFilter === "veggano"
        ? items.filter((item) =>
            matchesAny(item, [
              "vegano",
              "vegana",
              "veggie",
              "vegetal",
              "falafel",
              "tofu",
              "ensalada",
            ]),
          )
      : curationFilter === "recommended"
      ? items.filter(
          (item) =>
            item.isFeatured ||
            item.isHomeFeatured ||
            item.isPickupMonthHighlight,
        )
      : curationFilter === "premium"
        ? items.filter(
            (item) =>
              item.venue.subscriptionActive &&
              (item.isFeatured ||
                item.isHomeFeatured ||
                item.isPickupMonthHighlight),
          )
        : curationFilter === "hot"
          ? items.filter(
              (item) => item.isPickupMonthHighlight || item.isHomeFeatured,
            )
      : curationFilter === "city" && primaryCitySlug
        ? items.filter((item) => item.venue.citySlug === primaryCitySlug)
        : curationFilter === "cityStars" && primaryCitySlug
          ? items.filter(
              (item) =>
                item.venue.citySlug === primaryCitySlug &&
                (item.venue.subscriptionActive ||
                  item.isFeatured ||
                  item.isHomeFeatured),
            )
        : curationFilter === "surprise"
          ? [...items].sort(
              (left, right) => getStableHash(left.id) - getStableHash(right.id),
            )
          : items;

  if (categoryFilter === "all") {
    if (!searchQuery.trim()) {
      return curatedItems;
    }

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

    return curatedItems.filter((item) =>
      [
        item.name,
        item.categoryName ?? "",
        item.venue.name,
        item.venue.cityName,
      ].some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery)),
    );
  }

  const categoryItems = curatedItems.filter(
    (item) => item.categoryName === categoryFilter,
  );

  if (!searchQuery.trim()) {
    return categoryItems;
  }

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

  return categoryItems.filter((item) =>
    [item.name, item.categoryName ?? "", item.venue.name, item.venue.cityName]
      .some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery)),
  );
}

export function DemoDishesCarousel({
  items,
  template,
}: DemoDishesCarouselProps) {
  const { totals } = useCart();
  const content = {
    ...defaultTemplate,
    ...template,
    promoHrefs: {
      ...defaultTemplate.promoHrefs,
      ...template?.promoHrefs,
    },
  };
  const rootRef = useRef<HTMLElement>(null);
  const curationInfoRef = useRef<HTMLDivElement>(null);
  const searchShellRef = useRef<HTMLDivElement>(null);
  const searchFieldRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const mobileOverlayTouchStartRef = useRef<{ x: number; y: number } | null>(
    null,
  );
  const touchStartYRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light" | null>(
    null,
  );
  const [selectedCitySlug, setSelectedCitySlug] = useState<string | null>(null);
  const [curationFilter, setCurationFilter] = useState<CurationFilter>("all");
  const [activeCurationInfo, setActiveCurationInfo] = useState<CurationFilter | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false);
  const [overlayDirection, setOverlayDirection] = useState<-1 | 1>(1);

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
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          displayItems
            .map((item) => item.categoryName?.trim())
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort((left, right) => left.localeCompare(right, "es")),
    [displayItems],
  );
  const filteredItems = useMemo(
    () =>
      getFilteredItems(
        displayItems,
        curationFilter,
        categoryFilter,
        primaryCity?.slug ?? null,
        searchQuery,
      ),
    [categoryFilter, curationFilter, displayItems, primaryCity, searchQuery],
  );
  const feedEntries = useMemo<FeedEntry[]>(() => {
    if (filteredItems.length < 6) {
      return filteredItems.map((item) => ({ type: "item", item }));
    }

    const entries = filteredItems.map<FeedEntry>((item) => ({ type: "item", item }));
    const promoInsertions: Array<{ index: number; id: PromoTileId }> = [
      { index: 3, id: "mira-que-pollo" },
      { index: 8, id: "simpre-fit" },
      { index: 14, id: "huelaa-bbq" },
      { index: 18, id: "sabor-en-video" },
    ];

    promoInsertions
      .filter(({ index }) => entries.length > index)
      .sort((left, right) => right.index - left.index)
      .forEach(({ index, id }) => {
        entries.splice(index, 0, { type: "promo", id });
      });

    return entries;
  }, [filteredItems]);
  const itemIndexById = useMemo(
    () =>
      new Map(filteredItems.map((item, index) => [item.id, index] as const)),
    [filteredItems],
  );
  const promoFallbackIndex = useMemo(() => {
    const croquetasMatch = filteredItems.findIndex((item) => {
      const name = item.name.toLocaleLowerCase("es");
      const description = (item.description ?? "").toLocaleLowerCase("es");

      return name.includes("croqueta") || description.includes("croqueta");
    });

    if (croquetasMatch >= 0) {
      return croquetasMatch;
    }

    return filteredItems.length > 0 ? 0 : null;
  }, [filteredItems]);
  const activeItem = useMemo(
    () => (activeIndex === null ? null : filteredItems[activeIndex] ?? null),
    [activeIndex, filteredItems],
  );
  const effectiveTheme = previewTheme ?? systemTheme;
  const isLightTheme = effectiveTheme === "light";
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

  const handleMobileSheetTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleMobileSheetTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0]?.clientY ?? null;

    touchStartYRef.current = null;

    if (startY === null || endY === null) {
      return;
    }

    const deltaY = endY - startY;

    if (deltaY <= -36) {
      setIsMobileSheetExpanded(true);
    }

    if (deltaY >= 36) {
      setIsMobileSheetExpanded(false);
    }
  };

  const handleMobileOverlayTouchStart = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    mobileOverlayTouchStartRef.current = {
      x: event.touches[0]?.clientX ?? 0,
      y: event.touches[0]?.clientY ?? 0,
    };
  };

  const handleMobileOverlayTouchEnd = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
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

    const horizontalThreshold = 72;
    const horizontalDominanceRatio = 1.25;

    if (
      Math.abs(deltaX) < horizontalThreshold ||
      Math.abs(deltaX) <= Math.abs(deltaY) * horizontalDominanceRatio
    ) {
      return;
    }

    const direction = deltaX < 0 ? 1 : -1;
    setOverlayDirection(direction);
    setActiveIndex(
      getContextualNavigationIndex(filteredItems, activeIndex, direction),
    );
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    if (activeIndex > filteredItems.length - 1) {
      setActiveIndex(filteredItems.length > 0 ? 0 : null);
    }
  }, [activeIndex, filteredItems.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) {
      setIsMobileSheetExpanded(false);
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (filteredItems.length === 0) {
        return;
      }

      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }

      if (activeIndex === null) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setOverlayDirection(-1);
        setActiveIndex((current) =>
          current === null
            ? null
            : getContextualNavigationIndex(filteredItems, current, -1),
        );
      }

      if (event.key === "ArrowRight") {
        setOverlayDirection(1);
        setActiveIndex((current) =>
          current === null
            ? null
            : getContextualNavigationIndex(filteredItems, current, 1),
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, filteredItems]);

  useGSAP(
    () => {
      if (activeIndex === null) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;

      const panelEnterDuration = isMobileViewport ? 0.75 : 0.42;
      const imageEnterDuration = isMobileViewport ? 1.17 : 0.52;
      const focusImageEnterDuration = isMobileViewport ? 1.29 : 0.56;
      const backdropImageEnterDuration = isMobileViewport ? 1.23 : 0.58;
      const imageShift = isMobileViewport ? 11 : 4;
      const focusImageShift = isMobileViewport ? 18 : 11;
      const backdropImageShift = isMobileViewport ? 6 : 3;

      if (reduceMotion) {
        return;
      }

      gsap.set(
        [
          ".dish-overlay-backdrop",
          ".dish-overlay-panel",
          ".dish-overlay-image",
          ".dish-overlay-copy-desktop",
        ],
        {
          willChange: "transform, opacity",
        },
      );

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .fromTo(
          ".dish-overlay-backdrop",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.24 },
        )
        .fromTo(
          ".dish-overlay-panel",
          { y: 26, scale: 0.985, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: panelEnterDuration },
          "-=0.08",
        )
        .fromTo(
          ".dish-overlay-image",
          {
            xPercent: overlayDirection === 1 ? imageShift : -imageShift,
            scale: 1.04,
            autoAlpha: 0.86,
          },
          {
            xPercent: 0,
            scale: 1,
            autoAlpha: 1,
            duration: imageEnterDuration,
            ease: isMobileViewport ? "power2.out" : "power3.out",
          },
          0,
        )
        .fromTo(
          ".dish-overlay-copy-desktop",
          {
            x: 18,
            autoAlpha: 0,
          },
          {
            x: 0,
            autoAlpha: 1,
            duration: isMobileViewport ? 0 : 0.32,
            ease: "power2.out",
          },
          isMobileViewport ? 0 : 0.08,
        )
        .fromTo(
          ".dish-overlay-image-focus",
          {
            xPercent: overlayDirection === 1 ? focusImageShift : -focusImageShift,
            scale: 1.08,
            autoAlpha: 0.92,
          },
          {
            xPercent: 0,
            scale: 1.04,
            autoAlpha: 1,
            duration: focusImageEnterDuration,
            ease: isMobileViewport ? "power2.out" : "power3.out",
          },
          0,
        )
        .fromTo(
          ".dish-overlay-image-backdrop",
          {
            xPercent: overlayDirection === 1 ? -backdropImageShift : backdropImageShift,
            scale: 1.02,
            autoAlpha: 0.24,
          },
          {
            xPercent: 0,
            scale: 1,
            autoAlpha: 0.34,
            duration: backdropImageEnterDuration,
            ease: isMobileViewport ? "power2.out" : "power3.out",
          },
          0,
        )
        ;
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
      if (!mobileSheetRef.current || activeIndex === null) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(mobileSheetRef.current, {
          y: 0,
        });
        return;
      }

      gsap.to(mobileSheetRef.current, {
        y: 0,
        duration: 0.28,
        ease: "power3.out",
      });
    },
    {
      scope: rootRef,
      dependencies: [activeIndex, isMobileSheetExpanded],
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

  if (displayItems.length === 0) {
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
          ? "min-h-screen bg-[#f6f2ea] text-[#141414]"
          : "min-h-screen bg-[#06080d] text-white"
      }
    >
      <section className="relative overflow-hidden px-1.5 pb-8 pt-[max(0.85rem,env(safe-area-inset-top))] sm:px-6 sm:pb-10 lg:px-8">
        <div
          className={
            isLightTheme
              ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,223,129,0.12),transparent_24%),linear-gradient(180deg,#fcfaf5_0%,#f2ece1_100%)]"
              : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,52,33,0.24),transparent_26%),linear-gradient(180deg,#07100d_0%,#05070c_100%)]"
          }
        />

        <div className="relative z-10 mx-auto max-w-[1600px]">
          <div className="flex min-h-[calc(100svh-max(0.85rem,env(safe-area-inset-top)))] flex-col">
            <div
              className={
                isLightTheme
                  ? "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.55rem] border border-black/8 bg-[linear-gradient(180deg,rgba(248,242,231,0.95),rgba(242,235,224,0.88))] px-3.5 py-2 text-[#181816] shadow-[0_22px_48px_rgba(20,20,20,0.08)] backdrop-blur-2xl sm:px-4"
                  : "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,24,0.9),rgba(6,14,20,0.82))] px-3.5 py-2 text-white shadow-[0_24px_54px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:px-4"
              }
            >
              <Link
                href={content.homeHref}
                aria-label={content.logoAlt}
                className="inline-flex min-h-[22px] items-center justify-center"
              >
                <Image
                  src={activeLogoSrc}
                  alt={content.logoAlt}
                  width={content.logoWidth}
                  height={content.logoHeight}
                  priority
                  className={content.logoClassName}
                />
              </Link>

              <nav aria-label="Navegacion principal" className="hidden justify-center md:flex">
                <div
                  className={
                    isLightTheme
                      ? "inline-flex items-center gap-1 rounded-[999px] border border-black/8 bg-black/[0.035] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
                      : "inline-flex items-center gap-1 rounded-[999px] border border-white/10 bg-white/[0.06] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  }
                >
                  {[
                    { label: "Platos", href: "/platos" },
                    { label: "Zonas", href: "/zonas" },
                    { label: "Proyecto", href: "/el-proyecto" },
                    { label: "Unete", href: "/unete" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        item.href === "/platos"
                          ? isLightTheme
                            ? "rounded-full bg-white px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#181816] shadow-[0_10px_24px_rgba(20,20,20,0.1)] transition"
                            : "rounded-full bg-[#7cffb8]/12 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition"
                          : isLightTheme
                            ? "rounded-full px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#181816]/62 transition hover:-translate-y-[1px] hover:bg-black/[0.045] hover:text-[#181816]"
                            : "rounded-full px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/60 transition hover:-translate-y-[1px] hover:bg-white/[0.07] hover:text-white"
                      }
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="inline-flex items-center justify-self-end gap-1 rounded-[999px] border border-white/10 bg-white/[0.05] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Link
                  href="/cart"
                  aria-label="Carrito"
                  className={
                    isLightTheme
                      ? "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-black/[0.03] text-[#181816] transition hover:-translate-y-[1px] hover:bg-black/[0.05]"
                      : "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:-translate-y-[1px] hover:bg-white/[0.1]"
                  }
                >
                  <CartIcon size={16} />
                  <CartBadge totalItems={totals.totalItems} />
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewTheme(isLightTheme ? "dark" : "light")}
                  className={
                    isLightTheme
                      ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-black/[0.03] text-[#181816] transition hover:-translate-y-[1px] hover:bg-black/[0.05]"
                      : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:-translate-y-[1px] hover:bg-white/[0.1]"
                  }
                  aria-label={isLightTheme ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                >
                  {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-1 flex-col justify-center sm:mt-10">
              <div className="max-w-[38rem]">
                <p className={isLightTheme ? "text-[11px] font-medium uppercase tracking-[0.28em] text-black/42" : "text-[11px] font-medium uppercase tracking-[0.28em] text-white/42"}>{content.heroEyebrow}</p>
                <h1 className="mt-2.5 max-w-[11ch] text-[clamp(2.35rem,8.6vw,5.4rem)] font-semibold leading-[0.92] tracking-[-0.07em] sm:mt-3 sm:max-w-none">{content.heroTitle}</h1>
                <p className={isLightTheme ? "mt-3 max-w-[32rem] text-[0.95rem] leading-6 text-black/56 sm:mt-4 sm:max-w-[34rem] sm:text-base sm:leading-7" : "mt-3 max-w-[32rem] text-[0.95rem] leading-6 text-white/56 sm:mt-4 sm:max-w-[34rem] sm:text-base sm:leading-7"}>
                  {content.heroDescription}
                </p>
              </div>

              <div className="mt-5 sm:mt-7">
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
                  <button type="button" onClick={handleSearchToggle} aria-label={"Abrir b\u00FAsqueda"} className={isLightTheme ? "inline-flex h-12 w-12 shrink-0 items-center justify-center text-black/40 transition hover:text-black/72" : "inline-flex h-12 w-12 shrink-0 items-center justify-center text-white/40 transition hover:text-white/72"}>
                    <Search className="h-4 w-4" />
                  </button>
                  <div ref={searchFieldRef} className="flex min-w-0 flex-1 items-center pr-4 opacity-0">
                    <input ref={searchInputRef} id={content.searchInputId} type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onFocus={() => setIsSearchExpanded(true)} onBlur={handleSearchBlur} placeholder={content.searchPlaceholder} className={isLightTheme ? "w-full bg-transparent text-sm text-black placeholder:text-black/36 focus:outline-none" : "w-full bg-transparent text-sm text-white placeholder:text-white/34 focus:outline-none"} />
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 pb-3 sm:mt-7 sm:space-y-3 sm:pb-4">
                <div className="flex flex-wrap gap-2 pb-1">
                  {[
                    { id: "all", label: "Todo" },
                    { id: "worldCup", label: "\uD83C\uDFC6\u26BD #EspecialMundial26" },
                    { id: "finallyFriday", label: "\uD83C\uDF89 #PorFinViernes" },
                    { id: "raciones", label: "\uD83C\uDF7B #RacionesConLosColegas" },
                    { id: "daniHome", label: "\uD83C\uDFE0 #EnCasaDeDani" },
                    { id: "tapas", label: "\uD83C\uDF62 #EspecialTapas" },
                    { id: "quienNoApolla", label: "\uD83D\uDC14 #QuienNoApolla" },
                    { id: "mojarPan", label: "\uD83E\uDD56 #ParaMojarPan" },
                    { id: "bocatas", label: "\uD83E\uDD6A #Bocatas" },
                    { id: "veggano", label: "\uD83C\uDF31 #VegganoHermano" },
                    { id: "recommended", label: "\u2B50 #Recomendados" },
                    { id: "premium", label: "\uD83D\uDC51 #MuyTOP" },
                    { id: "hot", label: "\uD83D\uDD25 #NoTeLoPierdas" },
                    { id: "cityStars", label: primaryCity ? "Top de tu zona" : "Top de tu zona" },
                    { id: "city", label: primaryCity ? "Lo mejor de tu zona" : "Lo mejor de tu zona" },
                    { id: "surprise", label: "\uD83C\uDFB2 Sorpr\u00E9ndete" },
                  ].map((filterOption) => {
                    const isActive = curationFilter === filterOption.id;
                    const isEventFilter = filterOption.id === "worldCup";
                    return (
                      <button
                        key={filterOption.id}
                        type="button"
                        onClick={() => {
                          const nextFilter = filterOption.id as CurationFilter;
                          setCurationFilter(nextFilter);
                          setActiveCurationInfo(nextFilter === "all" ? null : nextFilter);
                        }}
                        className={
                          isEventFilter
                            ? isActive
                              ? "rounded-full border border-[#ffd766]/50 bg-[linear-gradient(135deg,rgba(14,88,255,0.24),rgba(0,223,129,0.18),rgba(255,215,102,0.26))] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#fff3c4] shadow-[0_10px_30px_rgba(0,86,255,0.18)] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                              : isLightTheme
                                ? "rounded-full border border-[#0f4fff]/18 bg-[linear-gradient(135deg,rgba(34,93,255,0.08),rgba(255,215,102,0.1))] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#1742b0] transition hover:border-[#0f4fff]/28 hover:bg-[linear-gradient(135deg,rgba(34,93,255,0.12),rgba(255,215,102,0.14))] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-[#4f86ff]/28 bg-[linear-gradient(135deg,rgba(33,74,196,0.22),rgba(255,215,102,0.12))] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#dce6ff] transition hover:border-[#74a2ff]/36 hover:bg-[linear-gradient(135deg,rgba(33,74,196,0.28),rgba(255,215,102,0.18))] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                            : isActive
                              ? isLightTheme
                                ? "rounded-full border border-[#00df81]/28 bg-[#00df81]/12 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#00a560] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-[#7cffb8]/28 bg-[#7cffb8]/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#7cffb8] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                              : isLightTheme
                                ? "rounded-full border border-black/8 bg-white/54 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-black/58 transition hover:bg-white/78 sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white/54 transition hover:bg-white/[0.07] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                        }
                      >
                        {filterOption.label}
                      </button>
                    );
                  })}
                </div>

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

                <div className="flex flex-wrap gap-2 pb-1">
                  <button type="button" onClick={() => setCategoryFilter("all")} className={categoryFilter === "all" ? (isLightTheme ? "rounded-full border border-black/10 bg-[#141414] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-white/12 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#07100d] transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]") : (isLightTheme ? "rounded-full border border-black/8 bg-white/54 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-black/52 transition hover:bg-white/78 sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/52 transition hover:bg-white/[0.07] sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]")}>
                    Todas
                  </button>
                  {categoryOptions.map((category) => {
                    const isActive = categoryFilter === category;
                    return (
                      <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={isActive ? (isLightTheme ? "rounded-full border border-[#00df81]/28 bg-[#00df81]/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00a560] transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-[#7cffb8]/28 bg-[#7cffb8]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7cffb8] transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]") : (isLightTheme ? "rounded-full border border-black/8 bg-white/54 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-black/52 transition hover:bg-white/78 sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/52 transition hover:bg-white/[0.07] sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]")}>
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center pt-1.5 sm:pt-2">
                  <div className={isLightTheme ? "inline-flex items-center gap-1.5 text-black/32" : "inline-flex items-center gap-1.5 text-white/28"}>
                    <ChevronDown className="h-4 w-4 animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 auto-rows-[6.4rem] gap-1 sm:mt-10 sm:gap-3 md:grid-cols-3 md:auto-rows-[8.4rem] lg:auto-rows-[13rem] lg:grid-flow-dense lg:gap-4 xl:auto-rows-[14rem]">
              {feedEntries.map((entry, index) => {
                if (entry.type === "promo") {
                  const promo = getPromoTileConfig(entry.id, content.promoHrefs);

                  return (
                    <button
                      type="button"
                      key={entry.id}
                      onClick={() => {
                        if (promoFallbackIndex !== null) {
                          setOverlayDirection(1);
                          setActiveIndex(promoFallbackIndex);
                        }
                      }}
                      className={getPromoCardClassName(promo.variant, isLightTheme)}
                      aria-label={`Abrir promoción ${promo.label}`}
                    >
                      <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[inherit] p-4 sm:p-5 lg:p-6">
                        {promo.videoUrl ? (
                          <video
                            src={promo.videoUrl}
                            aria-hidden="true"
                            muted
                            loop
                            playsInline
                            autoPlay
                            preload="metadata"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        {promo.imageUrl ? (
                          <Image
                            src={promo.imageUrl}
                            alt=""
                            aria-hidden="true"
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 24vw"
                            className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:lg:scale-[1.03] ${promo.videoUrl ? "opacity-0 group-hover:lg:opacity-100" : "opacity-0 group-hover:lg:opacity-100"}`}
                          />
                        ) : null}
                        <div
                          className={
                            isLightTheme
                              ? "absolute left-2 top-2 z-[2] inline-flex items-center rounded-[0.82rem] border border-black/8 bg-white/82 px-2 py-1 shadow-[0_10px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1.5"
                              : "absolute left-2 top-2 z-[2] inline-flex items-center rounded-[0.82rem] border border-white/10 bg-black/30 px-2 py-1 backdrop-blur-xl sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1.5"
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
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,255,184,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,215,102,0.14),transparent_36%)] transition-opacity duration-500 ease-out group-hover:lg:opacity-0" />
                        <div className={isLightTheme ? "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_34%,rgba(20,16,8,0.06))] transition-opacity duration-500 ease-out group-hover:lg:opacity-0" : "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01)_32%,rgba(0,0,0,0.12))] transition-opacity duration-500 ease-out group-hover:lg:opacity-0"}/>
                        {promo.videoUrl ? (
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.04),rgba(4,7,11,0.1)_42%,rgba(4,7,11,0.48))]" />
                        ) : null}
                        <div className="relative z-[1] flex items-center justify-center px-4 text-center transition-opacity duration-400 ease-out group-hover:lg:opacity-0">
                          <span className={getPromoLabelClassName(promo.variant, isLightTheme)}>
                            {promo.label}
                          </span>
                        </div>
                        <div className="pointer-events-none absolute inset-0 z-[1] hidden opacity-0 transition-opacity duration-500 ease-out group-hover:lg:block group-hover:lg:opacity-100 lg:block" />
                      </div>
                    </button>
                  );
                }

                const item = entry.item;
                const itemIndex = itemIndexById.get(item.id);

                if (itemIndex === undefined) {
                  return null;
                }

                return (
                  <button key={item.id} type="button" onClick={() => setActiveIndex(itemIndex)} className={getExploreCardClassName(item, index, isLightTheme)} aria-label={`Abrir ${item.name}`}>
                    <div className="relative h-full overflow-hidden rounded-[inherit]">
                      <Image src={item.imageUrl ?? ""} alt={item.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
                      <div className={isLightTheme ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02)_38%,rgba(12,14,16,0.34))]" : "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.01),rgba(4,7,11,0.06)_40%,rgba(4,7,11,0.28))]"} />
                      <div className={getHoverGlassClassName(item)} />
                      <div className="pointer-events-none absolute inset-0 z-[1] hidden items-center justify-center p-6 opacity-0 transition-opacity duration-500 ease-out group-hover:lg:flex group-hover:lg:opacity-100 group-focus-visible:lg:flex group-focus-visible:lg:opacity-100 lg:flex">
                        <div className="flex max-w-[88%] flex-col items-center">
                          {renderHoverTitle(item)}
                          <p className="mt-3 translate-y-2 font-serif text-[1.28rem] font-semibold italic leading-none tracking-[-0.02em] text-[#7cffb8] opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:lg:translate-y-0 group-hover:lg:opacity-100 group-focus-visible:lg:translate-y-0 group-focus-visible:lg:opacity-100">{formatPrice(item)}</p>
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10 sm:px-5 sm:pb-5">
                        <div className="translate-y-0 transition-[transform,opacity] duration-500 ease-out will-change-transform group-hover:sm:-translate-y-2 group-focus-visible:sm:-translate-y-2 group-hover:lg:opacity-0 group-focus-visible:lg:opacity-0">
                          <p className="line-clamp-2 text-[1.02rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.38)] sm:text-[1.22rem]">{item.name}</p>
                          <p className="mt-2 font-serif text-[1rem] font-semibold italic leading-none tracking-[-0.02em] text-[#7cffb8] opacity-100 [text-shadow:0_3px_12px_rgba(0,0,0,0.34)] sm:hidden">{formatPrice(item)}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={isLightTheme ? "mt-6 rounded-[1.5rem] border border-black/8 bg-white/56 px-5 py-8 text-center shadow-[0_16px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:mt-10" : "mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-8 text-center backdrop-blur-xl sm:mt-10"}>
              <p className={isLightTheme ? "text-[11px] font-medium uppercase tracking-[0.28em] text-black/42" : "text-[11px] font-medium uppercase tracking-[0.28em] text-white/42"}>{content.noResultsEyebrow}</p>
              <p className={isLightTheme ? "mt-3 text-sm leading-7 text-black/58" : "mt-3 text-sm leading-7 text-white/58"}>{content.noResultsDescription}</p>
            </div>
          )}

          <div className="mt-6 flex justify-center sm:mt-10">
            <button type="button" onClick={handleScrollTop} className={isLightTheme ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/72 text-black/70 backdrop-blur-xl transition hover:bg-white" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/76 backdrop-blur-xl transition hover:bg-white/[0.09]"} aria-label="Subir arriba">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {content.footerVariant === "zylenpick" ? (
        <ZylenPickFooter theme={isLightTheme ? "light" : "dark"} />
      ) : null}
      {activeItem ? (
        <div className="dish-overlay fixed inset-0 z-50 flex items-center justify-center px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6">
          <button
            type="button"
            className={
              isLightTheme
                ? "dish-overlay-backdrop absolute inset-0 bg-[#f6f2ea]/82 backdrop-blur-md"
                : "dish-overlay-backdrop absolute inset-0 bg-black/72 backdrop-blur-md"
            }
            aria-label="Cerrar plato"
            onClick={() => setActiveIndex(null)}
          />

          <div
            className={
              isLightTheme
                ? "dish-overlay-panel relative z-10 w-full overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#fffdf8]/96 shadow-[0_30px_100px_rgba(0,0,0,0.12)] backdrop-blur-2xl md:h-[min(86vh,52rem)] md:max-w-6xl md:rounded-[2rem] md:bg-[#fffdf8]/92"
                : "dish-overlay-panel relative z-10 w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a0f13]/94 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:h-[min(86vh,52rem)] md:max-w-6xl md:rounded-[2rem] md:bg-[#0a0f13]/88"
            }
          >
            <div
              className="relative min-h-[calc(100svh-max(1.5rem,env(safe-area-inset-top)+env(safe-area-inset-bottom)))] md:hidden"
              onTouchStart={handleMobileOverlayTouchStart}
              onTouchEnd={handleMobileOverlayTouchEnd}
            >
              <Image
                src={activeItem.imageUrl ?? ""}
                alt=""
                aria-hidden="true"
                fill
                sizes="100vw"
                className="dish-overlay-image-backdrop absolute inset-0 object-cover opacity-34 blur-xl saturate-[1.15]"
              />
              <div className="absolute inset-x-0 top-[max(2.75rem,calc(env(safe-area-inset-top)+1.6rem))] bottom-[9.25rem] overflow-hidden">
                <Image
                  src={activeItem.imageUrl ?? ""}
                  alt={activeItem.name}
                  fill
                  sizes="100vw"
                  className="dish-overlay-image dish-overlay-image-focus object-cover object-center"
                />
              </div>
              <div
                className={
                  isLightTheme
                    ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_30%,rgba(18,18,18,0.18)_56%,rgba(18,18,18,0.72)_100%)]"
                    : "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.08),rgba(4,7,11,0.04)_30%,rgba(4,7,11,0.26)_56%,rgba(4,7,11,0.82)_100%)]"
                }
              />

              <div className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex items-center gap-2">
                <Link
                  href={getVenueHref(activeItem)}
                  className={
                    isLightTheme
                      ? "rounded-full border border-black/10 bg-white/82 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-black/72 backdrop-blur-xl transition hover:bg-white"
                      : "rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/72 backdrop-blur-xl transition hover:bg-black/28"
                  }
                >
                  {activeItem.venue.name}
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className={
                  isLightTheme
                    ? "absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/82 text-black/72 backdrop-blur-xl transition hover:bg-white"
                    : "absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/18 text-white/72 backdrop-blur-xl transition hover:bg-black/28"
                }
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[calc(max(1rem,env(safe-area-inset-bottom))+0.25rem)]">
                <div
                  ref={mobileSheetRef}
                  onTouchStart={handleMobileSheetTouchStart}
                  onTouchEnd={handleMobileSheetTouchEnd}
                  className={
                    isLightTheme
                      ? "dish-overlay-copy-mobile rounded-[1.6rem] border border-black/10 bg-white/68 shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
                      : "dish-overlay-copy-mobile rounded-[1.6rem] border border-white/10 bg-black/28 shadow-[0_18px_44px_rgba(0,0,0,0.26)] backdrop-blur-2xl"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setIsMobileSheetExpanded((current) => !current)}
                    className="flex w-full flex-col items-center justify-center pt-3"
                    aria-label={
                      isMobileSheetExpanded
                        ? "Mostrar menos informaci\u00f3n"
                        : "Mostrar m\u00e1s informaci\u00f3n"
                    }
                  >
                    <span className={isLightTheme ? "h-1.5 w-12 rounded-full bg-black/14" : "h-1.5 w-12 rounded-full bg-white/16"} />
                    {!isMobileSheetExpanded ? (
                      <span className={isLightTheme ? "mt-2 inline-flex items-center text-black/34" : "mt-2 inline-flex items-center text-white/34"}>
                        <ChevronUp className="h-3.5 w-3.5 animate-bounce" />
                      </span>
                    ) : null}
                  </button>

                  <div className="px-4 pb-4 pt-3">
                    <p className={isLightTheme ? "text-[10px] font-medium uppercase tracking-[0.28em] text-black/40" : "text-[10px] font-medium uppercase tracking-[0.28em] text-white/42"}>
                      Plato
                    </p>
                    <h2 className={isLightTheme ? "mt-2 text-[1.95rem] font-semibold leading-[0.94] tracking-[-0.06em] text-black" : "mt-2 text-[1.95rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white"}>
                      {activeItem.name}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                      <span className={isLightTheme ? "rounded-full border border-[#7cffb8]/35 bg-[#7cffb8]/10 px-3 py-1.5 text-sm font-bold text-[#00df81]" : "rounded-full border border-[#7cffb8]/28 bg-[#7cffb8]/10 px-3 py-1.5 text-sm font-bold text-[#7cffb8]"}>
                        {formatPrice(activeItem)}
                      </span>
                      {activeItem.pickupEtaMin ? (
                        <span className={isLightTheme ? "inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs text-black/72" : "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72"}>
                          <Clock3 className="h-3.5 w-3.5" />
                          {activeItem.pickupEtaMin} min
                        </span>
                      ) : null}
                    </div>
                    <div className={isLightTheme ? "mt-4 flex items-center gap-2 text-sm text-black/62" : "mt-4 flex items-center gap-2 text-sm text-white/62"}>
                      <MapPin className="h-4 w-4" />
                      <span>{activeItem.venue.name}</span>
                    </div>
                    <div
                      className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out ${
                        isMobileSheetExpanded ? "mt-4 max-h-52 opacity-100" : "mt-0 max-h-0 opacity-0"
                      }`}
                    >
                      {activeItem.description ? (
                        <p className={isLightTheme ? "text-sm leading-6 text-black/58" : "text-sm leading-6 text-white/58"}>
                          {activeItem.description}
                        </p>
                      ) : null}
                    </div>
                    <div
                      className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out ${
                        isMobileSheetExpanded ? "mt-4 max-h-24 opacity-100" : "mt-0 max-h-0 opacity-0"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOverlayDirection(-1);
                              setActiveIndex((current) =>
                                current === null ? null : getContextualNavigationIndex(filteredItems, current, -1),
                              );
                            }}
                            className={isLightTheme ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/12 bg-black/[0.04] text-black/88 transition hover:bg-black/[0.08]" : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/88 transition hover:bg-white/[0.09]"}
                            aria-label="Plato anterior"
                          >
                            <MoveLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOverlayDirection(1);
                              setActiveIndex((current) =>
                                current === null ? null : getContextualNavigationIndex(filteredItems, current, 1),
                              );
                            }}
                            className={isLightTheme ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/12 bg-black/[0.04] text-black/88 transition hover:bg-black/[0.08]" : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/88 transition hover:bg-white/[0.09]"}
                            aria-label="Plato siguiente"
                          >
                            <MoveRight className="h-4 w-4" />
                          </button>
                        </div>
                        <Link
                          href={getMenuItemHref(activeItem)}
                          className={isLightTheme ? "inline-flex items-center rounded-full bg-[#141414] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/92" : "inline-flex items-center rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#07100d] transition hover:bg-white/92"}
                        >
                          {"Ver m\u00e1s"}
                        </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            </div>

            <div className="hidden h-[min(86vh,52rem)] md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(20rem,25rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,28rem)]">
              <div className="relative h-full min-h-0 overflow-hidden">
                <Image
                  src={activeItem.imageUrl ?? ""}
                  alt={activeItem.name}
                  fill
                  sizes="(max-width: 1280px) 58vw, 66vw"
                  className="dish-overlay-image absolute inset-0 h-full w-full object-cover"
                />
                <div className={isLightTheme ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02)_34%,rgba(20,20,20,0.12))]" : "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.01),rgba(4,7,11,0.06)_34%,rgba(4,7,11,0.22))]"} />

                <div className="absolute left-6 top-6 flex items-center gap-2">
                  <Link
                    href={getVenueHref(activeItem)}
                    className={isLightTheme ? "rounded-full border border-black/10 bg-white/82 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-black/72 backdrop-blur-xl transition hover:bg-white" : "rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/72 backdrop-blur-xl transition hover:bg-black/28"}
                  >
                    {activeItem.venue.name}
                  </Link>
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOverlayDirection(-1);
                      setActiveIndex((current) =>
                        current === null ? null : getContextualNavigationIndex(filteredItems, current, -1),
                      );
                    }}
                    className={isLightTheme ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/12 bg-white/82 text-black/88 backdrop-blur-xl transition hover:bg-white" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/18 text-white/88 backdrop-blur-xl transition hover:bg-black/28"}
                    aria-label="Plato anterior"
                  >
                    <MoveLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOverlayDirection(1);
                      setActiveIndex((current) =>
                        current === null ? null : getContextualNavigationIndex(filteredItems, current, 1),
                      );
                    }}
                    className={isLightTheme ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/12 bg-white/82 text-black/88 backdrop-blur-xl transition hover:bg-white" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/18 text-white/88 backdrop-blur-xl transition hover:bg-black/28"}
                    aria-label="Plato siguiente"
                  >
                    <MoveRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="dish-overlay-copy-desktop flex h-full min-h-0 flex-col overflow-y-auto p-7">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <p className={isLightTheme ? "text-[11px] font-medium uppercase tracking-[0.28em] text-black/38" : "text-[11px] font-medium uppercase tracking-[0.28em] text-white/38"}>
                      Plato
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(null)}
                      className={isLightTheme ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-black/72 transition hover:bg-black/[0.08]" : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08]"}
                      aria-label="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className={isLightTheme ? "mt-4 text-[clamp(2.2rem,4vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-black" : "mt-4 text-[clamp(2.2rem,4vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white"}>
                    {activeItem.name}
                  </h2>

                  <div className="mt-4">
                    <Link
                      href={getMenuItemHref(activeItem)}
                      className={isLightTheme ? "inline-flex items-center rounded-full bg-[#141414] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/92 lg:px-5 lg:py-3 lg:text-sm lg:tracking-[0.08em]" : "inline-flex items-center rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#07100d] transition hover:bg-white/92 lg:px-5 lg:py-3 lg:text-sm lg:tracking-[0.08em]"}
                    >
                      {"Ver m\u00e1s"}
                    </Link>
                  </div>

                  <div className={isLightTheme ? "mt-5 flex flex-wrap items-center gap-3 text-sm text-black/74" : "mt-5 flex flex-wrap items-center gap-3 text-sm text-white/74"}>
                    <span className={isLightTheme ? "rounded-full border border-[#7cffb8]/35 bg-[#7cffb8]/10 px-3.5 py-2 font-bold text-[#00df81]" : "rounded-full border border-[#7cffb8]/28 bg-[#7cffb8]/10 px-3.5 py-2 font-bold text-[#7cffb8]"}>
                      {formatPrice(activeItem)}
                    </span>
                    {activeItem.pickupEtaMin ? (
                      <span className={isLightTheme ? "inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3.5 py-2" : "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2"}>
                        <Clock3 className="h-4 w-4" />
                        {activeItem.pickupEtaMin} min
                      </span>
                    ) : null}
                    <span className={isLightTheme ? "inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3.5 py-2" : "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2"}>
                      <MapPin className="h-4 w-4" />
                      {activeItem.venue.name}
                    </span>
                  </div>

                  {activeItem.description ? (
                    <p className={isLightTheme ? "mt-6 text-sm leading-7 text-black/58 lg:text-base" : "mt-6 text-sm leading-7 text-white/58 lg:text-base"}>
                      {activeItem.description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 border-t border-black/8 pt-5 md:mt-auto md:pt-6">
                  <div className="flex items-center justify-end gap-4">
                    <p className={isLightTheme ? "text-[11px] uppercase tracking-[0.24em] text-black/34" : "text-[11px] uppercase tracking-[0.24em] text-white/34"}>
                      {activeIndex === null ? 0 : activeIndex + 1} / {filteredItems.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
