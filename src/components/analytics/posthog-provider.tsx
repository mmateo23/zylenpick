"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { useEffect, useState, type ReactNode } from "react";

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

  useEffect(() => {
    const debugEnabled = isPostHogDebugEnabled();

    logPostHogDebug(debugEnabled, "PostHog key exists:", Boolean(posthogKey));
    logPostHogDebug(debugEnabled, "PostHog host:", posthogHost);

    if (!posthogKey) {
      return;
    }

    if (!isPostHogInitialized) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: "localStorage",
      });
      isPostHogInitialized = true;
      logPostHogDebug(debugEnabled, "PostHog initialized");
    }

    logPostHogDebug(debugEnabled, "PostHog distinct id:", posthog.get_distinct_id());

    if (debugEnabled && !hasCapturedDebugPing) {
      posthog.capture("posthog_debug_ping", {
        source: "posthog_debug_query",
        url: window.location.href,
      });
      hasCapturedDebugPing = true;
      logPostHogDebug(debugEnabled, "PostHog debug ping captured");
    }

    setIsReady(true);
  }, []);

  if (!posthogKey || !isReady) {
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
