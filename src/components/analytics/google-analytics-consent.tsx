"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  type AnalyticsConsentStatus,
} from "@/lib/cookies/analytics-consent";

const GA_MEASUREMENT_ID = "G-CVNZF0EVMY";

type GtagConsentValue = "granted" | "denied";
type GtagFunction = (
  command: "consent",
  action: "update",
  parameters: {
    analytics_storage: GtagConsentValue;
    ad_storage?: GtagConsentValue;
    ad_user_data?: GtagConsentValue;
    ad_personalization?: GtagConsentValue;
  },
) => void;

type GoogleAnalyticsWindow = Window & {
  gtag?: GtagFunction;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

export function GoogleAnalyticsConsent() {
  const [consentStatus, setConsentStatus] =
    useState<AnalyticsConsentStatus>(null);

  useEffect(() => {
    setConsentStatus(readAnalyticsConsent());
    return subscribeAnalyticsConsent(setConsentStatus);
  }, []);

  useEffect(() => {
    const browserWindow = window as unknown as GoogleAnalyticsWindow;

    if (consentStatus === "accepted") {
      browserWindow[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
      browserWindow.gtag?.("consent", "update", {
        analytics_storage: "granted",
      });
      return;
    }

    browserWindow[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    browserWindow.gtag?.("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }, [consentStatus]);

  if (consentStatus !== "accepted") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'update', {
            analytics_storage: 'granted'
          });
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
