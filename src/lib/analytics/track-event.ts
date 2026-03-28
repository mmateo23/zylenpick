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

  const gtag = (window as Window & { gtag?: GtagEvent }).gtag;
  gtag?.("event", eventName, parameters);
}
