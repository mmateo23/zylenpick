"use client";

import { sileo, type SileoOptions, type SileoPosition } from "sileo";

type ToastPayload = {
  title: string;
  description?: string;
};

function getToastPosition(): SileoPosition {
  if (typeof window === "undefined") {
    return "bottom-right";
  }

  return window.matchMedia("(max-width: 767px)").matches
    ? "bottom-center"
    : "bottom-right";
}

function showToast(options: SileoOptions) {
  if (typeof window === "undefined") {
    return null;
  }

  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const normalizedTitle =
    isMobile || !options.description
      ? options.title
      : `${options.title ?? ""} · ${options.description}`.trim();

  return sileo.show({
    duration: 4200,
    fill: "#fffdf5",
    roundness: 18,
    position: getToastPosition(),
    ...options,
    title: normalizedTitle,
    description: undefined,
    autopilot: false,
  });
}

export function showSuccessToast({ title, description }: ToastPayload) {
  return showToast({
    type: "success",
    title,
    description,
  });
}

export function showErrorToast({ title, description }: ToastPayload) {
  return showToast({
    type: "error",
    title,
    description,
    duration: 5600,
  });
}

export function showInfoToast({ title, description }: ToastPayload) {
  return showToast({
    type: "info",
    title,
    description,
  });
}

export function showCartToast({ title, description }: ToastPayload) {
  return showToast({
    type: "success",
    title,
    description,
  });
}

export function showOrderToast({ title, description }: ToastPayload) {
  return showToast({
    type: "success",
    title,
    description,
    duration: 5200,
  });
}
