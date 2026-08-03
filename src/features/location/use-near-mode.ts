"use client";

import { useCallback, useEffect, useState } from "react";

import {
  clearUserLocation,
  getUserLocationErrorMessage,
  readUserLocation,
  requestUserLocation,
  USER_LOCATION_UPDATED_EVENT,
  type UserLocation,
} from "@/features/location/browser-location";

export function useNearMode() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const syncLocation = () => setLocation(readUserLocation());
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "pickyalo.user-location" ||
        event.key === "zylenpick.user-location"
      ) {
        syncLocation();
      }
    };

    syncLocation();
    window.addEventListener(USER_LOCATION_UPDATED_EVENT, syncLocation);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(USER_LOCATION_UPDATED_EVENT, syncLocation);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const activate = useCallback(async () => {
    setIsLocating(true);
    setFeedback("Buscando tu ubicación…");

    try {
      const nextLocation = await requestUserLocation();
      setLocation(nextLocation);
      setFeedback("Cerca de ti activado.");
      return nextLocation;
    } catch (error) {
      setFeedback(getUserLocationErrorMessage(error));
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  const disable = useCallback(() => {
    clearUserLocation();
    setLocation(null);
    setFeedback("Cerca de ti desactivado.");
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return {
    location,
    isActive: Boolean(location),
    isLocating,
    feedback,
    activate,
    disable,
    clearFeedback,
  };
}
