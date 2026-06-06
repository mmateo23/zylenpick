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

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  posthog.capture(eventName, properties);
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
