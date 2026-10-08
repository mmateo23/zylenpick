import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  findTransitStopSchedules,
  findDirectTransitJourneys,
  getTransitLineRoutes,
  normalizeTransitStopName,
  isLikelyCurrentService,
  type UrbanosTalaveraDataset,
} from "../src/features/transit/urbanos-talavera";
import {
  mapTransitRouteStops,
  type UrbanosTalaveraMapStop,
} from "../src/features/transit/urbanos-talavera-client";
import { resolveBusCartography, type BusCartographyRoute } from "../src/features/transit/transit-cartography";

const dataset = JSON.parse(
  readFileSync(fileURLToPath(new URL("../public/urbanos-talavera.json", import.meta.url)), "utf8"),
) as UrbanosTalaveraDataset;
const mapStops = (JSON.parse(
  readFileSync(fileURLToPath(new URL("../public/urbanos-talavera-stops.json", import.meta.url)), "utf8"),
) as { paradas: UrbanosTalaveraMapStop[] }).paradas;
const cartography = (JSON.parse(readFileSync(fileURLToPath(new URL("../public/urbanos-talavera-routes.json", import.meta.url)), "utf8")) as { routes: BusCartographyRoute[] }).routes;

describe("Urbanos Talavera stop matching", () => {
  it("normalizes accents, punctuation and PDF note markers without changing the source", () => {
    expect(normalizeTransitStopName("I.E.S. P. Juan de Mariana*")).toBe("i e s p juan de mariana");
    expect(normalizeTransitStopName("Navalcán")).toBe("navalcan");
  });

  it("matches only exact normalized stop names", () => {
    expect(findTransitStopSchedules(dataset, "Navalcan").length).toBeGreaterThan(0);
    expect(findTransitStopSchedules(dataset, "Naval")).toEqual([]);
  });

  it("matches safe Mapbox expansions without using fuzzy text matching", () => {
    const records = findTransitStopSchedules(dataset, "Ambulatorio Plaza del Pan");
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((record) => normalizeTransitStopName(record.originalStopName) === "ambulatorio pza pan")).toBe(true);
  });

  it.each([
    "Ambulatorio de Paseo del Muelle",
    "Avenida Francisco Aguirre",
    "Avenida de Madrid con Calle Fundidores",
    "Barrio Nuestra Señora del Prado",
    "Centro Comercial Los Alfares",
    "I.E.S. Padre Juan de Mariana",
  ])("matches the mapped stop alias %s", (stopName) => {
    expect(findTransitStopSchedules(dataset, stopName).length).toBeGreaterThan(0);
  });

  it("keeps incomplete official records incomplete", () => {
    const records = findTransitStopSchedules(dataset, "I.E.S P. Juan de Mariana");
    expect(records.length).toBeGreaterThan(0);
    expect(records.some((record) => record.times.length === 0)).toBe(true);
  });

  it("applies the combined Saturday/August service to Saturdays throughout the year", () => {
    const service = "SÁBADOS Y LABORABLES DE AGOSTO Y NAVIDAD";
    expect(isLikelyCurrentService(service, new Date("2026-10-10T12:00:00+02:00"))).toBe(true);
    expect(isLikelyCurrentService(service, new Date("2026-10-07T12:00:00+02:00"))).toBe(false);
    expect(isLikelyCurrentService(service, new Date("2026-08-05T12:00:00+02:00"))).toBe(true);
  });

  it("groups variants from the same line, service and direction", () => {
    const records = findTransitStopSchedules(dataset, "Alvarado*");
    const groupKeys = records.map((record) => [record.line, record.days, record.direction].join("|"));
    expect(new Set(groupKeys).size).toBe(groupKeys.length);
  });

  it("derives the real route destination from the ordered official stops", () => {
    const records = findTransitStopSchedules(dataset, "Patrocinio");
    const outbound = records.find((record) => record.line === "1" && record.direction === "IDA");
    const inbound = records.find((record) => record.line === "1" && record.direction === "VUELTA");

    expect(outbound?.destination).toBe("Patrocinio");
    expect(inbound?.destination).toBe("C.C. Los Alfares");
  });

  it("returns the next two official stops in the selected direction", () => {
    const records = findTransitStopSchedules(dataset, "Ronda del Cañillo");
    const outbound = records.find((record) => record.line === "1" && record.direction === "IDA");

    expect(outbound?.nextStops).toEqual(["Carnicerías", "Plaza del Reloj"]);
  });

  it("deduplicates timetable variants into selectable line routes", () => {
    const routes = getTransitLineRoutes(dataset, "1");
    expect(routes.some((route) => route.direction === "IDA" && route.destination === "Patrocinio")).toBe(true);
    expect(routes.some((route) => route.direction === "VUELTA" && route.destination === "C.C. Los Alfares")).toBe(true);
    expect(routes.every((route) => route.stops.length > 2)).toBe(true);
  });

  it("preserves the branches and short services from individual timetable columns", () => {
    const routes = getTransitLineRoutes(dataset, "3");
    expect(routes.some((route) => route.destination === "Paredón")).toBe(true);
    expect(routes.some((route) => route.destination === "Bº Santa María")).toBe(true);
    expect(routes.some((route) => route.origin === "Hospital")).toBe(true);
    const signatures = routes.map((route) => `${route.direction}|${route.stops.join("|")}`);
    expect(new Set(signatures).size).toBe(routes.length);
  });

  it("preserves every published time when separating the timetable into trips", () => {
    Object.values(dataset.lineas).forEach((line) => line.secciones.forEach((section) => {
      section.paradas.forEach((stop) => {
        const times = section.recorridos?.flatMap((trip) => trip.paradas.filter((item) => item.nombre === stop.nombre).flatMap((item) => item.horas)) ?? stop.horas;
        const expected = section.paradas.filter((item) => item.nombre === stop.nombre).flatMap((item) => item.horas);
        expect(Array.from(new Set(times)).sort()).toEqual(Array.from(new Set(expected)).sort());
      });
    }));
  });

  it("has a bus path for each extracted service variant across all six lines", () => {
    Object.keys(dataset.lineas).forEach((line) => getTransitLineRoutes(dataset, line).forEach((route) => {
      const mapped = resolveBusCartography(route, cartography);
      expect(mapped, `${line}: ${route.origin} -> ${route.destination}`).not.toBeNull();
    }));
  });

  it("uses bus-relation platforms in travel order rather than nearest opposite-side stops", () => {
    const routes = getTransitLineRoutes(dataset, "1");
    const outbound = routes.find((route) => route.direction === "IDA" && route.origin === "C. C. Los Alfares")!;
    const inbound = routes.find((route) => route.direction === "VUELTA" && route.origin === "Patrocinio")!;
    const out = resolveBusCartography(outbound, cartography)!;
    const back = resolveBusCartography(inbound, cartography)!;
    expect(out.source).toBe("OpenStreetMap");
    expect(out.coordinates.length).toBeGreaterThan(100);
    expect(out.points.find((point) => point.routeName === "Pablo Picasso")?.id)
      .not.toBe(back.points.find((point) => point.routeName === "Pablo Picasso")?.id);
    expect(out.points.every((point, index) => !index || point.order > out.points[index - 1].order)).toBe(true);
  });

  it.each(["6", "9"])("does not draw an extra lap for circular line %s", (line) => {
    const routes = getTransitLineRoutes(dataset, line);
    routes.forEach((route) => {
      const mapped = resolveBusCartography(route, cartography);
      expect(mapped).not.toBeNull();
      const source = cartography.find((item) => item.id === mapped!.relationId)!;
      expect(mapped!.coordinates.length).toBeLessThanOrEqual(source.coordinates.length);
    });
  });

  it("clips a direct journey to its bus path and never substitutes car directions", () => {
    const journey = findDirectTransitJourneys(dataset, "Ronda del Cañillo", "Patrocinio").find((item) => item.line === "1")!;
    const mapped = resolveBusCartography(journey, cartography)!;
    expect(mapped.points[0].routeName).toBe("Ronda del Cañillo");
    expect(mapped.points.at(-1)?.routeName).toBe("Patrocinio");
    expect(resolveBusCartography({ ...journey, stops: ["No existe", "Patrocinio"] }, cartography)).toBeNull();
  });

  it("does not wrap a short circular service past its actual terminus", () => {
    const short: UrbanosTalaveraDataset = { fuente: "test", extraido: "2026-10-07", lineas: {
      "6": { nombre: "Circular", secciones: [{ dias: "LABORABLES", direccion: null, paradas: [
        { nombre: "A", horas: ["10:00"] }, { nombre: "B", horas: ["10:05"] }, { nombre: "C", horas: ["10:10"] },
      ] }] },
    } };
    expect(findDirectTransitJourneys(short, "C", "B")).toEqual([]);
    expect(findDirectTransitJourneys(short, "A", "C")).toHaveLength(1);
  });

  it("maps an official route to real OSM stop coordinates", () => {
    const route = getTransitLineRoutes(dataset, "1").find((item) => item.direction === "IDA");
    expect(route).toBeDefined();
    const points = mapTransitRouteStops(route!.stops, mapStops);
    expect(points.length).toBeGreaterThan(10);
    expect(points[0].longitude).toBeLessThan(0);
    expect(points.every((point, index) => index === 0 || point.order > points[index - 1].order)).toBe(true);
  });

  it("finds a direct journey and returns only the useful stop segment", () => {
    const journeys = findDirectTransitJourneys(dataset, "Ronda del Cañillo", "Patrocinio");
    const lineOne = journeys.find((journey) => journey.line === "1");
    expect(lineOne).toBeDefined();
    expect(lineOne?.stops[0]).toBe("Ronda del Cañillo");
    expect(lineOne?.stops.at(-1)).toBe("Patrocinio");
    expect(lineOne?.stops.length).toBeLessThan(getTransitLineRoutes(dataset, "1")[0].stops.length);
  });
});
