"use client";

import posthog, { type Properties } from "posthog-js";

import {
  captureAnalyticsAttribution,
  getAnalyticsAttribution,
} from "@/lib/analytics/track-event";
import { readAnalyticsConsent } from "@/lib/cookies/analytics-consent";

export type PickyaloPostHogEventName =
  | "$pageview"
  | "campana_visitada"
  | "lugar_visto"
  | "shot_visto"
  | "explore_point_opened"
  | "explore_audio_started"
  | "explore_audio_completed"
  | "explore_transcript_opened"
  | "explore_next_point_clicked"
  | "explore_route_completed"
  | "qr_venue_viewed"
  | "qr_product_clicked"
  | "qr_product_opened"
  | "qr_product_closed"
  | "qr_full_selection_clicked"
  | "qr_help_clicked"
  | "qr_sponsor_viewed"
  | "qr_sponsor_clicked"
  | "qr_promo_viewed"
  | "qr_promo_opened"
  | "qr_nearby_clicked"
  | "plato_visto"
  | "local_visto"
  | "add_to_cart"
  | "pedido_confirmado";

type PickyaloEventPropertyValue = string | number | boolean | null | undefined;
type CaptureRetryOptions = {
  dedupeKey?: string;
  retryCount?: number;
};

type PickyaloBaseEventProperties = {
  city_slug?: string;
  venue_id?: string;
  venue_slug?: string;
  venue_name?: string;
  source?: string;
  source_page?: string;
  pathname?: string;
};

export type PlatoVistoProperties = PickyaloBaseEventProperties & {
  item_id?: string;
  item_name?: string;
  item_price?: number;
  item_category?: string | null;
  currency?: string;
};

export type LocalVistoProperties = PickyaloBaseEventProperties;

export type AddToCartProperties = PickyaloBaseEventProperties & {
  item_id?: string;
  item_name?: string;
  item_price?: number;
  item_category?: string | null;
  currency?: string;
  quantity?: number;
  cart_total_items?: number;
};

export type PedidoConfirmadoProperties = PickyaloBaseEventProperties & {
  order_id?: string;
  total_amount?: number;
  total_items?: number;
  item_count?: number;
  currency?: string;
};

export type PageViewProperties = {
  $current_url: string;
  $pathname: string;
  screen_name: string;
  screen_group: string;
};

export type CampanaVisitadaProperties = {
  campaign_name: string;
  campaign_source?: string;
  campaign_medium?: string;
  campaign_content?: string;
  landing_path: string;
};

export type LugarVistoProperties = {
  place_id: string;
  place_name: string;
  place_category: string;
  city_slug?: string;
  source: "mapa";
};

export type ShotVistoProperties = {
  shot_id: string;
  shot_name: string;
  source: "feed" | "interstitial";
};

export type ExploreEventProperties = {
  route_id: string;
  route_slug: string;
  point_id?: string;
  point_slug?: string;
  point_position?: number;
  total_points?: number;
  source: "qr" | "route" | "preview";
};

export type QrVenueEventProperties = {
  venue_id: string;
  venue_slug: string;
  city_slug: string;
  product_id?: string;
  product_name?: string;
  product_category?: string | null;
  product_section?: "specials" | "catalog";
  product_source?: "featured" | "catalog";
  sponsor_id?: string;
  sponsor_name?: string;
  promo_id?: string;
  nearby_id?: string;
  nearby_kind?: "place" | "route";
};

export type PickyaloPostHogEventProperties =
  | PlatoVistoProperties
  | LocalVistoProperties
  | AddToCartProperties
  | PedidoConfirmadoProperties
  | PageViewProperties
  | CampanaVisitadaProperties
  | LugarVistoProperties
  | ShotVistoProperties
  | ExploreEventProperties
  | QrVenueEventProperties
  | (Properties & Record<string, PickyaloEventPropertyValue>);

const capturedOnceKeys = new Set<string>();
const MAX_CAPTURE_RETRIES = 6;
const CAPTURE_RETRY_DELAY_MS = 250;

export function capturePickyaloEvent(
  eventName: PickyaloPostHogEventName,
  properties: PickyaloPostHogEventProperties = {},
  options: CaptureRetryOptions = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  if (isInternalTrackingPath(window.location.pathname)) {
    return;
  }

  if (readAnalyticsConsent() !== "accepted") {
    return;
  }

  const dedupeKey = options.dedupeKey;
  const retryCount = options.retryCount ?? 0;

  if (dedupeKey) {
    const namespacedDedupeKey = `${eventName}:${dedupeKey}`;

    if (capturedOnceKeys.has(namespacedDedupeKey)) {
      return;
    }

    capturedOnceKeys.add(namespacedDedupeKey);
  }

  captureAnalyticsAttribution();

  const eventProperties = cleanPostHogProperties({
    ...getAnalyticsAttribution(),
    pathname: window.location.pathname,
    ...properties,
  });

  if (!posthog.__loaded || posthog.has_opted_out_capturing()) {
    if (retryCount >= MAX_CAPTURE_RETRIES) {
      return;
    }

    window.setTimeout(() => {
      capturePickyaloEvent(eventName, eventProperties, {
        retryCount: retryCount + 1,
      });
    }, CAPTURE_RETRY_DELAY_MS);
    return;
  }

  posthog.capture(eventName, eventProperties);
}

export function capturePageView(properties: PageViewProperties) {
  capturePickyaloEvent("$pageview", properties);
}

export function captureCampanaVisitada(
  properties: CampanaVisitadaProperties,
) {
  capturePickyaloEvent("campana_visitada", properties, {
    dedupeKey: [
      properties.campaign_name,
      properties.campaign_source,
      properties.campaign_medium,
      properties.campaign_content,
      properties.landing_path,
    ].join(":"),
  });
}

export function captureLugarVisto(properties: LugarVistoProperties) {
  capturePickyaloEvent("lugar_visto", properties);
}

export function captureShotVisto(properties: ShotVistoProperties) {
  capturePickyaloEvent("shot_visto", properties);
}

export function captureExploreEvent(
  eventName:
    | "explore_point_opened"
    | "explore_audio_started"
    | "explore_audio_completed"
    | "explore_transcript_opened"
    | "explore_next_point_clicked"
    | "explore_route_completed",
  properties: ExploreEventProperties,
  dedupeKey?: string,
) {
  capturePickyaloEvent(eventName, properties, { dedupeKey });
}

export function captureQrVenueEvent(
  eventName:
    | "qr_venue_viewed"
    | "qr_product_clicked"
    | "qr_product_opened"
    | "qr_product_closed"
    | "qr_full_selection_clicked"
    | "qr_help_clicked"
    | "qr_sponsor_viewed"
    | "qr_sponsor_clicked"
    | "qr_promo_viewed"
    | "qr_promo_opened"
    | "qr_nearby_clicked",
  properties: QrVenueEventProperties,
  dedupeKey?: string,
) {
  capturePickyaloEvent(eventName, properties, { dedupeKey });
}

export function capturePlatoVisto(
  properties: PlatoVistoProperties = {},
) {
  capturePickyaloEvent("plato_visto", properties, {
    dedupeKey: getPlatoVistoDedupeKey(properties),
  });
}

export function captureLocalVisto(
  properties: LocalVistoProperties = {},
) {
  capturePickyaloEvent("local_visto", properties, {
    dedupeKey: getLocalVistoDedupeKey(properties),
  });
}

export function captureAddToCart(
  properties: AddToCartProperties = {},
) {
  capturePickyaloEvent("add_to_cart", properties);
}

export function capturePedidoConfirmado(
  properties: PedidoConfirmadoProperties = {},
) {
  capturePickyaloEvent("pedido_confirmado", properties, {
    dedupeKey: properties.order_id,
  });
}

function isInternalTrackingPath(pathname: string) {
  return (
    pathname.startsWith("/demo") ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/manage") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  );
}

function cleanPostHogProperties(properties: PickyaloPostHogEventProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

function getLocalVistoDedupeKey(properties: LocalVistoProperties) {
  if (typeof window === "undefined") {
    return properties.venue_id ?? properties.venue_slug;
  }

  return `${window.location.pathname}:${properties.venue_id ?? properties.venue_slug ?? "unknown"}`;
}

function getPlatoVistoDedupeKey(properties: PlatoVistoProperties) {
  if (!properties.item_id) {
    return undefined;
  }

  if (typeof window === "undefined") {
    return properties.item_id;
  }

  return `${window.location.pathname}:${properties.item_id}`;
}
