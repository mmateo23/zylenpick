"use client";

import { useEffect } from "react";

import { saveSelectedCity } from "@/features/location/city-preference";

type CityPreferenceSyncProps = {
  city: {
    slug: string;
    name: string;
  };
};

export function CityPreferenceSync({ city }: CityPreferenceSyncProps) {
  useEffect(() => {
    saveSelectedCity(city);
  }, [city]);

  return null;
}
