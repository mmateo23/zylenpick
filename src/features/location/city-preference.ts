"use client";

export type StoredCity = {
  slug: string;
  name: string;
};

export const SELECTED_CITY_STORAGE_KEY = "zylenpick.selected-city";
export const SELECTED_CITY_UPDATED_EVENT = "zylenpick:selected-city-updated";

export function readSelectedCity(): StoredCity | null {
  const rawValue = window.localStorage.getItem(SELECTED_CITY_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as StoredCity;

    if (
      typeof parsedValue.slug !== "string" ||
      typeof parsedValue.name !== "string"
    ) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

export function saveSelectedCity(city: StoredCity) {
  window.localStorage.setItem(SELECTED_CITY_STORAGE_KEY, JSON.stringify(city));
  window.dispatchEvent(new CustomEvent(SELECTED_CITY_UPDATED_EVENT, { detail: city }));
}
