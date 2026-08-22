"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  captureCampanaVisitada,
  capturePageView,
} from "@/lib/analytics/posthog-events";
import {
  captureAnalyticsAttribution,
  getAnalyticsAttribution,
} from "@/lib/analytics/track-event";
import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  type AnalyticsConsentStatus,
} from "@/lib/cookies/analytics-consent";

export function PostHogPageView() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<AnalyticsConsentStatus>(null);
  const lastPageView = useRef<string | null>(null);

  useEffect(() => {
    setConsent(readAnalyticsConsent());
    return subscribeAnalyticsConsent(setConsent);
  }, []);

  useEffect(() => {
    if (consent !== "accepted" || isInternalPath(pathname)) return;

    captureAnalyticsAttribution();

    const pageSignature = `${pathname}${window.location.search}`;
    if (lastPageView.current === pageSignature) return;
    lastPageView.current = pageSignature;

    const screen = getScreenContext(pathname);
    capturePageView({
      $current_url: window.location.href,
      $pathname: pathname,
      ...screen,
    });

    const attribution = getAnalyticsAttribution();
    const currentCampaign = new URLSearchParams(window.location.search).get(
      "utm_campaign",
    );
    if (currentCampaign && attribution.utm_campaign) {
      captureCampanaVisitada({
        campaign_name: attribution.utm_campaign,
        campaign_source: attribution.utm_source,
        campaign_medium: attribution.utm_medium,
        campaign_content: attribution.utm_content,
        landing_path: pathname,
      });
    }
  }, [consent, pathname]);

  return null;
}

function getScreenContext(pathname: string) {
  if (pathname === "/") return { screen_name: "home", screen_group: "discovery" };
  if (pathname === "/platos") return { screen_name: "platos", screen_group: "food" };
  if (pathname.startsWith("/mapa")) return { screen_name: "mapa", screen_group: "city" };
  if (pathname === "/zonas") return { screen_name: "zonas", screen_group: "city" };
  if (/^\/zonas\/[^/]+\/venues\/[^/]+/.test(pathname)) {
    return { screen_name: "local", screen_group: "venue" };
  }
  if (pathname.startsWith("/zonas/")) {
    return { screen_name: "zona", screen_group: "city" };
  }
  if (pathname.startsWith("/cart")) return { screen_name: "cesta", screen_group: "order" };
  if (pathname.startsWith("/pedidos")) return { screen_name: "pedidos", screen_group: "order" };
  if (pathname.startsWith("/checkout/success")) {
    return { screen_name: "pedido_confirmado", screen_group: "order" };
  }
  if (pathname.startsWith("/unete")) return { screen_name: "unete", screen_group: "business" };
  if (pathname.startsWith("/el-proyecto")) {
    return { screen_name: "proyecto", screen_group: "brand" };
  }
  if (pathname.startsWith("/verificacion")) {
    return { screen_name: "verificacion", screen_group: "trust" };
  }
  return { screen_name: "otra", screen_group: "public" };
}

function isInternalPath(pathname: string) {
  return (
    pathname.startsWith("/panel") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  );
}
