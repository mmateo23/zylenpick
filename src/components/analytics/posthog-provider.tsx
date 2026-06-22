"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { useEffect, useState, type ReactNode } from "react";

import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  type AnalyticsConsentStatus,
} from "@/lib/cookies/analytics-consent";

type PostHogProviderProps = {
  children: ReactNode;
};

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const DEFAULT_POSTHOG_KEY = "phc_sJAoJrwhF72JJ8sWufxLFG4vYQvvPYvwgkYiDKkFfdSj";

let isPostHogInitialized = false;
let hasCapturedDebugPing = false;

const posthogKey = getPostHogKey();
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST;

export function PostHogProvider({ children }: PostHogProviderProps) {
  const [isReady, setIsReady] = useState(isPostHogInitialized);
  const [consentStatus, setConsentStatus] =
    useState<AnalyticsConsentStatus>(null);

  useEffect(() => {
    setConsentStatus(readAnalyticsConsent());
    return subscribeAnalyticsConsent(setConsentStatus);
  }, []);

  useEffect(() => {
    const debugEnabled = isPostHogDebugEnabled();

    logPostHogDebug(debugEnabled, "PostHog key exists:", Boolean(posthogKey));
    logPostHogDebug(debugEnabled, "PostHog host:", posthogHost);
    logPostHogDebug(debugEnabled, "PostHog consent:", consentStatus);

    if (!posthogKey || consentStatus !== "accepted") {
      if (consentStatus === "rejected" && isPostHogInitialized) {
        posthog.opt_out_capturing();
        posthog.reset(true);
        setIsReady(false);
        logPostHogDebug(debugEnabled, "PostHog opted out and reset");
      }
      return;
    }

    if (!isPostHogInitialized) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: false,
        capture_pageleave: false,
        persistence: "localStorage",
        autocapture: false,
        disable_session_recording: true,
        mask_all_text: true,
        mask_all_element_attributes: true,
        opt_out_capturing_by_default: true,
        opt_out_persistence_by_default: true,
      });
      isPostHogInitialized = true;
      logPostHogDebug(debugEnabled, "PostHog initialized");
    }

    posthog.opt_in_capturing();
    logPostHogDebug(debugEnabled, "PostHog distinct id:", posthog.get_distinct_id());

    if (debugEnabled && !hasCapturedDebugPing) {
      posthog.capture("posthog_debug_ping", {
        source: "posthog_debug_query",
        pathname: window.location.pathname,
      });
      hasCapturedDebugPing = true;
      logPostHogDebug(debugEnabled, "PostHog debug ping captured");
    }

    setIsReady(true);
  }, [consentStatus]);

  if (!posthogKey || !isReady || consentStatus !== "accepted") {
    return <>{children}</>;
  }

  return (
    <PostHogReactProvider client={posthog}>{children}</PostHogReactProvider>
  );
}

function isPostHogDebugEnabled() {
  if (process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("posthog_debug") === "1";
}

function getPostHogKey() {
  const configuredKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (configuredKey?.startsWith("phc_")) {
    return configuredKey;
  }

  return DEFAULT_POSTHOG_KEY;
}

function logPostHogDebug(enabled: boolean, ...message: unknown[]) {
  if (!enabled) {
    return;
  }

  console.info("[PostHog]", ...message);
}
