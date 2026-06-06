"use client";

import posthog, { type Properties } from "posthog-js";

export type PickyaloPostHogEventName =
  | "plato_visto"
  | "local_visto"
  | "add_to_cart"
  | "pedido_confirmado";

export type PickyaloPostHogEventProperties = Properties;

export function capturePickyaloEvent(
  eventName: PickyaloPostHogEventName,
  properties: PickyaloPostHogEventProperties = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  if (isInternalTrackingPath(window.location.pathname)) {
    return;
  }

  posthog.capture(
    eventName,
    cleanPostHogProperties({
      pathname: window.location.pathname,
      ...properties,
    }),
  );
}

export function capturePlatoVisto(
  properties: PickyaloPostHogEventProperties = {},
) {
  capturePickyaloEvent("plato_visto", properties);
}

export function captureLocalVisto(
  properties: PickyaloPostHogEventProperties = {},
) {
  capturePickyaloEvent("local_visto", properties);
}

export function captureAddToCart(
  properties: PickyaloPostHogEventProperties = {},
) {
  capturePickyaloEvent("add_to_cart", properties);
}

export function capturePedidoConfirmado(
  properties: PickyaloPostHogEventProperties = {},
) {
  capturePickyaloEvent("pedido_confirmado", properties);
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
