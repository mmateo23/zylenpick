"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { useEffect, useState, type ReactNode } from "react";

type PostHogProviderProps = {
  children: ReactNode;
};

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

let isPostHogInitialized = false;

const rawPostHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const rawPostHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function PostHogProvider({ children }: PostHogProviderProps) {
  const [isReady, setIsReady] = useState(isPostHogInitialized);

  useEffect(() => {
    const debugEnabled = isPostHogDebugEnabled();
    const posthogConfig = resolvePostHogConfig();

    logPostHogDebug(debugEnabled, "PostHog key exists:", Boolean(posthogConfig.key));
    logPostHogDebug(debugEnabled, "PostHog host:", posthogConfig.host);

    if (posthogConfig.wasSwapped) {
      logPostHogDebug(
        debugEnabled,
        "PostHog env vars look swapped. Using corrected runtime config.",
      );
    }

    if (!posthogConfig.key) {
      return;
    }

    if (!isPostHogInitialized) {
      posthog.init(posthogConfig.key, {
        api_host: posthogConfig.host,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: "localStorage",
      });
      isPostHogInitialized = true;
      logPostHogDebug(debugEnabled, "PostHog initialized");
    }

    logPostHogDebug(debugEnabled, "PostHog distinct id:", posthog.get_distinct_id());
    setIsReady(true);
  }, []);

  if (!resolvePostHogConfig().key || !isReady) {
    return <>{children}</>;
  }

  return (
    <PostHogReactProvider client={posthog}>{children}</PostHogReactProvider>
  );
}

function resolvePostHogConfig() {
  const keyLooksLikeHost = rawPostHogKey?.startsWith("http");
  const hostLooksLikeKey = rawPostHogHost?.startsWith("phc_");

  if (keyLooksLikeHost && hostLooksLikeKey) {
    return {
      key: rawPostHogHost,
      host: rawPostHogKey,
      wasSwapped: true,
    };
  }

  return {
    key: rawPostHogKey,
    host: rawPostHogHost ?? DEFAULT_POSTHOG_HOST,
    wasSwapped: false,
  };
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

function logPostHogDebug(enabled: boolean, ...message: unknown[]) {
  if (!enabled) {
    return;
  }

  console.info("[PostHog]", ...message);
}
