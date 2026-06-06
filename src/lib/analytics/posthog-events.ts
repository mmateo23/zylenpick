"use client";

import posthog, { type Properties } from "posthog-js";

export type PickyaloPostHogEventName =
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

export type PickyaloPostHogEventProperties =
  | PlatoVistoProperties
  | LocalVistoProperties
  | AddToCartProperties
  | PedidoConfirmadoProperties
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

  const dedupeKey = options.dedupeKey;
  const retryCount = options.retryCount ?? 0;

  if (dedupeKey) {
    const namespacedDedupeKey = `${eventName}:${dedupeKey}`;

    if (capturedOnceKeys.has(namespacedDedupeKey)) {
      return;
    }

    capturedOnceKeys.add(namespacedDedupeKey);
  }

  const eventProperties = cleanPostHogProperties({
    pathname: window.location.pathname,
    ...properties,
  });

  if (!posthog.__loaded) {
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
