"use client";

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt?: number;
};

const USER_LOCATION_STORAGE_KEY = "pickyalo.user-location";
const LEGACY_USER_LOCATION_STORAGE_KEY = "zylenpick.user-location";
const USER_LOCATION_MAX_AGE_MS = 2 * 60 * 60 * 1000;
export const USER_LOCATION_UPDATED_EVENT = "pickyalo:user-location-updated";

export type UserLocationRequestError =
  | "unsupported"
  | "permission-denied"
  | "unavailable"
  | "timeout";

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

function isValidCoordinate(value: unknown, min: number, max: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function normalizeUserLocation(location: UserLocation): UserLocation {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy:
      typeof location.accuracy === "number" && Number.isFinite(location.accuracy)
        ? Math.max(0, Math.round(location.accuracy))
        : undefined,
    capturedAt:
      typeof location.capturedAt === "number" && Number.isFinite(location.capturedAt)
        ? location.capturedAt
        : Date.now(),
  };
}

export function saveUserLocation(location: UserLocation) {
  const normalizedLocation = normalizeUserLocation(location);

  window.localStorage.setItem(
    USER_LOCATION_STORAGE_KEY,
    JSON.stringify(normalizedLocation),
  );
  window.localStorage.removeItem(LEGACY_USER_LOCATION_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent<UserLocation>(USER_LOCATION_UPDATED_EVENT, {
      detail: normalizedLocation,
    }),
  );

  return normalizedLocation;
}

export function readUserLocation(): UserLocation | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue =
    window.localStorage.getItem(USER_LOCATION_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_USER_LOCATION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as UserLocation;

    if (
      !isValidCoordinate(parsedValue.latitude, -90, 90) ||
      !isValidCoordinate(parsedValue.longitude, -180, 180) ||
      typeof parsedValue.capturedAt !== "number" ||
      Date.now() - parsedValue.capturedAt > USER_LOCATION_MAX_AGE_MS
    ) {
      window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_USER_LOCATION_STORAGE_KEY);
      return null;
    }

    return normalizeUserLocation(parsedValue);
  } catch {
    window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_USER_LOCATION_STORAGE_KEY);
    return null;
  }
}

export function requestUserLocation(): Promise<UserLocation> {
  return new Promise<UserLocation>((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject("unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(
          saveUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            capturedAt: position.timestamp || Date.now(),
          }),
        );
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject("permission-denied");
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject("timeout");
          return;
        }

        reject("unavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  });
}

export function getUserLocationErrorMessage(error: unknown) {
  switch (error as UserLocationRequestError) {
    case "permission-denied":
      return "Permiso de ubicación rechazado. Puedes activarlo desde los ajustes del navegador.";
    case "timeout":
      return "La ubicación está tardando demasiado. Comprueba que el GPS esté activo e inténtalo de nuevo.";
    case "unavailable":
      return "No hemos podido obtener tu ubicación actual.";
    default:
      return "Tu navegador no permite usar la ubicación.";
  }
}
