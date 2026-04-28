"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { ExternalLink, LoaderCircle, MapPin } from "lucide-react";

import type { VenueMapItem } from "@/features/venues/services/venues-map-service";

type VenuesMapProps = {
  accessToken: string;
  venues: VenueMapItem[];
};

const defaultCenter: [number, number] = [-3.7038, 40.4168];
const mapboxStylesheetId = "mapbox-gl-stylesheet";

function ensureMapboxStylesheet() {
  if (document.getElementById(mapboxStylesheetId)) {
    return;
  }

  const stylesheet = document.createElement("link");
  stylesheet.id = mapboxStylesheetId;
  stylesheet.rel = "stylesheet";
  stylesheet.href = "https://api.mapbox.com/mapbox-gl-js/v3.22.0/mapbox-gl.css";
  document.head.append(stylesheet);
}

function getInitialCenter(venues: VenueMapItem[]): [number, number] {
  if (venues.length === 0) {
    return defaultCenter;
  }

  const longitude =
    venues.reduce((total, venue) => total + venue.longitude, 0) / venues.length;
  const latitude =
    venues.reduce((total, venue) => total + venue.latitude, 0) / venues.length;

  return [longitude, latitude];
}

function getStaticMapUrl(accessToken: string, venues: VenueMapItem[]) {
  const pins = venues
    .map(
      (venue) =>
        `pin-l+00df81(${venue.longitude.toFixed(5)},${venue.latitude.toFixed(5)})`,
    )
    .join(",");
  const viewport = pins ? `${pins}/auto` : "-3.70380,40.41680,11,0";

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${viewport}/1200x800?padding=80&access_token=${encodeURIComponent(accessToken)}`;
}

export function VenuesMap({ accessToken, venues }: VenuesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueMapItem | null>(
    venues[0] ?? null,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    accessToken && venues.length > 0 ? "loading" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initialCenter = useMemo(() => getInitialCenter(venues), [venues]);
  const staticMapUrl = useMemo(
    () => (accessToken ? getStaticMapUrl(accessToken, venues) : null),
    [accessToken, venues],
  );

  useEffect(() => {
    if (!accessToken || venues.length === 0 || !mapContainerRef.current) {
      return;
    }

    let cancelled = false;
    ensureMapboxStylesheet();

    async function setupMap() {
      try {
        const mapboxgl = await import("mapbox-gl");

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        mapboxgl.default.accessToken = accessToken;

        const map = new mapboxgl.default.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: initialCenter,
          zoom: venues.length === 1 ? 13 : 11,
          attributionControl: false,
        });

        mapRef.current = map;
        const markReady = () => {
          if (!cancelled) {
            setStatus("ready");
          }
        };

        map.once("load", markReady);
        map.once("render", markReady);

        map.addControl(
          new mapboxgl.default.NavigationControl({ showCompass: false }),
          "top-right",
        );

        markersRef.current = venues.map((venue) => {
          const markerElement = document.createElement("button");
          markerElement.type = "button";
          markerElement.setAttribute("aria-label", `Ver ${venue.name}`);
          markerElement.style.width = "34px";
          markerElement.style.height = "34px";
          markerElement.style.border = "2px solid #07100d";
          markerElement.style.borderRadius = "999px";
          markerElement.style.background = "#00df81";
          markerElement.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.32)";
          markerElement.style.cursor = "pointer";
          markerElement.style.display = "grid";
          markerElement.style.placeItems = "center";
          markerElement.style.transition = "transform 160ms ease";
          markerElement.innerHTML =
            '<span style="width: 10px; height: 10px; border-radius: 999px; background: #07100d; display: block;"></span>';
          markerElement.addEventListener("mouseenter", () => {
            markerElement.style.transform = "scale(1.08)";
          });
          markerElement.addEventListener("mouseleave", () => {
            markerElement.style.transform = "scale(1)";
          });
          markerElement.addEventListener("click", () => {
            setSelectedVenue(venue);
            map.flyTo({
              center: [venue.longitude, venue.latitude],
              zoom: Math.max(map.getZoom(), 13),
              essential: true,
            });
          });

          return new mapboxgl.default.Marker({ element: markerElement })
            .setLngLat([venue.longitude, venue.latitude])
            .addTo(map);
        });

        if (venues.length > 1) {
          const bounds = new mapboxgl.default.LngLatBounds();
          venues.forEach((venue) => {
            bounds.extend([venue.longitude, venue.latitude]);
          });
          map.fitBounds(bounds, { padding: 72, maxZoom: 13 });
        }

        map.once("error", () => {
          if (!cancelled) {
            setStatus("error");
            setErrorMessage("No se ha podido cargar el mapa ahora mismo.");
          }
        });
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("No se ha podido cargar Mapbox en el navegador.");
        }
      }
    }

    setupMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [accessToken, initialCenter, venues]);

  const selectedHref = selectedVenue
    ? `/zonas/${selectedVenue.city.slug}/venues/${selectedVenue.slug}`
    : "#";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--brand)]">
            ZylenPick mapa
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-5xl">
                Locales sobre el mapa
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-strong)] sm:text-base">
                Vista aislada para probar locales publicados con coordenadas reales.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--muted-strong)]">
              <MapPin className="h-4 w-4 text-[var(--brand)]" />
              {venues.length} locales
            </div>
          </div>
        </div>

        {!accessToken ? (
          <div className="rounded-[8px] border border-white/10 bg-white/[0.06] p-8 shadow-[var(--soft-shadow)]">
            <h2 className="text-xl font-semibold text-white">
              Falta configurar Mapbox
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">
              Añade el token público en `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` para
              activar esta vista de prueba.
            </p>
          </div>
        ) : venues.length === 0 ? (
          <div className="rounded-[8px] border border-white/10 bg-white/[0.06] p-8 shadow-[var(--soft-shadow)]">
            <h2 className="text-xl font-semibold text-white">
              Aún no hay locales geolocalizados
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">
              Cuando haya locales activos y publicados con latitud y longitud, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="relative min-h-[520px] overflow-hidden rounded-[8px] border border-white/10 bg-[#dfe8e2] shadow-[var(--shadow)]">
              <div className="absolute inset-0 bg-[#dfe8e2]" />
              {staticMapUrl ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-[1] bg-cover bg-center"
                  style={{ backgroundImage: `url("${staticMapUrl}")` }}
                />
              ) : null}
              <div ref={mapContainerRef} className="absolute inset-0" />
              <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(9,18,14,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(9,18,14,0.04)_1px,transparent_1px)] bg-[length:64px_64px,64px_64px] mix-blend-multiply" />

              {status === "loading" ? (
                <div className="absolute left-4 top-4 z-20 text-white">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm">
                    <LoaderCircle className="h-4 w-4 animate-spin text-[var(--brand)]" />
                    Cargando mapa
                  </div>
                </div>
              ) : null}

              {status === "error" ? (
                <div className="absolute inset-x-4 bottom-4 rounded-[8px] border border-white/10 bg-[#101816]/90 p-4 text-sm text-[var(--muted-strong)] shadow-[var(--card-shadow)] backdrop-blur">
                  {errorMessage ?? "No se ha podido cargar el mapa."}
                </div>
              ) : null}
            </div>

            <aside className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[var(--soft-shadow)]">
              {selectedVenue ? (
                <div className="flex h-full flex-col">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                    Local seleccionado
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">
                    {selectedVenue.name}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted-strong)]">
                    {selectedVenue.city.name}
                  </p>
                  {selectedVenue.address ? (
                    <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                      {selectedVenue.address}
                    </p>
                  ) : null}
                  <Link
                    href={selectedHref}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[#07100d] transition hover:bg-[var(--accent)]"
                  >
                    Ver carta
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
