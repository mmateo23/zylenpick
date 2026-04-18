type AnalyticsParams = Record<string, string | number | boolean | undefined>;

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
      "zylenpick_landing_path",
    );

    if (!storedLandingPath) {
      window.sessionStorage.setItem(
        "zylenpick_landing_path",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    const utmSource = searchParams.get("utm_source");
    const utmCampaign = searchParams.get("utm_campaign");

    if (utmSource) {
      window.sessionStorage.setItem("zylenpick_utm_source", utmSource);
    }

    if (utmCampaign) {
      window.sessionStorage.setItem("zylenpick_utm_campaign", utmCampaign);
    }

    if (document.referrer && !window.sessionStorage.getItem("zylenpick_referrer")) {
      window.sessionStorage.setItem("zylenpick_referrer", document.referrer);
    }
  } catch {
    // Analytics must never block product interactions.
  }
}

function getAnalyticsAttribution(): AnalyticsParams {
  try {
    return {
      landing_path:
        window.sessionStorage.getItem("zylenpick_landing_path") ?? undefined,
      utm_source:
        window.sessionStorage.getItem("zylenpick_utm_source") ?? undefined,
      utm_campaign:
        window.sessionStorage.getItem("zylenpick_utm_campaign") ?? undefined,
      referrer: window.sessionStorage.getItem("zylenpick_referrer") ?? undefined,
    };
  } catch {
    return {};
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
