"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { useEffect, useState, type ReactNode } from "react";

type PostHogProviderProps = {
  children: ReactNode;
};

let isPostHogInitialized = false;

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function PostHogProvider({ children }: PostHogProviderProps) {
  const [isReady, setIsReady] = useState(isPostHogInitialized);

  useEffect(() => {
    if (!posthogKey) {
      return;
    }

    if (!isPostHogInitialized) {
      posthog.init(posthogKey, {
        ...(posthogHost ? { api_host: posthogHost } : {}),
        capture_pageview: true,
        capture_pageleave: true,
        persistence: "localStorage",
      });
      isPostHogInitialized = true;
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
