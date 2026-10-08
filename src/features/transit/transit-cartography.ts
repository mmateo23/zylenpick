import { transitStopNamesMatch, type TransitLineRoute } from "./urbanos-talavera";
import type { TransitRouteMapPoint } from "./urbanos-talavera-client";

export type BusCartographyRoute = {
  id: string;
  line: string;
  direction: string;
  service: string;
  coordinates: [number, number][];
  stops: Array<{ id: string; name: string; longitude: number; latitude: number; geometryIndex: number }>;
};

function alignStops(names: string[], stops: BusCartographyRoute["stops"]) {
  const lengths = Array.from({ length: names.length + 1 }, () => new Array<number>(stops.length + 1).fill(0));
  for (let i = names.length - 1; i >= 0; i--) for (let j = stops.length - 1; j >= 0; j--) {
    lengths[i][j] = transitStopNamesMatch(names[i], stops[j].name)
      ? 1 + lengths[i + 1][j + 1] : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
  }
  const matches: Array<{ order: number; stopIndex: number }> = [];
  let i = 0, j = 0;
  while (i < names.length && j < stops.length) {
    if (transitStopNamesMatch(names[i], stops[j].name)) { matches.push({ order: i++, stopIndex: j++ }); }
    else if (lengths[i + 1][j] >= lengths[i][j + 1]) i++;
    else j++;
  }
  return matches;
}

export function resolveBusCartography(route: TransitLineRoute, cartography: BusCartographyRoute[]) {
  const options = cartography.filter((item) => item.line === route.line && item.direction === route.direction).flatMap((item) => {
    const circular = item.direction === "Circular";
    const stops = circular ? [...item.stops, ...item.stops.slice(1).map((stop) => ({ ...stop, geometryIndex: stop.geometryIndex + item.coordinates.length - 1 }))] : item.stops;
    return item.stops.flatMap((stop, start) => {
      if (!transitStopNamesMatch(route.stops[0], stop.name)) return [];
      const window = circular ? stops.slice(start, start + item.stops.length) : stops.slice(start);
      const matches = alignStops(route.stops, window);
      const skipped = matches.length ? matches.at(-1)!.stopIndex - matches[0].stopIndex + 1 - matches.length : window.length;
      return [{ item, stops: window, matches, score: matches.length * 100 - skipped }];
    });
  }).filter((option) => option.matches[0]?.order === 0 && option.matches.at(-1)?.order === route.stops.length - 1)
    .sort((a, b) => b.score - a.score);
  if (!options[0] || options[0].matches.length < 2 || options[0].matches.length / route.stops.length < 0.65) return null;
  const best = options[0];
  const first = best.matches[0], last = best.matches.at(-1)!;
  if (first.order !== 0 || last.order !== route.stops.length - 1) return null;
  const points: TransitRouteMapPoint[] = best.matches.map(({ order, stopIndex }) => ({
    ...best.stops[stopIndex], routeName: route.stops[order], order,
  }));
  const allCoordinates = best.item.direction === "Circular"
    ? [...best.item.coordinates, ...best.item.coordinates.slice(1)] : best.item.coordinates;
  const coordinates = allCoordinates.slice(best.stops[first.stopIndex].geometryIndex, best.stops[last.stopIndex].geometryIndex + 1);
  if (coordinates.length < 2) return null;
  return { coordinates, points, relationId: best.item.id, source: "OpenStreetMap" as const };
}
