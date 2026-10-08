import { NextResponse } from "next/server";
import dataset from "../../../../../public/urbanos-talavera.json";
import cartography from "../../../../../public/urbanos-talavera-routes.json";
import { findDirectTransitJourneys, getTransitLineRoutes, type UrbanosTalaveraDataset } from "@/features/transit/urbanos-talavera";
import { resolveBusCartography, type BusCartographyRoute } from "@/features/transit/transit-cartography";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { line?: unknown; direction?: unknown; stops?: unknown } | null;
  if (!body || typeof body.line !== "string" || typeof body.direction !== "string" || !Array.isArray(body.stops)
    || body.stops.length < 2 || body.stops.length > 80 || !body.stops.every((stop) => typeof stop === "string" && stop.length <= 160)) {
    return NextResponse.json({ error: "Invalid bus route" }, { status: 400 });
  }
  const stops = body.stops as string[];
  const official = dataset as UrbanosTalaveraDataset;
  const options = [...getTransitLineRoutes(official, body.line), ...findDirectTransitJourneys(official, stops[0], stops.at(-1)!)];
  const route = options.find((option) => option.line === body.line && option.direction === body.direction && option.stops.join("\n") === stops.join("\n"));
  if (!route) return NextResponse.json({ error: "Unknown official stop sequence" }, { status: 400 });
  const mapped = resolveBusCartography(route, cartography.routes as BusCartographyRoute[]);
  if (!mapped) return NextResponse.json({ error: "Bus cartography not available for this variant" }, { status: 404 });
  return NextResponse.json(mapped);
}
