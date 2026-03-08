"use client";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

const USER_LOCATION_STORAGE_KEY = "zylenpick.user-location";

export function getDistanceInKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((latitudeB - latitudeA) * Math.PI) / 180;
  const longitudeDelta = ((longitudeB - longitudeA) * Math.PI) / 180;
  const normalizedLatitudeA = (latitudeA * Math.PI) / 180;
  const normalizedLatitudeB = (latitudeB * Math.PI) / 180;

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(normalizedLatitudeA) *
      Math.cos(normalizedLatitudeB) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return (
    2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function saveUserLocation(location: UserLocation) {
  window.localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export function readUserLocation(): UserLocation | null {
  const rawValue = window.localStorage.getItem(USER_LOCATION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as UserLocation;

    if (
      typeof parsedValue.latitude !== "number" ||
      typeof parsedValue.longitude !== "number"
    ) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}
