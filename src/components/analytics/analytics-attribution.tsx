"use client";

import { useEffect } from "react";

import { captureAnalyticsAttribution } from "@/lib/analytics/track-event";

export function AnalyticsAttribution() {
  useEffect(() => {
    captureAnalyticsAttribution();
  }, []);

  return null;
}
