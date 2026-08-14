export type MapCoordinate = [longitude: number, latitude: number];

export type MapPolygonGeometry = {
  type: "Polygon";
  coordinates: MapCoordinate[][];
};

const MAX_POLYGON_POINTS = 100;

function isCoordinate(value: unknown): value is MapCoordinate {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]) &&
    value[0] >= -180 &&
    value[0] <= 180 &&
    value[1] >= -90 &&
    value[1] <= 90
  );
}

function coordinatesMatch(first: MapCoordinate, second: MapCoordinate) {
  return first[0] === second[0] && first[1] === second[1];
}

export function createPolygonGeometry(
  points: MapCoordinate[],
): MapPolygonGeometry | null {
  if (points.length < 3 || points.length > MAX_POLYGON_POINTS) return null;

  const ring = points.map(([longitude, latitude]) => [
    longitude,
    latitude,
  ]) as MapCoordinate[];
  if (!coordinatesMatch(ring[0], ring[ring.length - 1])) {
    ring.push([...ring[0]] as MapCoordinate);
  }

  return { type: "Polygon", coordinates: [ring] };
}

export function parsePolygonGeometry(value: unknown): MapPolygonGeometry | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as { type?: unknown; coordinates?: unknown };
  if (candidate.type !== "Polygon" || !Array.isArray(candidate.coordinates)) {
    return null;
  }

  const firstRing = candidate.coordinates[0];
  if (!Array.isArray(firstRing)) return null;

  const points = firstRing.filter(isCoordinate);
  const openPoints =
    points.length > 1 && coordinatesMatch(points[0], points[points.length - 1])
      ? points.slice(0, -1)
      : points;

  return createPolygonGeometry(openPoints);
}

export function getPolygonPoints(geometry: MapPolygonGeometry | null) {
  if (!geometry) return [];
  const ring = geometry.coordinates[0] ?? [];
  return ring.length > 1 && coordinatesMatch(ring[0], ring[ring.length - 1])
    ? ring.slice(0, -1)
    : ring;
}

export function getPolygonCenter(geometry: MapPolygonGeometry): MapCoordinate {
  const ring = geometry.coordinates[0];
  let signedArea = 0;
  let longitudeTotal = 0;
  let latitudeTotal = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [longitude, latitude] = ring[index];
    const [nextLongitude, nextLatitude] = ring[index + 1];
    const cross = longitude * nextLatitude - nextLongitude * latitude;
    signedArea += cross;
    longitudeTotal += (longitude + nextLongitude) * cross;
    latitudeTotal += (latitude + nextLatitude) * cross;
  }

  if (Math.abs(signedArea) < Number.EPSILON) {
    const points = getPolygonPoints(geometry);
    const totals = points.reduce(
      (result, [longitude, latitude]) => [
        result[0] + longitude,
        result[1] + latitude,
      ],
      [0, 0] as MapCoordinate,
    );
    return [totals[0] / points.length, totals[1] / points.length];
  }

  return [
    longitudeTotal / (3 * signedArea),
    latitudeTotal / (3 * signedArea),
  ];
}
