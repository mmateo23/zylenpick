import { NextRequest, NextResponse } from "next/server";

import type { MapArtResponse } from "@/features/map-art/types";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
};

type OverpassElement = {
  type: "way";
  tags?: {
    highway?: string;
  };
  geometry?: Array<{
    lat: number;
    lon: number;
  }>;
};

const USER_AGENT = "FknFood map art studio (contact: studio@zylenpick.com)";
const EXCLUDED_HIGHWAYS =
  "footway|path|cycleway|steps|track|corridor|bridleway|proposed|construction";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildSquareBounds(result: NominatimResult) {
  const lat = Number(result.lat);
  const lon = Number(result.lon);

  const [southRaw, northRaw, westRaw, eastRaw] = result.boundingbox ?? [
    String(lat - 0.04),
    String(lat + 0.04),
    String(lon - 0.04),
    String(lon + 0.04),
  ];

  const south = Number(southRaw);
  const north = Number(northRaw);
  const west = Number(westRaw);
  const east = Number(eastRaw);

  const latSpan = Math.abs(north - south);
  const lonSpan = Math.abs(east - west);
  const span = clamp(Math.max(latSpan, lonSpan) * 1.15, 0.08, 0.12);

  return {
    center: { lat, lon },
    north: lat + span / 2,
    south: lat - span / 2,
    east: lon + span / 2,
    west: lon - span / 2,
  };
}

function normalizePoint(
  lat: number,
  lon: number,
  bounds: { north: number; south: number; east: number; west: number },
) {
  const width = bounds.east - bounds.west || 1;
  const height = bounds.north - bounds.south || 1;

  return {
    x: ((lon - bounds.west) / width) * 1000,
    y: (1 - (lat - bounds.south) / height) * 1000,
  };
}

function geometryToPath(
  geometry: Array<{ lat: number; lon: number }>,
  bounds: { north: number; south: number; east: number; west: number },
) {
  if (geometry.length < 2) {
    return null;
  }

  const points = geometry.map((point) =>
    normalizePoint(point.lat, point.lon, bounds),
  );

  return points.reduce((path, point, index) => {
    const command = index === 0 ? "M" : "L";
    return `${path}${command}${point.x.toFixed(2)} ${point.y.toFixed(2)} `;
  }, "");
}

function getGeometryBounds(
  geometry: Array<{ lat: number; lon: number }>,
  bounds: { north: number; south: number; east: number; west: number },
) {
  const normalizedPoints = geometry.map((point) =>
    normalizePoint(point.lat, point.lon, bounds),
  );

  return normalizedPoints.reduce(
    (accumulator, point) => ({
      minX: Math.min(accumulator.minX, point.x),
      minY: Math.min(accumulator.minY, point.y),
      maxX: Math.max(accumulator.maxX, point.x),
      maxY: Math.max(accumulator.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );
}

function getRoadKind(highway: string | undefined): "primary" | "secondary" | "local" | null {
  if (!highway) {
    return null;
  }

  if (["motorway", "trunk", "primary", "motorway_link", "trunk_link", "primary_link"].includes(highway)) {
    return "primary";
  }

  if (["secondary", "tertiary", "secondary_link", "tertiary_link"].includes(highway)) {
    return "secondary";
  }

  if (
    [
      "residential",
      "living_street",
      "unclassified",
      "service",
      "pedestrian",
    ].includes(highway)
  ) {
    return "local";
  }

  return null;
}

function getPolylineLength(geometry: Array<{ lat: number; lon: number }>) {
  let total = 0;

  for (let index = 1; index < geometry.length; index += 1) {
    const previous = geometry[index - 1];
    const current = geometry[index];
    const dx = current.lon - previous.lon;
    const dy = current.lat - previous.lat;
    total += Math.sqrt(dx * dx + dy * dy);
  }

  return total;
}

async function fetchLocation(query: string) {
  const executeSearch = async (searchQuery: string) => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "es,en;q=0.8",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      throw new Error("No se ha podido geocodificar la ubicación.");
    }

    const results = (await response.json()) as NominatimResult[];
    return results[0] ?? null;
  };

  const candidates = [
    query,
    query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    query.split(",")[0]?.trim() ?? query,
    (query.split(",")[0]?.trim() ?? query)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  for (const candidate of candidates) {
    const result = await executeSearch(candidate);

    if (result) {
      return result;
    }
  }

  return null;
}

async function fetchLocationByCoordinates(lat: number, lon: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "14");

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "es,en;q=0.8",
      "User-Agent": USER_AGENT,
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error("No se ha podido localizar tu posición.");
  }

  const payload = (await response.json()) as {
    display_name?: string;
  };

  return {
    display_name: payload.display_name ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    lat: String(lat),
    lon: String(lon),
  } satisfies NominatimResult;
}

async function fetchRoads(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLon = (bounds.east + bounds.west) / 2;
  const initialSpan = Math.max(bounds.north - bounds.south, bounds.east - bounds.west);
  const spans = [initialSpan, initialSpan * 0.78, initialSpan * 0.62].map(
    (span) => clamp(span, 0.05, 0.12),
  );

  for (const span of spans) {
    const query = `
      [out:json][timeout:12];
      (
        way["highway"]["highway"!~"${EXCLUDED_HIGHWAYS}"](${centerLat - span / 2},${centerLon - span / 2},${centerLat + span / 2},${centerLon + span / 2});
      );
      out geom;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "User-Agent": USER_AGENT,
      },
      body: query,
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      continue;
    }

    const responseText = await response.text();

    if (!responseText.trim().startsWith("{")) {
      continue;
    }

    let payload: {
      elements?: OverpassElement[];
    };

    try {
      payload = JSON.parse(responseText) as {
        elements?: OverpassElement[];
      };
    } catch {
      continue;
    }

    const elements = payload.elements ?? [];

    if (elements.length > 0) {
      return elements;
    }
  }

  throw new Error("No se ha podido descargar la cartografía.");
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("location")?.trim();
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");
  const latitude = latParam ? Number(latParam) : NaN;
  const longitude = lonParam ? Number(lonParam) : NaN;

  if (!query && (!Number.isFinite(latitude) || !Number.isFinite(longitude))) {
    return NextResponse.json(
      { error: "Debes indicar una ubicación o unas coordenadas." },
      { status: 400 },
    );
  }

  try {
    const location =
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? await fetchLocationByCoordinates(latitude, longitude)
        : await fetchLocation(query!);

    if (!location) {
      return NextResponse.json(
        { error: "No he encontrado esa ubicación." },
        { status: 404 },
      );
    }

    const bounds = buildSquareBounds(location);
    const roads = await fetchRoads(bounds);

    const paths = roads
      .map((road) => {
        const geometry = road.geometry;
        const kind = getRoadKind(road.tags?.highway);

        if (!Array.isArray(geometry) || geometry.length < 2 || !kind) {
          return null;
        }

        const length = getPolylineLength(geometry);
        const minimumLength =
          kind === "primary" ? 0.0012 : kind === "secondary" ? 0.0007 : 0.00016;

        if (length < minimumLength) {
          return null;
        }

        const d = geometryToPath(geometry, bounds);
        const geometryBounds = getGeometryBounds(geometry, bounds);

        if (!d) {
          return null;
        }

        return { d, kind, length, geometryBounds };
      })
      .filter(
        (
          path,
        ): path is {
          d: string;
          kind: "primary" | "secondary" | "local";
          length: number;
          geometryBounds: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
          };
        } => Boolean(path),
      )
      .sort((left, right) => right.length - left.length);

    const primaryPaths = paths
      .filter((path) => path.kind === "primary")
      .slice(0, 64);
    const secondaryPaths = paths
      .filter((path) => path.kind === "secondary")
      .slice(0, 220);
    const localPaths = paths
      .filter((path) => path.kind === "local")
      .slice(0, 1200);
    const selectedPaths = [...localPaths, ...secondaryPaths, ...primaryPaths];
    const layeredPaths = selectedPaths.map(({ d, kind }) => ({ d, kind }));
    const contentBounds = selectedPaths.reduce(
      (accumulator, path) => ({
        minX: Math.min(accumulator.minX, path.geometryBounds.minX),
        minY: Math.min(accumulator.minY, path.geometryBounds.minY),
        maxX: Math.max(accumulator.maxX, path.geometryBounds.maxX),
        maxY: Math.max(accumulator.maxY, path.geometryBounds.maxY),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );

    if (layeredPaths.length === 0) {
      return NextResponse.json(
        {
          error:
            "He localizado el sitio, pero no hay suficientes calles en ese recorte para componer el cuadro.",
        },
        { status: 404 },
      );
    }

    const response: MapArtResponse = {
      location: location.display_name,
      query: query ?? location.display_name,
      center: bounds.center,
      bounds: {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
      },
      contentBounds,
      roadCount: roads.length,
      pathCount: layeredPaths.length,
      paths: layeredPaths,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo generar la cartografía.",
      },
      { status: 502 },
    );
  }
}
