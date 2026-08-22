import { readAnalyticsConsent } from "@/lib/cookies/analytics-consent";

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

export type AnalyticsAttribution = {
  landing_path?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_id?: string;
  referrer?: string;
};

const ATTRIBUTION_STORAGE_KEYS = {
  landing_path: "pickyalo_landing_path",
  utm_source: "pickyalo_utm_source",
  utm_medium: "pickyalo_utm_medium",
  utm_campaign: "pickyalo_utm_campaign",
  utm_content: "pickyalo_utm_content",
  utm_term: "pickyalo_utm_term",
  utm_id: "pickyalo_utm_id",
  referrer: "pickyalo_referrer",
} as const;

type GtagEvent = (
  command: "event",
  eventName: string,
  parameters: AnalyticsParams,
) => void;

export function trackEvent(eventName: string, parameters: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  if (isInternalTrackingPath(window.location.pathname)) {
    return;
  }

  if (readAnalyticsConsent() !== "accepted") {
    return;
  }

  captureAnalyticsAttribution();

  const gtag = (window as Window & { gtag?: GtagEvent }).gtag;
  gtag?.("event", eventName, cleanAnalyticsParams({
    ...getAnalyticsAttribution(),
    ...parameters,
  }));
}

export function captureAnalyticsAttribution() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const storedLandingPath = window.sessionStorage.getItem(
      ATTRIBUTION_STORAGE_KEYS.landing_path,
    );

    if (!storedLandingPath) {
      window.sessionStorage.setItem(
        ATTRIBUTION_STORAGE_KEYS.landing_path,
        window.location.pathname,
      );
    }

    const campaignParameters = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_id",
    ] as const;

    campaignParameters.forEach((parameter) => {
      const value = sanitizeAttributionValue(searchParams.get(parameter));
      if (value) {
        window.sessionStorage.setItem(
          ATTRIBUTION_STORAGE_KEYS[parameter],
          value,
        );
      }
    });

    if (
      document.referrer &&
      !window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.referrer)
    ) {
      const referrer = getSafeReferrer(document.referrer);
      if (referrer) {
        window.sessionStorage.setItem(
          ATTRIBUTION_STORAGE_KEYS.referrer,
          referrer,
        );
      }
    }
  } catch {
    // Analytics must never block product interactions.
  }
}

export function getAnalyticsAttribution(): AnalyticsAttribution {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return {
      landing_path:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.landing_path) ??
        undefined,
      utm_source:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.utm_source) ??
        window.sessionStorage.getItem("zylenpick_utm_source") ??
        undefined,
      utm_medium:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.utm_medium) ??
        undefined,
      utm_campaign:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.utm_campaign) ??
        window.sessionStorage.getItem("zylenpick_utm_campaign") ??
        undefined,
      utm_content:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.utm_content) ??
        undefined,
      utm_term:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.utm_term) ??
        undefined,
      utm_id:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.utm_id) ??
        undefined,
      referrer:
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEYS.referrer) ??
        getSafeReferrer(
          window.sessionStorage.getItem("zylenpick_referrer") ?? "",
        ) ??
        undefined,
    };
  } catch {
    return {};
  }
}

function sanitizeAttributionValue(value: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 160) : null;
}

function getSafeReferrer(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.hostname.slice(0, 160);
  } catch {
    return null;
  }
}

function isInternalTrackingPath(pathname: string) {
  return (
    pathname.startsWith("/demo") ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  );
}

function cleanAnalyticsParams(parameters: AnalyticsParams) {
  return Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined),
  ) as AnalyticsParams;
}
