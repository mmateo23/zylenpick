"use client";

export type AnalyticsConsentStatus = "accepted" | "rejected" | null;

export const ANALYTICS_CONSENT_STORAGE_KEY = "pickyalo.analytics-consent";
export const ANALYTICS_CONSENT_UPDATED_EVENT =
  "pickyalo:analytics-consent-updated";

export function readAnalyticsConsent(): AnalyticsConsentStatus {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);

  if (value === "accepted" || value === "rejected") {
    return value;
  }

  return null;
}

export function writeAnalyticsConsent(status: Exclude<AnalyticsConsentStatus, null>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, status);
  window.dispatchEvent(
    new CustomEvent<Exclude<AnalyticsConsentStatus, null>>(
      ANALYTICS_CONSENT_UPDATED_EVENT,
      { detail: status },
    ),
  );
}

export function subscribeAnalyticsConsent(
  callback: (status: AnalyticsConsentStatus) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleConsentUpdate = () => {
    callback(readAnalyticsConsent());
  };

  window.addEventListener(ANALYTICS_CONSENT_UPDATED_EVENT, handleConsentUpdate);
  window.addEventListener("storage", handleConsentUpdate);

  return () => {
    window.removeEventListener(
      ANALYTICS_CONSENT_UPDATED_EVENT,
      handleConsentUpdate,
    );
    window.removeEventListener("storage", handleConsentUpdate);
  };
}
