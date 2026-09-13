export type MapCoordinate = [longitude: number, latitude: number];

export type DiscoveryGeometry =
  | {
      type: "circle";
      center: MapCoordinate;
      radiusKm: number;
    }
  | {
      type: "polygon";
      coordinates: MapCoordinate[];
    };

const earthRadiusKm = 6371;

export function getCoordinateDistanceKm(
  from: MapCoordinate,
  to: MapCoordinate,
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(to[1] - from[1]);
  const longitudeDelta = toRadians(to[0] - from[0]);
  const fromLatitude = toRadians(from[1]);
  const toLatitude = toRadians(to[1]);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

export function createCircleGeometry(
  center: MapCoordinate,
  edge: MapCoordinate,
): DiscoveryGeometry {
  return {
    type: "circle",
    center,
    radiusKm: Math.max(0.02, getCoordinateDistanceKm(center, edge)),
  };
}

export function createPolygonGeometry(
  coordinates: MapCoordinate[],
): DiscoveryGeometry | null {
  if (coordinates.length < 3) return null;
  const first = coordinates[0];
  const last = coordinates.at(-1);
  const closed =
    last && last[0] === first[0] && last[1] === first[1]
      ? coordinates
      : [...coordinates, first];

  return { type: "polygon", coordinates: closed };
}

function createCircleCoordinates(
  center: MapCoordinate,
  radiusKm: number,
  steps = 64,
) {
  const latitudeRadians = (center[1] * Math.PI) / 180;
  const latitudeRadius = radiusKm / 110.574;
  const longitudeRadius = radiusKm / (111.32 * Math.cos(latitudeRadians));

  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = (index / steps) * Math.PI * 2;
    return [
      center[0] + Math.cos(angle) * longitudeRadius,
      center[1] + Math.sin(angle) * latitudeRadius,
    ] as MapCoordinate;
  });
}

export function createDiscoveryAreaData(geometry: DiscoveryGeometry | null) {
  const coordinates = geometry
    ? geometry.type === "circle"
      ? createCircleCoordinates(geometry.center, geometry.radiusKm)
      : geometry.coordinates
    : [];

  return {
    type: "FeatureCollection" as const,
    features:
      coordinates.length >= 4
        ? [
            {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "Polygon" as const,
                coordinates: [coordinates],
              },
            },
          ]
        : [],
  };
}

function isPointInPolygon(point: MapCoordinate, polygon: MapCoordinate[]) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [currentX, currentY] = polygon[index];
    const [previousX, previousY] = polygon[previous];
    const intersects =
      currentY > point[1] !== previousY > point[1] &&
      point[0] <
        ((previousX - currentX) * (point[1] - currentY)) /
          (previousY - currentY) +
          currentX;

    if (intersects) inside = !inside;
  }

  return inside;
}

export function isCoordinateInGeometry(
  coordinate: MapCoordinate,
  geometry: DiscoveryGeometry | null,
) {
  if (!geometry) return true;
  if (geometry.type === "circle") {
    return getCoordinateDistanceKm(geometry.center, coordinate) <= geometry.radiusKm;
  }

  return isPointInPolygon(coordinate, geometry.coordinates);
}
