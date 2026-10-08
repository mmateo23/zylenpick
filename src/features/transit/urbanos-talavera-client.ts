import {
  transitStopNamesMatch,
  type UrbanosTalaveraDataset,
  type TransitLineRoute,
} from "./urbanos-talavera";

export type UrbanosTalaveraMapStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type UrbanosTalaveraMapStopsDataset = {
  fuente: string;
  extraido: string;
  paradas: UrbanosTalaveraMapStop[];
};

export type TransitRouteMapPoint = UrbanosTalaveraMapStop & {
  routeName: string;
  order: number;
};

function distanceSquared(left: UrbanosTalaveraMapStop, right: UrbanosTalaveraMapStop) {
  const latitudeScale = Math.cos(((left.latitude + right.latitude) / 2) * Math.PI / 180);
  const dx = (left.longitude - right.longitude) * latitudeScale;
  const dy = left.latitude - right.latitude;
  return dx * dx + dy * dy;
}

export function mapTransitRouteStops(
  stopNames: string[],
  mapStops: UrbanosTalaveraMapStop[],
): TransitRouteMapPoint[] {
  const groups = stopNames.map((routeName, order) => ({
    routeName,
    order,
    candidates: mapStops.filter((stop) => transitStopNamesMatch(routeName, stop.name)),
  })).filter((group) => group.candidates.length > 0);
  if (groups.length === 0) return [];

  let paths = groups[0].candidates.map((candidate) => ({ cost: 0, path: [candidate] }));
  for (const group of groups.slice(1)) {
    paths = group.candidates.map((candidate) => {
      return paths.reduce<{ cost: number; path: UrbanosTalaveraMapStop[] } | null>((best, previous) => {
        const cost = previous.cost + distanceSquared(previous.path.at(-1)!, candidate);
        return !best || cost < best.cost
          ? { cost, path: [...previous.path, candidate] }
          : best;
      }, null)!;
    });
  }
  const bestPath = paths.reduce((best, current) => current.cost < best.cost ? current : best).path;
  return bestPath.map((stop, index) => ({
    ...stop,
    routeName: groups[index].routeName,
    order: groups[index].order,
  }));
}

let datasetPromise: Promise<UrbanosTalaveraDataset> | null = null;
let mapStopsPromise: Promise<UrbanosTalaveraMapStopsDataset> | null = null;
type MappedBusRoute = { coordinates: [number, number][]; points: TransitRouteMapPoint[]; relationId: string; source: "OpenStreetMap" };
const streetRouteCache = new Map<string, Promise<MappedBusRoute | null>>();

export function loadUrbanosTalaveraDataset() {
  datasetPromise ??= fetch("/urbanos-talavera.json").then((response) => {
    if (!response.ok) throw new Error("Unable to load transit schedules");
    return response.json() as Promise<UrbanosTalaveraDataset>;
  });
  return datasetPromise;
}

export function loadUrbanosTalaveraMapStops() {
  mapStopsPromise ??= fetch("/urbanos-talavera-stops.json").then((response) => {
    if (!response.ok) throw new Error("Unable to load transit stop locations");
    return response.json() as Promise<UrbanosTalaveraMapStopsDataset>;
  });
  return mapStopsPromise;
}

export function loadTransitMappedRoute(route: TransitLineRoute) {
  const cacheKey = [route.line, route.direction, ...route.stops].join("|");
  const cached = streetRouteCache.get(cacheKey);
  if (cached) return cached;
  const request = (async () => {
    const response = await fetch("/api/transit/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line: route.line, direction: route.direction, stops: route.stops }),
    });
    if (!response.ok) return null;
    return response.json() as Promise<MappedBusRoute>;
  })().catch(() => { streetRouteCache.delete(cacheKey); return null; });
  streetRouteCache.set(cacheKey, request);
  return request;
}
