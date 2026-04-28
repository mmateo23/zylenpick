import type { Json } from "@/types/database";

export type SiteDesignTextsConfig = {
  globalLabels: {
    viewMenu: string;
    viewDetail: string;
    addForPickup: string;
    prepareForPickup: string;
    directions: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
  };
  cart: {
    emptyTitle: string;
    emptySubtitle: string;
    emptyCta: string;
    filledTitle: string;
    filledSubtitle: string;
    ctaMicrocopy: string;
  };
  success: {
    heroTitle: string;
    heroSubtitle: string;
    nextStepTitle: string;
    nextStepMicrocopy: string;
    primaryCta: string;
  };
};

export type SiteDesignMediaConfig = {
  homeHeroMediaType: "image" | "video";
  homeHeroMediaUrl: string;
  zonesHeroMediaType: "image" | "video";
  zonesHeroMediaUrl: string;
  cartEmptyImageUrl: string;
};

export type SiteDesignZonesConfig = {
  title: string;
  subtitle: string;
  sectionTitle: string;
  cardMicrocopy: string;
  cardCtaLabel: string;
};

export type SiteDesignConfig = {
  texts: SiteDesignTextsConfig;
  media: SiteDesignMediaConfig;
  zones: SiteDesignZonesConfig;
};

export const defaultSiteDesignConfig: SiteDesignConfig = {
  texts: {
    globalLabels: {
      viewMenu: "Ver carta",
      viewDetail: "Ver detalle",
      addForPickup: "Añadir para recoger",
      prepareForPickup: "Preparar para recoger",
      directions: "Cómo llegar",
    },
    home: {
      heroTitle: "Descubre qué comer en segundos",
      heroSubtitle:
        "Platos reales cerca de ti. Elige, pide y recógelo sin complicaciones.",
    },
    cart: {
      emptyTitle: "Elige platos para recoger.",
      emptySubtitle:
        "Tu pedido aparecerá aquí cuando guardes platos desde un local. Después solo tendrás que confirmar la hora de recogida.",
      emptyCta: "Ver zonas",
      filledTitle: "Revisa tu recogida.",
      filledSubtitle:
        "Tu pedido se prepara en el local para que solo tengas que llegar y recoger.",
      ctaMicrocopy:
        "El local prepara tu pedido para recoger a la hora elegida.",
    },
    success: {
      heroTitle: "Tu recogida está en marcha.",
      heroSubtitle:
        "El local ya tiene tu pedido. Ahora solo queda pasar a recogerlo a la hora indicada.",
      nextStepTitle: "Ve al local cuando esté listo.",
      nextStepMicrocopy: "Ten esta pantalla a mano cuando llegues al local.",
      primaryCta: "Cómo llegar",
    },
  },
  media: {
    homeHeroMediaType: "video",
    homeHeroMediaUrl:
      "https://cdn.pixabay.com/video/2024/01/18/197190-904257543_large.mp4",
    zonesHeroMediaType: "video",
    zonesHeroMediaUrl:
      "https://cdn.pixabay.com/video/2018/07/08/17177-278954650_large.mp4",
    cartEmptyImageUrl:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1800&q=80",
  },
  zones: {
    title: "Elige dónde empieza tu próxima recogida.",
    subtitle:
      "Explora zonas activas, entra en cada una y descubre locales preparados para recoger sin complicarte.",
    sectionTitle: "Ciudades preparadas para descubrir locales.",
    cardMicrocopy: "Descubre locales de esta zona.",
    cardCtaLabel: "Ver esta zona",
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeObject<T extends Record<string, unknown>>(
  fallback: T,
  value: unknown,
): T {
  if (!isPlainObject(value)) {
    return fallback;
  }

  const next = { ...fallback };

  for (const [key, fallbackValue] of Object.entries(fallback)) {
    const candidate = value[key];

    if (isPlainObject(fallbackValue)) {
      next[key as keyof T] = mergeObject(
        fallbackValue,
        candidate,
      ) as T[keyof T];
      continue;
    }

    if (typeof candidate === typeof fallbackValue && candidate !== "") {
      next[key as keyof T] = candidate as T[keyof T];
    }
  }

  return next;
}

export function normalizeSiteDesignConfig(rows: Partial<Record<string, Json>>) {
  return {
    texts: mergeObject(defaultSiteDesignConfig.texts, rows.texts),
    media: mergeObject(defaultSiteDesignConfig.media, rows.media),
    zones: mergeObject(defaultSiteDesignConfig.zones, rows.zones),
  };
}
