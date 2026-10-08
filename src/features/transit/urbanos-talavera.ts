export type UrbanosTalaveraStop = {
  nombre: string;
  horas: string[];
};

export type UrbanosTalaveraSection = {
  dias: string;
  direccion: string | null;
  paradas: UrbanosTalaveraStop[];
  recorridos?: Array<{ paradas: UrbanosTalaveraStop[] }>;
};

export type UrbanosTalaveraDataset = {
  fuente: string;
  extraido: string;
  lineas: Record<string, {
    nombre: string;
    secciones: UrbanosTalaveraSection[];
  }>;
};

export type TransitStopSchedule = {
  line: string;
  lineName: string;
  days: string;
  direction: string;
  origin: string;
  destination: string;
  originalStopName: string;
  nextStops: string[];
  routeStops: string[];
  stopIndex: number;
  times: string[];
};

export type TransitLineRoute = {
  line: string;
  lineName: string;
  direction: string;
  origin: string;
  destination: string;
  days: string[];
  stops: string[];
  scheduledTrips?: number;
};

export type TransitDirectJourney = TransitLineRoute & {
  boardingStop: string;
  alightingStop: string;
};

export const transitLinePalette: Record<string, {
  background: string;
  foreground: string;
  shadow: string;
}> = {
  "1": { background: "#CF3434", foreground: "#FFF7E8", shadow: "#8F2024" },
  "3": { background: "#F3B6CA", foreground: "#4B1727", shadow: "#C77D98" },
  "4": { background: "#F2C94C", foreground: "#3D2B05", shadow: "#B58B18" },
  "5": { background: "#A77525", foreground: "#FFF7E8", shadow: "#6E4814" },
  "6": { background: "#B9DB57", foreground: "#26320D", shadow: "#78962F" },
  "9": { background: "#17345F", foreground: "#FFF7E8", shadow: "#0C203F" },
};

export function getTransitLinePalette(line: string) {
  return transitLinePalette[line] ?? {
    background: "#741314",
    foreground: "#FFF7E8",
    shadow: "#5F0F10",
  };
}

export function normalizeTransitStopName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/\*/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTransitStopMatchKey(value: string) {
  const expanded = normalizeTransitStopName(value)
    .replace(/\bc c\b/g, "centro comercial")
    .replace(/\bc s\b/g, "centro salud")
    .replace(/\bi e s\b/g, "instituto")
    .replace(/\binst\b/g, "instituto")
    .replace(/\bav(?:da)?\b/g, "avenida")
    .replace(/\bfco\b/g, "francisco")
    .replace(/\bntra\b/g, "nuestra")
    .replace(/\bsra\b/g, "senora")
    .replace(/\burb\b/g, "urbanizacion")
    .replace(/\bpza\b/g, "plaza")
    .replace(/\bctra\b/g, "carretera")
    .replace(/\bb\b/g, "barrio")
    .replace(/\bp muelle\b/g, "paseo muelle")
    .replace(/\bp juan\b/g, "padre juan")
    .replace(/\bj\b/g, "jose")
    .replace(/\bgutemberg\b/g, "gutenberg")
    .replace(/\bbibliotecas\b/g, "biblioteca")
    .replace(/\bceceria\b/g, "cereria");
  const connectors = new Set([
    "avenida",
    "c",
    "calle",
    "carretera",
    "paseo",
    "con",
    "de",
    "del",
    "el",
    "la",
    "las",
    "los",
  ]);

  const key = expanded
    .split(" ")
    .filter((token) => token && !connectors.has(token))
    .join(" ");
  if (key === "estacion autobuses talavera") return "estacion autobuses";
  // The operator's PDF uses the same short name for these two L5 platforms.
  if (key === "poligono torrehierro cruce ceramica" || key === "poligono torrehierro doctor fleming") return "poligono torrehierro";
  return key;
}

export function transitStopNamesMatch(left: string, right: string) {
  const normalizedLeft = normalizeTransitStopName(left);
  const normalizedRight = normalizeTransitStopName(right);
  return normalizedLeft === normalizedRight
    || getTransitStopMatchKey(left) === getTransitStopMatchKey(right);
}

function tripSections(section: UrbanosTalaveraSection): UrbanosTalaveraSection[] {
  if (!section.recorridos?.length) return [section];
  return section.recorridos.map((trip) => ({ dias: section.dias, direccion: section.direccion, paradas: trip.paradas }));
}

export function getTransitLineRoutes(
  dataset: UrbanosTalaveraDataset,
  line: string,
): TransitLineRoute[] {
  const definition = dataset.lineas[line];
  if (!definition) return [];

  const routes = new Map<string, TransitLineRoute>();
  definition.secciones.flatMap(tripSections).forEach((section) => {
    const stops = section.paradas.map((stop) => stop.nombre);
    if (stops.length < 2) return;
    const direction = section.direccion ?? "Circular";
    // A service day can change the stop sequence, not just the timetable.
    const key = `${direction}|${stops.map(normalizeTransitStopName).join("|")}`;
    const existing = routes.get(key);
    if (existing) {
      const days = existing.days.includes(section.dias)
        ? existing.days
        : [...existing.days, section.dias];
      existing.days = days;
      existing.scheduledTrips = (existing.scheduledTrips ?? 0) + (section.paradas[0]?.horas.length ?? 0);
      return;
    }
    routes.set(key, {
      line,
      lineName: definition.nombre,
      direction,
      origin: stops[0] ?? "",
      destination: stops.at(-1) ?? "",
      days: [section.dias],
      stops,
      scheduledTrips: section.paradas[0]?.horas.length ?? 0,
    });
  });
  return Array.from(routes.values()).sort((a, b) => (b.scheduledTrips ?? 0) - (a.scheduledTrips ?? 0));
}

function getRouteSegment(stops: string[], from: string, to: string, circular: boolean) {
  const startIndex = stops.findIndex((stop) => transitStopNamesMatch(stop, from));
  if (startIndex < 0) return null;
  const endIndex = stops.findIndex((stop, index) =>
    index > startIndex && transitStopNamesMatch(stop, to),
  );
  if (endIndex > startIndex) return stops.slice(startIndex, endIndex + 1);
  if (!circular) return null;
  const wrappedEndIndex = stops.findIndex((stop, index) =>
    index < startIndex && transitStopNamesMatch(stop, to),
  );
  if (wrappedEndIndex < 0) return null;
  return [...stops.slice(startIndex), ...stops.slice(1, wrappedEndIndex + 1)];
}

export function findDirectTransitJourneys(
  dataset: UrbanosTalaveraDataset,
  from: string,
  to: string,
): TransitDirectJourney[] {
  if (!from || !to || transitStopNamesMatch(from, to)) return [];
  const journeys = Object.keys(dataset.lineas).flatMap((line) =>
    getTransitLineRoutes(dataset, line).flatMap((route) => {
      // A short service on a circular line can end before completing the loop.
      const circular = transitStopNamesMatch(route.origin, route.destination);
      const stops = getRouteSegment(route.stops, from, to, circular);
      if (!stops || stops.length < 2) return [];
      return [{
        ...route,
        origin: stops[0],
        destination: stops.at(-1)!,
        stops,
        boardingStop: stops[0],
        alightingStop: stops.at(-1)!,
      }];
    }),
  );
  const unique = new Map<string, TransitDirectJourney>();
  for (const journey of journeys) {
    const key = `${journey.line}|${journey.direction}|${journey.stops.join("|")}`;
    const existing = unique.get(key);
    if (existing) existing.days = Array.from(new Set([...existing.days, ...journey.days]));
    else unique.set(key, journey);
  }
  return Array.from(unique.values());
}

function getNextTransitStops(
  stops: UrbanosTalaveraStop[],
  currentIndex: number,
  limit = 2,
) {
  const seen = new Set([normalizeTransitStopName(stops[currentIndex]?.nombre ?? "")]);
  const result: string[] = [];

  for (const stop of stops.slice(currentIndex + 1)) {
    const normalized = normalizeTransitStopName(stop.nombre);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(stop.nombre);
    if (result.length === limit) break;
  }

  return result;
}

export function findTransitStopSchedules(
  dataset: UrbanosTalaveraDataset,
  stopName: string,
): TransitStopSchedule[] {
  const expected = normalizeTransitStopName(stopName);
  if (!expected) return [];

  const sourceNames = new Set<string>();
  Object.values(dataset.lineas).forEach((definition) => {
    definition.secciones.forEach((section) => {
      section.paradas.forEach((stop) => sourceNames.add(normalizeTransitStopName(stop.nombre)));
    });
  });

  let acceptedNames = new Set([expected]);
  if (!sourceNames.has(expected)) {
    const expectedKey = getTransitStopMatchKey(stopName);
    const safeCandidates = Array.from(sourceNames).filter(
      (sourceName) => getTransitStopMatchKey(sourceName) === expectedKey,
    );
    if (safeCandidates.length === 0) return [];
    acceptedNames = new Set(safeCandidates);
  }

  const grouped = new Map<string, TransitStopSchedule>();

  Object.entries(dataset.lineas).forEach(([line, definition]) => {
    definition.secciones.flatMap((section) => {
      const trips = tripSections(section);
      // Keep the official rows without times visible as unconfirmed information.
      const incomplete = section.paradas.filter((stop) => !stop.horas.length);
      return incomplete.length && section.recorridos?.length ? [...trips, { ...section, paradas: incomplete }] : trips;
    }).forEach((section) => {
      section.paradas.forEach((stop, stopIndex) => {
        if (!acceptedNames.has(normalizeTransitStopName(stop.nombre))) return;

        const nextStops = getNextTransitStops(section.paradas, stopIndex);
          const key = [line, section.dias, section.direccion, section.paradas.map((item) => item.nombre).join("|"), stopIndex].join("|");
          const existing = grouped.get(key);
          if (existing) {
            existing.times = Array.from(new Set([...existing.times, ...stop.horas])).sort();
            existing.nextStops = Array.from(new Set([...existing.nextStops, ...nextStops])).slice(0, 2);
            return;
          }
          grouped.set(key, {
            line,
            lineName: definition.nombre,
            days: section.dias,
            direction: section.direccion ?? "Circular",
            origin: section.paradas[0]?.nombre ?? "",
            destination: section.paradas.at(-1)?.nombre ?? "",
            originalStopName: stop.nombre,
            nextStops,
            routeStops: section.paradas.map((routeStop) => routeStop.nombre),
            stopIndex,
            times: [...stop.horas].sort(),
          });
      });
    });
  });

  return Array.from(grouped.values());
}

export function isLikelyCurrentService(days: string, now = new Date()) {
  const madridParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    month: "2-digit",
  }).formatToParts(now);
  const weekday = madridParts.find((part) => part.type === "weekday")?.value;
  const month = madridParts.find((part) => part.type === "month")?.value;
  const normalizedDays = normalizeTransitStopName(days);
  const augustService = normalizedDays.includes("agosto");

  if (weekday === "Sun") return normalizedDays.includes("domingos");
  if (weekday === "Sat") {
    // "Sábados y laborables de agosto" serves Saturdays all year.
    return normalizedDays.includes("sabados");
  }
  if (normalizedDays.includes("domingos")) return false;
  if (normalizedDays.includes("sabados")) return month === "08" && augustService;
  if (!normalizedDays.includes("laborables") && !normalizedDays.includes("lunes a viernes")) return false;
  return month === "08" ? augustService : !augustService;
}

export function getUpcomingTransitTimes(times: string[], now = new Date(), limit = 3) {
  const current = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return times.filter((time) => /^\d{2}:\d{2}$/.test(time) && time >= current).slice(0, limit);
}
