"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock3,
  Info,
  LocateFixed,
  MapPin,
  MoreHorizontal,
  MoveLeft,
  MoveRight,
  Phone,
  Search,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { CartIcon } from "@/components/icons/cart-icon";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { ProductPriceBadge } from "@/components/pricing/product-price-badge";
import { AllergenPictogram } from "@/components/venues/allergen-pictogram";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { addItemToCart } from "@/features/cart/services/cart-storage";
import type { SiteChip } from "@/features/chips/types";
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
import type { CartVenue } from "@/features/cart/types";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { resolveVenueCoordinates } from "@/features/venues/venue-meta";
import {
  captureAddToCart,
  capturePlatoVisto,
  captureShotVisto,
} from "@/lib/analytics/posthog-events";
import { trackEvent } from "@/lib/analytics/track-event";
import { showCartToast, showErrorToast } from "@/lib/ui/toast";

gsap.registerPlugin(useGSAP);

type DemoDishesCarouselProps = {
  items: HomeShowcaseItem[];
  template?: DemoDishesTemplate;
  funnelSettings?: SiteFunnelSettings;
  chips?: SiteChip[];
  heroImageUrl?: string;
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
  emptyTitle: "No hay platos disponibles",
  emptyDescription:
    "En cuanto haya platos con imagen en el showcase, esta demo usara ese contenido real para construir el explorador visual.",
  backLabel: "Volver al inicio",
  backCompactLabel: "Inicio",
  heroEyebrow: "Decide rapido",
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

const SHOT_PROMO_IDS = [
  "sabor-en-video",
  "simpre-fit",
  "huelaa-bbq",
] as const satisfies readonly PromoTileId[];

const DISH_NAVIGATION_SHOT_THRESHOLDS = [5, 12] as const;

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

function getDishHref(item: HomeShowcaseItem) {
  return `${getVenueHref(item)}#plato-${item.id}`;
}

function shouldIgnorePostNavigation(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("a, button, input, textarea, select, [role='button']"))
  );
}

function getCartVenueFromShowcaseItem(item: HomeShowcaseItem): CartVenue {
  return {
    id: item.venue.id,
    slug: item.venue.slug,
    name: item.venue.name,
    citySlug: item.venue.citySlug,
    cityName: item.venue.cityName,
    address: item.venue.address,
    phone: item.venue.phone,
    coverUrl: item.venue.coverUrl,
    pickupEtaMin: item.pickupEtaMin,
    pricesVisible: item.venue.pricesVisible,
  };
}

function getCartItemFromShowcaseItem(item: HomeShowcaseItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    priceAmount: item.priceAmount,
    currency: item.currency,
    priceDisplayMode: item.priceDisplayMode,
    priceDisplayText: item.priceDisplayText,
    imageUrl: item.imageUrl,
  };
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

function getPickupDistanceBadgeLabel(
  item: HomeShowcaseItem,
  userLocation: UserLocation | null,
) {
  const venueCoordinates = resolveVenueCoordinates({
    slug: item.venue.slug,
    latitude: item.venue.latitude,
    longitude: item.venue.longitude,
  });

  if (!userLocation || !venueCoordinates) {
    return "Distancia no disponible";
  }

  return `A ${getVenueDistanceLabel(item, userLocation)}`;
}

function getShortDescription(item: HomeShowcaseItem) {
  return item.description?.trim() || "Plato real de un local cercano.";
}

function isPolloKatsuHeroDish(item: HomeShowcaseItem) {
  const searchableText = [
    item.name,
    item.description ?? "",
    item.categoryName ?? "",
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

  return searchableText.includes("pollo katsu") || searchableText.includes("katsu");
}

function getVenueAvatarLabel(item: HomeShowcaseItem) {
  return item.venue.name.trim().slice(0, 1).toLocaleUpperCase("es");
}

const demoDishVideoUrls = [
  "https://cdn.pixabay.com/video/2024/08/18/227128_large.mp4",
  "https://cdn.pixabay.com/video/2024/08/18/227137_large.mp4",
  "https://cdn.pixabay.com/video/2023/03/08/153818-806178220_large.mp4",
];

const PLATOS_HERO_BURST_LAYERS = [
  {
    src: "/home/assets/asset_pollo_katsu_explosion_transparent.png",
    className: "absolute hidden sm:block",
    height: 460,
    style: {
      right: -116,
      top: -118,
    },
    width: 460,
    initialTransform: "translate3d(-52px, 82px, 0) scale(0.5) rotate(-10deg)",
    hoverTransform: "translate3d(0, 0, 0) scale(1) rotate(10deg)",
    hoverOpacity: 1,
    delay: 0,
  },
  {
    src: "/home/assets/asset_arroz_katsu_explosion_transparent.png",
    className: "absolute hidden sm:block",
    height: 300,
    style: {
      left: -92,
      top: 26,
    },
    width: 300,
    initialTransform: "translate3d(70px, 38px, 0) scale(0.52) rotate(-8deg)",
    hoverTransform: "translate3d(0, 0, 0) scale(1) rotate(-13deg)",
    hoverOpacity: 0.96,
    delay: 90,
  },
  {
    src: "/home/assets/asset_salsa_katsu_explosion_transparent.png",
    className: "absolute hidden sm:block",
    height: 260,
    style: {
      bottom: -58,
      right: -82,
    },
    width: 260,
    initialTransform: "translate3d(-56px, -60px, 0) scale(0.52) rotate(8deg)",
    hoverTransform: "translate3d(0, 0, 0) scale(1) rotate(14deg)",
    hoverOpacity: 0.94,
    delay: 160,
  },
];

function DishVisualMedia({
  item,
  className,
  sizes,
  priority = false,
  fit = "cover",
}: {
  item: HomeShowcaseItem;
  className: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const mediaClassName = `absolute inset-0 h-full w-full object-${fit} ${className}`;

  return (
    <Image
      src={item.imageUrl ?? ""}
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

  return `explore-card group block w-full overflow-hidden rounded-none text-left row-span-3 active:scale-[0.992] sm:rounded-[1rem] lg:h-full ${sizeClassName} ${
    isLightTheme
      ? "bg-[linear-gradient(135deg,rgba(255,250,240,0.96),rgba(245,255,248,0.94),rgba(255,245,214,0.96))] shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      : "bg-[linear-gradient(135deg,rgba(19,30,24,0.96),rgba(11,23,18,0.96),rgba(64,48,18,0.82))] shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
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
        label: "#VideoPick",
        dish: "Selección en movimiento",
        imageUrl: null,
        videoUrl: demoDishVideoUrls[0],
        variant: "standard" as const,
      };
    case "simpre-fit":
      return {
        href: promoHrefs["simpre-fit"],
        label: "#ChefLive",
        dish: "Cocina real",
        imageUrl: null,
        videoUrl: demoDishVideoUrls[1],
        variant: "standard" as const,
      };
    case "huelaa-bbq":
      return {
        href: promoHrefs["huelaa-bbq"],
        label: "#AhoraSeVe",
        dish: "Local en movimiento",
        imageUrl: null,
        videoUrl: demoDishVideoUrls[2],
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

function getPromoShotMetadata(id: PromoTileId) {
  switch (id) {
    case "sabor-en-video":
      return {
        title: "Selección en movimiento",
        venueName: "Pickyalo Shots",
        locationLabel: "Formato vídeo",
        description:
          "Un producto destacado en movimiento para decidir rápido y recoger en local.",
        priceLabel: "Demo",
      };
    case "simpre-fit":
      return {
        title: "Cocina real",
        venueName: "Local destacado",
        locationLabel: "Recogida local",
        description:
          "Una escena breve para ver mejor el producto antes de abrir el detalle real.",
        priceLabel: "Shot",
      };
    case "huelaa-bbq":
      return {
        title: "Local en movimiento",
        venueName: "Escaparate visual",
        locationLabel: "Cerca de ti",
        description:
          "Vídeo corto pensado para productos y platos que necesitan verse en acción.",
        priceLabel: "Nuevo",
      };
    case "mira-que-pollo":
    default:
      return {
        title: "Pollo Asado Entero",
        venueName: "Pickyalo",
        locationLabel: "Para recoger",
        description:
          "Post visual de producto destacado para abrir después como detalle.",
        priceLabel: "Ver",
      };
  }
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
    return `explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName} ring-1 ring-white/14`;
  }

  if (item.isFeatured || item.isHomeFeatured) {
    return `explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName}`;
  }

  if (item.isPickupMonthHighlight) {
    return `explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] lg:row-span-2 lg:h-full ${surfaceClassName}`;
  }

  return `explore-card group block w-full touch-manipulation overflow-hidden rounded-none text-left row-span-2 active:scale-[0.992] sm:rounded-[1rem] ${
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
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(15,79,255,0.34),rgba(116,19,20,0.42),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#0f4fff]/12 bg-[linear-gradient(135deg,rgba(15,79,255,0.08),rgba(116,19,20,0.18))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#1840a8]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-[#153b8d]/56",
          body: "mt-3 text-sm leading-6 text-black/64",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0f4fff]/10 bg-white/72 text-[#153b8d]/44 transition hover:text-[#153b8d]/72",
        }
      : {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#4f86ff]/18 bg-[linear-gradient(160deg,rgba(18,28,58,0.84),rgba(10,26,44,0.9),rgba(65,52,18,0.72))] shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(116,162,255,0.42),rgba(116,19,20,0.46),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#4f86ff]/16 bg-[linear-gradient(135deg,rgba(57,95,196,0.28),rgba(116,19,20,0.14))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#dfe7ff]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-white/42",
          body: "mt-3 text-sm leading-6 text-white/68",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/44 transition hover:text-white/74",
        };
  }

  if (filter === "premium" || filter === "hot") {
    return isLightTheme
      ? {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#ffd766]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,249,236,0.82))] shadow-[0_16px_36px_rgba(0,0,0,0.05)] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,161,47,0.24),rgba(116,19,20,0.42),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#ffd766]/18 bg-[linear-gradient(135deg,rgba(255,186,73,0.12),rgba(255,236,174,0.2))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#8b5d10]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-black/34",
          body: "mt-3 text-sm leading-6 text-black/62",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white/72 text-black/40 transition hover:text-black/70",
        }
      : {
          panel: "overflow-hidden rounded-[1.15rem] border border-[#ffd766]/14 bg-[linear-gradient(180deg,rgba(49,33,8,0.52),rgba(255,255,255,0.04))] backdrop-blur-xl",
          line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,190,88,0.28),rgba(116,19,20,0.44),transparent)]",
          badge: "mt-2 inline-flex rounded-full border border-[#ffd766]/14 bg-[linear-gradient(135deg,rgba(255,183,66,0.12),rgba(255,240,187,0.06))] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#ffe2a6]",
          eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38",
          body: "mt-3 text-sm leading-6 text-white/64",
          close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 transition hover:text-white/70",
        };
  }

  return isLightTheme
    ? {
        panel: "overflow-hidden rounded-[1.15rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.6))] shadow-[0_16px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl",
        line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(15,79,255,0.22),rgba(116,19,20,0.32),transparent)]",
        badge: "mt-2 inline-flex rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-black/62",
        eyebrow: "text-[10px] font-semibold uppercase tracking-[0.24em] text-black/34",
        body: "mt-3 text-sm leading-6 text-black/62",
        close: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white/72 text-black/40 transition hover:text-black/70",
      }
    : {
        panel: "overflow-hidden rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.035))] backdrop-blur-xl",
        line: "h-px w-full bg-[linear-gradient(90deg,transparent,rgba(116,162,255,0.28),rgba(116,19,20,0.38),transparent)]",
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
  funnelSettings = defaultSiteFunnelSettings,
  chips = [],
  heroImageUrl = "https://images.unsplash.com/photo-1778048840966-04589f37c525?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
}: DemoDishesCarouselProps) {
  const searchParams = useSearchParams();
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
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
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
  const touchStartYRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCitySlug, setSelectedCitySlug] = useState<string | null>(null);
  const [curationFilter, setCurationFilter] = useState<CurationFilter>("all");
  const [activeCurationInfo, setActiveCurationInfo] = useState<CurationFilter | null>(null);
  const [activeChipSlug, setActiveChipSlug] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false);
  const [isPostImageFullscreen, setIsPostImageFullscreen] = useState(false);
  const [showDishSwipeHint, setShowDishSwipeHint] = useState(false);
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
  const [isHeroDishBurstActive, setIsHeroDishBurstActive] = useState(false);

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
  const heroPreviewItems = useMemo(
    () => displayItems.filter((item) => Boolean(item.imageUrl)).slice(0, 3),
    [displayItems],
  );
  const heroDishPostItem = useMemo(
    () =>
      displayItems.find(
        (item) => Boolean(item.imageUrl) && isPolloKatsuHeroDish(item),
      ) ??
      heroPreviewItems[0] ??
      null,
    [displayItems, heroPreviewItems],
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
  const baseFilteredItems = useMemo(
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
  const visibleChips = useMemo(() => {
    const availableItemIds = new Set(baseFilteredItems.map((item) => item.id));

    return chips
      .map((chip) => ({
        ...chip,
        itemIds: chip.itemIds.filter((itemId) => availableItemIds.has(itemId)),
      }))
      .filter((chip) => chip.itemIds.length > 0);
  }, [baseFilteredItems, chips]);
  const activeChip = useMemo(
    () => visibleChips.find((chip) => chip.slug === activeChipSlug) ?? null,
    [activeChipSlug, visibleChips],
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
    const promoEntries: FeedEntry[] = SHOT_PROMO_IDS.map((id) => ({
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
  }, [filteredItems, funnelSettings]);
  const itemIndexById = useMemo(
    () =>
      new Map(filteredItems.map((item, index) => [item.id, index] as const)),
    [filteredItems],
  );
  const activeShot = useMemo(() => {
    if (!activeShotId) {
      return null;
    }

    const promo = getPromoTileConfig(activeShotId, content.promoHrefs);
    const metadata = getPromoShotMetadata(activeShotId);

    return {
      ...promo,
      ...metadata,
    };
  }, [activeShotId, content.promoHrefs]);
  const activeShotPosition = activeShotId
    ? SHOT_PROMO_IDS.findIndex((id) => id === activeShotId)
    : -1;

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
  const isLightTheme = true;
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

  const openDishPost = (item: HomeShowcaseItem) => {
    const targetIndex = filteredItems.findIndex(
      (candidate) => candidate.id === item.id,
    );

    if (targetIndex >= 0) {
      setOverlayDirection(1);
      setActiveIndex(targetIndex);
      setPostFeedback(null);
    }
  };

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
      setActiveChipSlug(null);
    }
  }, [activeChip, activeChipSlug]);

  const handleLocationRequest = async () => {
    await activateNearMode();
  };

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

    const href = `${window.location.origin}/platos`;
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

    await navigator.clipboard?.writeText(`${shareText}\n${href}`);
    setShotFeedback("Enlace copiado");
  };

  const handleAddPostToCart = (item: HomeShowcaseItem) => {
    if (!item.venue.pricesVisible) {
      setPostFeedback("El local todavía está confirmando sus precios.");
      return;
    }

    const venue = getCartVenueFromShowcaseItem(item);
    const cartItem = getCartItemFromShowcaseItem(item);
    const trackedItemPrice = getTrackedItemPrice(item);
    const result = addItemToCart({
      venue,
      item: cartItem,
    });

    if (result.status === "conflict") {
      setPostFeedback(`Tu cesta pertenece a ${result.conflictingVenueName}.`);
      showErrorToast({
        title: "Cesta de otro local",
        description: result.conflictingVenueName,
      });
      return;
    }

    captureAddToCart({
      city_slug: venue.citySlug,
      venue_id: venue.id,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: cartItem.id,
      item_name: cartItem.name,
      item_price: trackedItemPrice,
      item_category: item.categoryName,
      currency: cartItem.currency,
      quantity: 1,
      cart_total_items: result.cart.items.reduce(
        (totalItems, resultItem) => totalItems + resultItem.quantity,
        0,
      ),
      source: "platos_post_modal",
    });

    trackEvent("add_to_cart", {
      city_slug: venue.citySlug,
      city_name: venue.cityName,
      venue_id: venue.id,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: cartItem.id,
      item_name: cartItem.name,
      source: "platos_post_modal",
      item_price: trackedItemPrice,
      currency: cartItem.currency,
    });

    setPostFeedback("A\u00f1adido para recoger.");
    showCartToast({
      title: "Añadido a tu cesta",
      description: cartItem.name,
    });
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

      if (!nextThreshold || navigationCount < nextThreshold) return;

      const nextShotId =
        SHOT_PROMO_IDS[injectedShotCountRef.current % SHOT_PROMO_IDS.length];
      injectedShotCountRef.current += 1;
      setActiveShotOrigin("interstitial");
      setShotFeedback(null);
      setIsShotMuted(true);
      setShotDirection(direction);
      setShowShotSwipeHint(true);
      setActiveShotId(nextShotId);
    },
    [activeIndex, filteredItems],
  );

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

    const deltaY = endY - start.y;
    const deltaX = endX - start.x;

    if (Math.abs(deltaY) < 58 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.2) {
      return;
    }

    navigateDish(deltaY < 0 ? 1 : -1);
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

      const currentIndex = SHOT_PROMO_IDS.findIndex((id) => id === current);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex =
        (safeIndex + direction + SHOT_PROMO_IDS.length) % SHOT_PROMO_IDS.length;

      return SHOT_PROMO_IDS[nextIndex];
    });
  }, [activeShotOrigin]);

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
      setIsMobileSheetExpanded(false);
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

  useGSAP(
    () => {
      if (!heroVisualRef.current || heroPreviewItems.length === 0) {
        return;
      }

      const cards = heroVisualRef.current.querySelectorAll(
        "[data-hero-preview-card]",
      );
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.54,
          ease: "power3.out",
          stagger: 0.09,
          delay: 0.08,
        },
      );
    },
    {
      scope: heroVisualRef,
      dependencies: [heroPreviewItems.length],
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
        <div
          className={
            isLightTheme
              ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(116,19,20,0.10),transparent_24%),linear-gradient(180deg,#fcfaf5_0%,#f2ece1_100%)]"
              : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(116,19,20,0.10),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(255,180,93,0.10),transparent_22%),linear-gradient(180deg,rgba(7,16,13,0.68)_0%,rgba(5,7,12,0.76)_100%)]"
          }
        />

        <div className="relative z-10 mx-auto max-w-[1600px]">
          <div className="flex min-h-[min(52svh,31rem)] flex-col">
            <div className="mt-4 flex flex-1 flex-col justify-center sm:mt-6">
              <div className="relative -mx-2 overflow-visible rounded-[2rem] px-4 py-8 sm:-mx-4 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
                <div className="absolute inset-0 -z-10 overflow-hidden rounded-[inherit] bg-[#06100d]">
                  <Image
                    src={heroImageUrl}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-72 saturate-[1.05]"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(253,227,173,0.30)_0%,rgba(253,227,173,0)_100%)]" />
                </div>
                <div className="absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(circle_at_18%_18%,rgba(253,227,173,0.18),transparent_34%),radial-gradient(circle_at_84%_28%,rgba(253,227,173,0.14),transparent_32%),linear-gradient(180deg,rgba(255,247,232,0.08),transparent_42%)]" />
                <div className="absolute inset-0 -z-10 rounded-[inherit] opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.28)_1px,transparent_0)] [background-size:22px_22px]" />
                <div className="absolute inset-x-6 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#741314]/35 to-transparent" />

                <div className="relative z-10 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:grid-cols-[minmax(0,1fr)_minmax(21rem,27rem)] lg:gap-12">
                <div className="max-w-[42rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#741314]">
                    {"CERCA DE TI"}
                  </p>
                  <h1 className="mt-3 max-w-[11ch] text-[clamp(2.75rem,9vw,6.35rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-white drop-shadow-[0_18px_48px_rgba(0,0,0,0.45)] sm:max-w-[10ch]">
                    {"Elige qu\u00e9 te apetece"}
                  </h1>
                  <p className="mt-5 inline-flex max-w-[31rem] rounded-[1.35rem] border border-[#FDE3AD] bg-[#FDE3AD] px-4 py-2.5 text-lg font-semibold leading-7 text-[#741314] shadow-[0_14px_34px_rgba(0,0,0,0.18)] sm:px-5 sm:py-3 sm:text-xl sm:leading-8">
                    {"Mira una selección visual de productos y platos destacados para recoger."}
                  </p>
                </div>

                <div
                  ref={heroVisualRef}
                  className="relative mx-auto min-h-[30rem] w-full max-w-[21rem] overflow-visible md:min-h-[24rem] md:max-w-none lg:min-h-[27rem]"
                >
                  {heroDishPostItem ? (
                    <div
                      className="group absolute right-5 top-1/2 isolate w-full max-w-[19rem] -translate-y-1/2 overflow-visible md:right-8 lg:right-10 lg:max-w-[21rem]"
                      onMouseEnter={() => setIsHeroDishBurstActive(true)}
                      onMouseLeave={() => setIsHeroDishBurstActive(false)}
                      onPointerEnter={() => setIsHeroDishBurstActive(true)}
                      onPointerLeave={() => setIsHeroDishBurstActive(false)}
                    >
                      <div className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(116,19,20,0.16),rgba(169,64,42,0.10)_38%,transparent_72%)] blur-3xl" />
                      {PLATOS_HERO_BURST_LAYERS.map((layer) => (
                        <Image
                          key={layer.src}
                          src={layer.src}
                          alt=""
                          aria-hidden="true"
                          width={layer.width}
                          height={layer.height}
                          className={`pointer-events-none z-0 origin-center object-contain blur-[0.1px] drop-shadow-[0_28px_62px_rgba(0,0,0,0.36)] transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden motion-reduce:transition-none ${layer.className}`}
                          style={{
                            opacity: isHeroDishBurstActive ? layer.hoverOpacity : 0,
                            transitionDelay: `${layer.delay}ms`,
                            transform: isHeroDishBurstActive
                              ? layer.hoverTransform
                              : layer.initialTransform,
                            ...layer.style,
                          }}
                        />
                      ))}

                      <article
                        role="link"
                        tabIndex={0}
                        aria-label={`Ver ficha de ${getDishDisplayName(heroDishPostItem)}`}
                        onClick={(event) => {
                          if (shouldIgnorePostNavigation(event.target)) {
                            return;
                          }

                          openDishPost(heroDishPostItem);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }

                          if (shouldIgnorePostNavigation(event.target)) {
                            return;
                          }

                          event.preventDefault();
                          openDishPost(heroDishPostItem);
                        }}
                        className="relative z-10 flex w-full cursor-pointer flex-col overflow-hidden rounded-[1.8rem] bg-[#f8f7f3] text-[#111111] shadow-[0_34px_84px_rgba(0,0,0,0.52),0_0_70px_rgba(116,19,20,0.12)] transition duration-500 hover:scale-[1.035] motion-safe:animate-[heroPlateFloat_9s_ease-in-out_infinite]"
                      >
                        <header className="flex items-center justify-between gap-3 px-3.5 py-3">
                          <Link
                            href={getVenueHref(heroDishPostItem)}
                            className="flex min-w-0 items-center gap-3"
                          >
                            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-sm font-semibold text-white">
                              {heroDishPostItem.venue.logoUrl ? (
                                <Image
                                  src={heroDishPostItem.venue.logoUrl}
                                  alt={heroDishPostItem.venue.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                getVenueAvatarLabel(heroDishPostItem)
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold leading-4">
                                {heroDishPostItem.venue.name}
                              </span>
                              <span className="block truncate text-xs leading-4 text-[#6f6f6f]">
                                {getVenueDistanceLabel(heroDishPostItem, userLocation)}
                              </span>
                            </span>
                          </Link>
                          <Link
                            href={getVenueHref(heroDishPostItem)}
                            aria-label="Ver local"
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Link>
                        </header>

                        <Link
                          href={getDishHref(heroDishPostItem)}
                          className="block shrink-0"
                        >
                          <div className="relative h-[12rem] overflow-hidden bg-[#141414] lg:h-[13.5rem]">
                            <Image
                              src={heroDishPostItem.imageUrl ?? ""}
                              alt={heroDishPostItem.name}
                              fill
                              sizes="(max-width: 1024px) 19rem, 21rem"
                              className="object-cover object-center transition duration-700 hover:scale-[1.025]"
                              priority
                            />
                          </div>
                        </Link>

                        <section className="space-y-2.5 px-3.5 pb-4 pt-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={getDishHref(heroDishPostItem)}
                                aria-label="Ver detalle del plato"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                              >
                                <Info className="h-5 w-5" />
                              </Link>
                              <Link
                                href={getDishHref(heroDishPostItem)}
                                aria-label="Compartir plato"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                              >
                                <Send className="h-5 w-5" />
                              </Link>
                            </div>
                            <Link
                              href={getDishHref(heroDishPostItem)}
                              aria-label="Añadir para recoger"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#741314] text-[#FDE3AD] shadow-[0_14px_30px_rgba(116,19,20,0.30)] transition hover:bg-[#FDE3AD]"
                            >
                              <CartIcon size={24} />
                            </Link>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-3">
                              <h2 className="line-clamp-2 min-w-0 text-lg font-semibold leading-5 tracking-[-0.04em] text-[#111111]">
                                {getDishDisplayName(heroDishPostItem)}
                              </h2>
                              <span className="shrink-0 rounded-full bg-[#741314] px-3 py-1.5 text-sm font-bold text-[#FDE3AD]">
                                {formatPrice(heroDishPostItem)}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-sm leading-5 text-[#5f5f5f]">
                              {getShortDescription(heroDishPostItem)}
                            </p>
                            <span className="inline-flex rounded-full bg-[#111111]/[0.06] px-3 py-1.5 text-xs font-medium text-[#4a4a4a]">
                              {heroDishPostItem.pickupEtaMin
                                ? `Listo en ${heroDishPostItem.pickupEtaMin} min`
                                : "Listo para recoger"}
                            </span>
                          </div>
                        </section>
                      </article>
                    </div>
                  ) : null}
                </div>
                </div>
                <div className="relative z-10 mt-8 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-5 sm:mt-9 sm:pt-6">
                  {["R\u00e1pido", "Selección visual", "Para recoger", "Locales reales"].map((label) => (
                    <span
                      key={label}
                      className={isLightTheme ? "rounded-full border border-[#FDE3AD]/82 bg-[#FDE3AD]/92 px-2.5 py-1.5 text-[10px] font-bold text-[#FDE3AD] shadow-[0_8px_18px_rgba(0,0,0,0.16)] backdrop-blur-md sm:px-3 sm:py-2 sm:text-xs" : "rounded-full border border-white/12 bg-white/[0.055] px-2.5 py-1.5 text-[10px] font-bold text-[#FDE3AD] shadow-[0_8px_18px_rgba(0,0,0,0.14)] backdrop-blur-md transition hover:border-[#741314]/30 hover:bg-[#741314]/10 hover:text-[#FDE3AD] sm:px-3 sm:py-2 sm:text-xs"}
                    >
                      {label}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleLocationRequest}
                    disabled={isLocating}
                    aria-pressed={Boolean(userLocation)}
                    aria-describedby={locationFeedback ? "location-status" : undefined}
                    className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE3AD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#741314] disabled:cursor-wait disabled:opacity-70 sm:min-h-10 sm:px-4 sm:py-2 sm:text-xs ${
                      userLocation
                        ? "border-[#B9DFC5] bg-[#E7F4EA] text-[#245C38] hover:bg-[#DDF0E3]"
                        : "border-[#FDE3AD] bg-[#FFF7E8] text-[#741314] hover:bg-white"
                    }`}
                  >
                    <LocateFixed aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {isLocating
                      ? "Calculando distancia…"
                      : userLocation
                        ? "Más cerca primero"
                        : "Ordenar por cercanía"}
                    {userLocation && !isLocating ? (
                      <span className="sr-only">
                        . Pulsa para actualizar tu ubicación
                      </span>
                    ) : null}
                  </button>
                  {locationFeedback ? (
                    <p
                      id="location-status"
                      className="basis-full text-xs font-semibold leading-5 text-white/85"
                      role="status"
                      aria-live="polite"
                    >
                      {locationFeedback}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 sm:mt-10 lg:mt-12">
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

              <div className="mt-7 space-y-5 pb-4 sm:mt-9 sm:space-y-6 sm:pb-5">
                <div className="space-y-2">
                  <p className={isLightTheme ? "text-[10px] font-semibold uppercase tracking-[0.22em] text-black/38" : "text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38"}>
                    Qué plan llevas hoy
                  </p>
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
                              ? "rounded-full border border-[#741314]/55 bg-[linear-gradient(135deg,rgba(14,88,255,0.24),rgba(116,19,20,0.16),rgba(116,19,20,0.26))] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#fff3c4] shadow-[0_10px_30px_rgba(0,86,255,0.18)] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                              : isLightTheme
                                ? "rounded-full border border-[#741314]/28 bg-[linear-gradient(135deg,rgba(34,93,255,0.08),rgba(116,19,20,0.1))] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#1742b0] transition hover:border-[#741314]/45 hover:bg-[linear-gradient(135deg,rgba(34,93,255,0.12),rgba(116,19,20,0.14))] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-[#741314]/32 bg-[linear-gradient(135deg,rgba(33,74,196,0.22),rgba(116,19,20,0.12))] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#dce6ff] transition hover:border-[#741314]/48 hover:bg-[linear-gradient(135deg,rgba(33,74,196,0.28),rgba(116,19,20,0.18))] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                            : isActive
                              ? isLightTheme
                                ? "rounded-full border border-[#741314]/28 bg-[#741314]/12 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#A9402A] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-[#741314]/28 bg-[#741314]/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#741314] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                              : isLightTheme
                                ? "rounded-full border border-[#741314]/22 bg-white/54 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-black/58 transition hover:border-[#741314]/38 hover:bg-white/78 sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-[#741314]/26 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white/54 transition hover:border-[#741314]/42 hover:bg-white/[0.07] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                        }
                      >
                        {filterOption.label}
                      </button>
                    );
                  })}
                  </div>
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

                {visibleChips.length > 0 ? (
                  <div className="space-y-2">
                    <p className={isLightTheme ? "text-[10px] font-semibold uppercase tracking-[0.22em] text-black/38" : "text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38"}>
                      Destacados ahora
                    </p>
                    <div className="flex flex-wrap gap-2 pb-1">
                    <button
                      type="button"
                      onClick={() => setActiveChipSlug(null)}
                      className={
                        activeChipSlug === null
                          ? isLightTheme
                            ? "rounded-full border border-[#741314]/42 bg-[#141414] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-white transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                            : "rounded-full border border-[#741314]/42 bg-white px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#07100d] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                          : isLightTheme
                            ? "rounded-full border border-[#741314]/22 bg-white/54 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-black/58 transition hover:border-[#741314]/38 hover:bg-white/78 sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                            : "rounded-full border border-[#741314]/26 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white/54 transition hover:border-[#741314]/42 hover:bg-white/[0.07] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                      }
                    >
                      Todos los platos
                    </button>
                    {visibleChips.map((chip) => {
                      const isActive = activeChipSlug === chip.slug;

                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() =>
                            setActiveChipSlug((current) =>
                              current === chip.slug ? null : chip.slug,
                            )
                          }
                          className={
                            isActive
                              ? isLightTheme
                                ? "rounded-full border border-[#741314]/28 bg-[#741314]/12 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#A9402A] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-[#741314]/28 bg-[#741314]/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#741314] transition sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                              : isLightTheme
                                ? "rounded-full border border-[#741314]/22 bg-white/54 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-black/58 transition hover:border-[#741314]/38 hover:bg-white/78 sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                                : "rounded-full border border-[#741314]/26 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white/54 transition hover:border-[#741314]/42 hover:bg-white/[0.07] sm:shrink-0 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
                          }
                        >
                          {chip.name}
                        </button>
                      );
                    })}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className={isLightTheme ? "text-[10px] font-semibold uppercase tracking-[0.22em] text-black/38" : "text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38"}>
                    Busca por antojo
                  </p>
                  <div className="flex flex-wrap gap-2 pb-1">
                  <button type="button" onClick={() => setCategoryFilter("all")} className={categoryFilter === "all" ? (isLightTheme ? "rounded-full border border-[#741314]/42 bg-[#141414] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-[#741314]/42 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#07100d] transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]") : (isLightTheme ? "rounded-full border border-[#741314]/22 bg-white/54 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-black/52 transition hover:border-[#741314]/38 hover:bg-white/78 sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-[#741314]/26 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/52 transition hover:border-[#741314]/42 hover:bg-white/[0.07] sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]")}>
                    Todas
                  </button>
                  {categoryOptions.map((category) => {
                    const isActive = categoryFilter === category;
                    return (
                      <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={isActive ? (isLightTheme ? "rounded-full border border-[#741314]/40 bg-[#741314]/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9402A] transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-[#741314]/40 bg-[#741314]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#741314] transition sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]") : (isLightTheme ? "rounded-full border border-[#741314]/22 bg-white/54 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-black/52 transition hover:border-[#741314]/38 hover:bg-white/78 sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]" : "rounded-full border border-[#741314]/26 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/52 transition hover:border-[#741314]/42 hover:bg-white/[0.07] sm:shrink-0 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]")}>
                        {category}
                      </button>
                    );
                  })}
                  </div>
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
            <>
              <div id="platos-feed" className="-mx-1.5 mt-5 grid grid-cols-2 auto-rows-[8.8rem] gap-1.5 sm:mx-0 sm:mt-8 sm:auto-rows-[9.6rem] sm:gap-2.5 md:grid-cols-3 md:auto-rows-[7.2rem] lg:auto-rows-[10.2rem] lg:grid-flow-dense lg:gap-3 xl:auto-rows-[11.4rem]">
                {feedEntries.map((entry, index) => {
                if (entry.type === "promo") {
                  const promo = getPromoTileConfig(entry.id, content.promoHrefs);

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
                        {promo.videoUrl ? (
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.04),rgba(4,7,11,0.1)_42%,rgba(4,7,11,0.48))]" />
                        ) : null}
                        <div className="relative z-[1] flex h-full w-full flex-col justify-end px-1 py-1 text-left transition-opacity duration-400 ease-out">
                          <div>
                            <p className="line-clamp-2 text-[0.82rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[1rem]">
                              {promo.dish}
                            </p>
                            <p className="mt-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#741314]">
                              {promo.label}
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

                if (itemIndex === undefined) {
                  return null;
                }

                if (entry.type === "featured") {
                  return (
                    <article
                      key={`featured-${item.id}`}
                      className={getExploreCardClassName(item, index, isLightTheme, true)}
                    >
                      <div className="relative h-full overflow-hidden rounded-[inherit]">
                        <button
                          type="button"
                          onClick={() => {
                            setOverlayDirection(1);
                            setActiveIndex(itemIndex);
                          }}
                          className="absolute inset-0"
                          aria-label={`Abrir ${item.name}`}
                        >
                          <DishVisualMedia
                            item={item}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="transition duration-500 group-hover:scale-[1.035]"
                          />
                          <div className={isLightTheme ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02)_30%,rgba(12,14,16,0.54))]" : "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.01),rgba(4,7,11,0.08)_34%,rgba(4,7,11,0.48))]"} />
                        </button>
                        <div className="pointer-events-none absolute left-2 top-2 z-[2] inline-flex rounded-full border border-white/16 bg-black/24 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/82 backdrop-blur-xl sm:left-2.5 sm:top-2.5 sm:px-2.5">
                          Destacado
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] p-2.5 text-right sm:hidden">
                          <div className="ml-auto max-w-[84%]">
                            <p className="line-clamp-2 text-[0.82rem] font-extrabold leading-[1.04] tracking-[-0.035em] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]">
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
                    </article>
                  );
                }

                return (
                  <button key={item.id} type="button" onClick={() => {
                    setOverlayDirection(1);
                    setActiveIndex(itemIndex);
                  }} className={getExploreCardClassName(item, index, isLightTheme)} aria-label={`Abrir ${item.name}`}>
                    <div className="relative h-full overflow-hidden rounded-[inherit]">
                      <DishVisualMedia
                        item={item}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="transition duration-500 group-hover:scale-[1.035]"
                      />
                      <div className={isLightTheme ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02)_38%,rgba(12,14,16,0.34))]" : "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.01),rgba(4,7,11,0.06)_40%,rgba(4,7,11,0.28))]"} />
                      <div className={getHoverGlassClassName(item)} />
                      <div className="pointer-events-none absolute left-2 top-2 z-[3] rounded-full border border-[#FDE3AD]/70 bg-[#741314] px-2 py-1 text-[0.6rem] font-bold leading-none text-[#FDE3AD] shadow-[0_8px_20px_rgba(116,19,20,0.28)] sm:hidden">
                        {getPickupDistanceBadgeLabel(item, userLocation)}
                      </div>
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
                          <p className="line-clamp-2 text-[0.82rem] font-extrabold leading-[1.04] tracking-[-0.035em] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]">
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
            <button type="button" onClick={handleScrollTop} className={isLightTheme ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/72 text-black/70 backdrop-blur-xl transition hover:bg-white" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/76 backdrop-blur-xl transition hover:bg-white/[0.09]"} aria-label="Subir arriba">
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
                    {activeShotOrigin === "interstitial" ? "Shot recomendado" : "Shot"}
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
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FDE3AD]/32 bg-[#FFF7E8]/90 text-[#741314] shadow-[0_10px_32px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:bg-[#FFF7E8] motion-reduce:transition-none"
                aria-label="Cerrar Shot"
              >
                <X className="h-7 w-7" />
              </button>
            </header>

            {activeShotOrigin !== "interstitial" && activeShotPosition >= 0 ? (
              <div
                className="absolute left-1/2 top-[max(1.25rem,env(safe-area-inset-top))] z-[5] flex w-24 -translate-x-1/2 gap-1.5 sm:w-32"
                aria-label={`Shot ${activeShotPosition + 1} de ${SHOT_PROMO_IDS.length}`}
              >
                {SHOT_PROMO_IDS.map((id, index) => (
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
                <button
                  type="button"
                  onClick={() =>
                    setShotFeedback(
                      "La ficha completa estará disponible cuando este Shot se conecte desde el panel.",
                    )
                  }
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#FDE3AD]/32 bg-[#FFF7E8]/12 px-4 text-xs font-bold text-[#FFF7E8] backdrop-blur-md transition hover:bg-[#FFF7E8]/20 motion-reduce:transition-none"
                >
                  <Info className="h-4 w-4" />
                  Ver detalle
                </button>
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
                onClick={() =>
                  setShotFeedback(
                    "La cesta se activará cuando este Shot esté conectado a un producto real.",
                  )
                }
                className="group flex min-h-[3.7rem] w-full flex-col items-center justify-center gap-1 text-[#FFF7E8]"
                aria-label="Añadir a cesta"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FDE3AD]/34 bg-[#741314] text-[#FDE3AD] shadow-[0_12px_34px_rgba(0,0,0,0.28)] transition group-hover:scale-105 motion-reduce:transition-none sm:h-14 sm:w-14">
                  <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                <span className="text-[9px] font-bold leading-none text-[#FFF7E8]/82 sm:text-[10px]">
                  Cesta
                </span>
              </button>
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
              <button
                type="button"
                onClick={() =>
                  setShotFeedback(
                    "La ficha completa estará disponible cuando este Shot se conecte desde el panel.",
                  )
                }
                className="group flex min-h-[3.7rem] w-full flex-col items-center justify-center gap-1 text-[#FFF7E8]"
                aria-label="Ver información del Shot"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FDE3AD]/32 bg-[#FFF7E8]/14 text-[#FFF7E8] shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur-md transition group-hover:scale-105 group-hover:bg-[#FFF7E8]/22 motion-reduce:transition-none sm:h-14 sm:w-14">
                  <Info className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span className="text-[9px] font-bold leading-none text-[#FFF7E8]/82 sm:text-[10px]">
                  Detalle
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
          className="dish-overlay fixed inset-0 z-50 flex touch-pan-x items-center justify-center bg-black/72 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:p-6"
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
            aria-label="Cerrar plato"
            onClick={() => setActiveIndex(null)}
          />

          <article className="dish-overlay-panel relative z-10 mx-auto flex h-[min(94svh,52rem)] w-full max-w-[29rem] flex-col overflow-hidden rounded-[1.65rem] bg-white text-[#111111] shadow-[0_28px_90px_rgba(0,0,0,0.34)] md:max-w-[31rem]">
            <header className="flex items-center justify-between gap-3 border-b border-black/8 bg-white px-4 py-3">
              <Link
                href={getVenueHref(activeItem)}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#111111] text-sm font-semibold text-white">
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
                  <span className="block truncate text-sm font-semibold leading-5 text-[#111111]">
                    {activeItem.venue.name}
                  </span>
                  <span className="block truncate text-xs leading-4 text-[#6f6f6f]">
                    {getVenueDistanceLabel(activeItem, userLocation)}
                  </span>
                </span>
              </Link>

              <div className="flex items-center gap-1.5">
                <Link
                  href={getVenueHref(activeItem)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
                  aria-label="Ver local"
                >
                  <MoreHorizontal className="h-6 w-6" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
                  aria-label="Cerrar"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </header>

            <button
              type="button"
              onClick={() => setIsPostImageFullscreen(true)}
              className="dish-overlay-image relative min-h-0 w-full flex-1 overflow-hidden bg-[#101010]"
              aria-label="Ver imagen del plato en grande"
            >
              {activeItem.imageUrl ? (
                <DishVisualMedia
                  item={activeItem}
                  sizes="(max-width: 640px) 100vw, 31rem"
                  className=""
                  priority
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center px-6 text-sm text-white/70">
                  Imagen no disponible
                </span>
              )}
              {showDishSwipeHint ? (
                <span
                  className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex justify-center"
                  role="status"
                >
                  <span className="inline-flex max-w-full flex-col items-center rounded-2xl border border-[#FDE3AD]/55 bg-[#381932]/92 px-4 py-2.5 text-center text-[#FFF7E8] shadow-[0_12px_32px_rgba(0,0,0,0.34)] backdrop-blur-md">
                    <span className="flex items-center gap-2 text-[11px] font-extrabold">
                      <ChevronUp className="h-4 w-4 text-[#FED47D] motion-safe:animate-pulse" aria-hidden="true" />
                      <span className="sm:hidden">Desliza para ver otro plato</span>
                      <span className="hidden sm:inline">Usa ↑ ↓ o la rueda</span>
                      <ChevronDown className="h-4 w-4 text-[#FED47D] motion-safe:animate-pulse" aria-hidden="true" />
                    </span>
                    <span className="mt-1 text-[9px] font-semibold text-[#FFF7E8]/72">
                      Arriba: siguiente · Abajo: anterior
                    </span>
                  </span>
                </span>
              ) : null}
            </button>

            <section className="dish-overlay-copy-desktop max-h-[19rem] shrink-0 overflow-y-auto bg-white px-4 pb-4 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                {activeItem.categoryName ? (
                  <span className="inline-flex min-h-8 items-center rounded-full border border-[#741314]/24 bg-[#FFF7E8] px-3 text-[11px] font-extrabold text-[#741314]">
                    {activeItem.categoryName}
                  </span>
                ) : null}
                {activeItem.pickupEtaMin ? (
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#381932]/10 bg-[#F7F4F1] px-3 text-[11px] font-semibold text-[#381932]/72">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {activeItem.pickupEtaMin} min
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-xl font-semibold leading-6 text-[#111111]">
                  {getDishDisplayName(activeItem)}
                </h2>
                <ProductPriceBadge
                  priceAmount={activeItem.priceAmount}
                  currency={activeItem.currency}
                  priceDisplayMode={activeItem.priceDisplayMode}
                  priceDisplayText={activeItem.priceDisplayText}
                  pricesVisible={activeItem.venue.pricesVisible}
                  className="shrink-0 shadow-none"
                />
              </div>

              {activeItem.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-5 text-[#5f5f5f]">
                  {getShortDescription(activeItem)}
                </p>
              ) : null}

              <details className="group mt-3 rounded-[0.75rem] border border-[#741314]/14 bg-[#FFF7E8]/72 open:bg-[#FFF7E8]">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 text-xs font-bold text-[#381932] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#741314] [&::-webkit-details-marker]:hidden">
                  <span>
                    Alérgenos
                    {activeItem.allergens.length > 0 ? ` · ${activeItem.allergens.length}` : " · Pendiente"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#741314] transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <div className="border-t border-[#741314]/10 px-3 py-3">
                  {activeItem.allergens.length > 0 ? (
                    <>
                      <p className="text-[11px] font-medium leading-4 text-[#381932]/68">
                        Puede contener o presentar trazas de:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {activeItem.allergens.map((allergen) => (
                          <AllergenPictogram key={allergen} allergen={allergen} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs font-medium leading-5 text-[#381932]/64">
                      Información pendiente. Consulta al local antes de elegir si tienes alergias o intolerancias.
                    </p>
                  )}
                </div>
              </details>

              {postFeedback ? (
                <p className="mt-3 rounded-[0.65rem] bg-[#381932]/6 px-3 py-2 text-xs font-medium leading-4 text-[#303030]" role="status">
                  {postFeedback}
                </p>
              ) : null}

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/8 pt-3">
                <div className="flex items-center gap-1">
                  <Link
                    href={getVenueHref(activeItem)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-[#381932] transition hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
                  >
                    <Info className="h-4 w-4" aria-hidden="true" />
                    Ver local
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleShareDish(activeItem)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#381932] transition hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
                    aria-label="Compartir plato"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                {activeItem.venue.pricesVisible ? (
                  <button
                    type="button"
                    onClick={() => handleAddPostToCart(activeItem)}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#741314] px-4 text-xs font-bold text-[#FDE3AD] shadow-[0_10px_24px_rgba(116,19,20,0.24)] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
                    aria-label="Añadir para recoger"
                  >
                    <CartIcon className="h-5 w-5" />
                    Añadir
                  </button>
                ) : activeItem.venue.phone ? (
                  <a
                    href={`tel:${activeItem.venue.phone}`}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#741314] px-4 text-xs font-bold text-[#FDE3AD] shadow-[0_10px_24px_rgba(116,19,20,0.24)] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
                    aria-label={`Llamar a ${activeItem.venue.name}`}
                  >
                    <Phone className="h-5 w-5" aria-hidden="true" />
                    Llamar
                  </a>
                ) : (
                  <Link
                    href={getVenueHref(activeItem)}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#741314] px-4 text-xs font-bold text-[#FDE3AD] shadow-[0_10px_24px_rgba(116,19,20,0.24)] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
                  >
                    <Info className="h-5 w-5" aria-hidden="true" />
                    Ver local
                  </Link>
                )}
              </div>
            </section>
          </article>

          {isPostImageFullscreen ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black p-4">
              <button
                type="button"
                onClick={() => setIsPostImageFullscreen(false)}
                className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition hover:bg-white/18"
                aria-label="Cerrar imagen"
              >
                <X className="h-6 w-6" />
              </button>
              {activeItem.imageUrl ? (
                <DishVisualMedia
                  item={activeItem}
                  sizes="100vw"
                  className=""
                  fit="contain"
                  priority
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {activeItem ? (
        <div className="hidden">
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
                      {getDishDisplayName(activeItem)}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                      <span className={isLightTheme ? "rounded-full border border-[#741314]/35 bg-[#741314]/10 px-3 py-1.5 text-sm font-bold text-[#741314]" : "rounded-full border border-[#741314]/28 bg-[#741314]/10 px-3 py-1.5 text-sm font-bold text-[#741314]"}>
                        {formatPrice(activeItem)} · {getDecisionSignal(activeItem)}
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
                      <span>{activeItem.venue.name} · {getVenueDistanceLabel(activeItem, userLocation)}</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMobileSheetExpanded(true)}
                          className={isLightTheme ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-black/72 transition hover:bg-black/[0.08]" : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/72 transition hover:bg-white/[0.09]"}
                          aria-label="Ver informacion del plato"
                        >
                          <Info className="h-6 w-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleShareDish(activeItem)}
                          className={isLightTheme ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-black/72 transition hover:bg-black/[0.08]" : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/72 transition hover:bg-white/[0.09]"}
                          aria-label="Compartir plato"
                        >
                          <Send className="h-6 w-6" />
                        </button>
                      </div>
                      {activeItem.venue.pricesVisible ? (
                        <AddToCartButton
                          venue={getCartVenueFromShowcaseItem(activeItem)}
                          item={getCartItemFromShowcaseItem(activeItem)}
                          label={"A\u00f1adir para recoger"}
                          source="platos_modal"
                          className="w-full"
                          buttonClassName={isLightTheme ? "inline-flex w-full items-center justify-center rounded-full bg-[#141414] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black/92" : "inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#07100d] transition hover:bg-white/92"}
                          feedbackClassName={isLightTheme ? "mt-2 text-xs leading-5 text-black/58" : "mt-2 text-xs leading-5 text-white/58"}
                        />
                      ) : activeItem.venue.phone ? (
                        <a
                          href={`tel:${activeItem.venue.phone}`}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#741314] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#FDE3AD] transition hover:bg-[#5F0F10]"
                          aria-label={`Llamar a ${activeItem.venue.name}`}
                        >
                          <Phone className="h-5 w-5" aria-hidden="true" />
                          Llamar
                        </a>
                      ) : null}
                      <Link
                        href={getVenueHref(activeItem)}
                        className={isLightTheme ? "inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-black/[0.04] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/72 transition hover:bg-black/[0.08]" : "inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/72 transition hover:bg-white/[0.09]"}
                      >
                        Ver más
                      </Link>
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
                        {hasActiveVenueNavigation ? (
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
                              <MoveLeft className="h-6 w-6" />
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
                              <MoveRight className="h-6 w-6" />
                            </button>
                          </div>
                        ) : null}
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

                {hasActiveVenueNavigation ? (
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
                      <MoveLeft className="h-7 w-7" />
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
                      <MoveRight className="h-7 w-7" />
                    </button>
                  </div>
                ) : null}
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
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <h2 className={isLightTheme ? "mt-4 text-[clamp(2.2rem,4vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-black" : "mt-4 text-[clamp(2.2rem,4vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white"}>
                    {getDishDisplayName(activeItem)}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-start gap-3">
                    <button
                      type="button"
                      className={isLightTheme ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-black/72 transition hover:bg-black/[0.08]" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/72 transition hover:bg-white/[0.09]"}
                      aria-label="Información del plato"
                    >
                      <Info className="h-7 w-7" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShareDish(activeItem)}
                      className={isLightTheme ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-black/72 transition hover:bg-black/[0.08]" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/72 transition hover:bg-white/[0.09]"}
                      aria-label="Compartir plato"
                    >
                      <Send className="h-7 w-7" />
                    </button>
                    {activeItem.venue.pricesVisible ? (
                      <AddToCartButton
                        venue={getCartVenueFromShowcaseItem(activeItem)}
                        item={getCartItemFromShowcaseItem(activeItem)}
                        label={"A\u00f1adir para recoger"}
                        source="platos_modal"
                        className="min-w-[13rem]"
                        buttonClassName={isLightTheme ? "inline-flex items-center rounded-full bg-[#141414] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/92 lg:px-5 lg:py-3 lg:text-sm lg:tracking-[0.08em]" : "inline-flex items-center rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#07100d] transition hover:bg-white/92 lg:px-5 lg:py-3 lg:text-sm lg:tracking-[0.08em]"}
                        feedbackClassName={isLightTheme ? "mt-2 max-w-[16rem] text-xs leading-5 text-black/58" : "mt-2 max-w-[16rem] text-xs leading-5 text-white/58"}
                      />
                    ) : activeItem.venue.phone ? (
                      <a
                        href={`tel:${activeItem.venue.phone}`}
                        className="inline-flex min-h-11 min-w-[13rem] items-center justify-center gap-2 rounded-full bg-[#741314] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#FDE3AD] transition hover:bg-[#5F0F10]"
                        aria-label={`Llamar a ${activeItem.venue.name}`}
                      >
                        <Phone className="h-5 w-5" aria-hidden="true" />
                        Llamar
                      </a>
                    ) : null}
                    <Link
                      href={getVenueHref(activeItem)}
                      className={isLightTheme ? "inline-flex items-center rounded-full border border-black/10 bg-black/[0.04] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-black/72 transition hover:bg-black/[0.08] lg:px-5 lg:py-3 lg:text-sm lg:tracking-[0.08em]" : "inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:bg-white/[0.09] lg:px-5 lg:py-3 lg:text-sm lg:tracking-[0.08em]"}
                    >
                      Ver más
                    </Link>
                  </div>

                  <div className={isLightTheme ? "mt-5 flex flex-wrap items-center gap-3 text-sm text-black/74" : "mt-5 flex flex-wrap items-center gap-3 text-sm text-white/74"}>
                    <span className={isLightTheme ? "rounded-full border border-[#741314]/35 bg-[#741314]/10 px-3.5 py-2 font-bold text-[#741314]" : "rounded-full border border-[#741314]/28 bg-[#741314]/10 px-3.5 py-2 font-bold text-[#741314]"}>
                      {formatPrice(activeItem)} · {getDecisionSignal(activeItem)}
                    </span>
                    {activeItem.pickupEtaMin ? (
                      <span className={isLightTheme ? "inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3.5 py-2" : "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2"}>
                        <Clock3 className="h-4 w-4" />
                        {activeItem.pickupEtaMin} min
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#FDE3AD]/70 bg-[#741314] px-3.5 py-2 text-[#FDE3AD]">
                      <MapPin className="h-4 w-4" />
                      {activeItem.venue.name} · {getVenueDistanceLabel(activeItem, userLocation)}
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
                    {hasActiveVenueNavigation ? (
                      <p className={isLightTheme ? "text-[11px] uppercase tracking-[0.24em] text-black/34" : "text-[11px] uppercase tracking-[0.24em] text-white/34"}>
                        {activeVenuePosition + 1} / {activeVenueItems.length}
                      </p>
                    ) : null}
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




