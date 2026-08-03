"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { ArrowUpRight, LocateFixed, MapPin, Navigation } from "lucide-react";

import {
  getMapPlaceCategory,
  mapPlaceCategories,
} from "@/features/map-places/categories";
import type {
  MapPlaceCategory,
  PublicMapPlace,
} from "@/features/map-places/types";
import {
  formatDistanceLabel,
  getDistanceInKm,
  getUserLocationErrorMessage,
  readUserLocation,
  requestUserLocation,
  type UserLocation,
} from "@/features/location/browser-location";
import type { VenueMapItem } from "@/features/venues/services/venues-map-service";

type VenuesMapProps = {
  accessToken: string;
  venues: VenueMapItem[];
  places: PublicMapPlace[];
  demoMode?: boolean;
};

type MapFilter = "all" | "venues" | MapPlaceCategory;
type Selection =
  | { type: "venue"; item: VenueMapItem }
  | { type: "place"; item: PublicMapPlace };

const defaultCenter: [number, number] = [-4.8308, 39.9579];

function ensureMapboxStylesheet() {
  if (document.getElementById("mapbox-gl-stylesheet")) return;
  const stylesheet = document.createElement("link");
  stylesheet.id = "mapbox-gl-stylesheet";
  stylesheet.rel = "stylesheet";
  stylesheet.href = "https://api.mapbox.com/mapbox-gl-js/v3.22.0/mapbox-gl.css";
  document.head.append(stylesheet);
}

function getInitialCenter(venues: VenueMapItem[], places: PublicMapPlace[]): [number, number] {
  const points = [
    ...venues.map((venue) => [venue.longitude, venue.latitude] as const),
    ...places.map((place) => [place.longitude, place.latitude] as const),
  ];
  if (points.length === 0) return defaultCenter;
  return [
    points.reduce((total, point) => total + point[0], 0) / points.length,
    points.reduce((total, point) => total + point[1], 0) / points.length,
  ];
}

function getStaticMapUrl(
  accessToken: string,
  venues: VenueMapItem[],
  places: PublicMapPlace[],
) {
  const points = [
    ...venues.map((venue) => [venue.longitude, venue.latitude] as const),
    ...places.map((place) => [place.longitude, place.latitude] as const),
  ];
  const center = getInitialCenter(venues, places);
  const longitudeRange = points.length > 1
    ? Math.max(...points.map((point) => point[0])) - Math.min(...points.map((point) => point[0]))
    : 0;
  const latitudeRange = points.length > 1
    ? Math.max(...points.map((point) => point[1])) - Math.min(...points.map((point) => point[1]))
    : 0;
  const largestRange = Math.max(longitudeRange, latitudeRange, 0.002);
  const zoom = Math.max(5, Math.min(15, Math.floor(Math.log2(360 / largestRange)) - 1));
  const viewport = `${center[0].toFixed(5)},${center[1].toFixed(5)},${zoom},0`;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${viewport}/1200x800?access_token=${encodeURIComponent(accessToken)}`;
}

function applyPickyaloMapStyle(map: MapboxMap) {
  const layers = map.getStyle().layers ?? [];

  layers.forEach((layer) => {
    const id = layer.id.toLowerCase();

    try {
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", "#F4DFC0");
        return;
      }

      if (layer.type === "fill") {
        if (id.includes("water")) {
          map.setPaintProperty(layer.id, "fill-color", "#BFD9D1");
        } else if (id.includes("park") || id.includes("landuse") || id.includes("landcover")) {
          map.setPaintProperty(layer.id, "fill-color", "#D9DDB5");
          map.setPaintProperty(layer.id, "fill-opacity", 0.78);
        } else if (id.includes("building")) {
          map.setPaintProperty(layer.id, "fill-color", "#E8CDA7");
          map.setPaintProperty(layer.id, "fill-opacity", 0.72);
        }
        return;
      }

      if (layer.type === "line") {
        if (id.includes("road") || id.includes("street")) {
          map.setPaintProperty(layer.id, "line-color", "#FFF9ED");
        } else if (id.includes("water")) {
          map.setPaintProperty(layer.id, "line-color", "#9FC9C0");
        } else if (id.includes("boundary")) {
          map.setPaintProperty(layer.id, "line-color", "#A78173");
          map.setPaintProperty(layer.id, "line-opacity", 0.35);
        }
        return;
      }

      if (layer.type === "symbol") {
        map.setPaintProperty(layer.id, "text-color", "#4A263D");
        map.setPaintProperty(layer.id, "text-halo-color", "#FFF7E8");
        map.setPaintProperty(layer.id, "text-halo-width", 1.35);
      }
    } catch {
      // Some Mapbox layers do not expose every paint property in every style revision.
    }
  });
}

function createVenueMarkerElement() {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "pickyalo-map-marker pickyalo-map-marker--venue";
  element.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16l-1.4-5H5.4L4 10Z"/><path d="M5 10v9h14v-9M9 19v-5h6v5"/><path d="M4 10c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2"/></svg>';
  return element;
}

function createPlaceMarkerElement(place: PublicMapPlace) {
  const category = getMapPlaceCategory(place.category);
  const element = document.createElement("button");
  element.type = "button";
  element.className = "pickyalo-map-marker pickyalo-map-marker--place";
  element.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${category.markerPath}</svg>`;
  return element;
}

function activateMarker(element: HTMLElement) {
  document.querySelectorAll(".pickyalo-map-marker.is-active").forEach((marker) => {
    marker.classList.remove("is-active");
  });
  element.classList.add("is-active");
}

export function VenuesMap({ accessToken, venues, places, demoMode = false }: VenuesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [filter, setFilter] = useState<MapFilter>("all");
  const [selection, setSelection] = useState<Selection | null>(
    venues[0]
      ? { type: "venue", item: venues[0] }
      : places[0]
        ? { type: "place", item: places[0] }
        : null,
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const initialCenter = useMemo(() => getInitialCenter(venues, places), [venues, places]);
  const staticMapUrl = useMemo(
    () => (accessToken ? getStaticMapUrl(accessToken, venues, places) : null),
    [accessToken, places, venues],
  );
  const availableCategories = useMemo(
    () => mapPlaceCategories.filter((category) => places.some((place) => place.category === category.value)),
    [places],
  );
  const visibleVenues = useMemo(
    () => (filter === "all" || filter === "venues" ? venues : []),
    [filter, venues],
  );
  const visiblePlaces = useMemo(
    () =>
      filter === "all"
        ? places
        : filter === "venues"
          ? []
          : places.filter((place) => place.category === filter),
    [filter, places],
  );

  useEffect(() => {
    setUserLocation(readUserLocation());
  }, []);

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current || venues.length + places.length === 0) return;
    let cancelled = false;
    ensureMapboxStylesheet();

    async function setupMap() {
      try {
        const mapboxgl = await import("mapbox-gl");
        if (cancelled || !mapContainerRef.current) return;
        mapboxgl.default.accessToken = accessToken;
        const map = new mapboxgl.default.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: initialCenter,
          zoom: venues.length + places.length === 1 ? 16 : 13,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");
        map.once("load", () => {
          if (cancelled) return;
          applyPickyaloMapStyle(map);
          const points = [
            ...venues.map((venue) => [venue.longitude, venue.latitude] as [number, number]),
            ...places.map((place) => [place.longitude, place.latitude] as [number, number]),
          ];
          if (points.length > 1) {
            const bounds = new mapboxgl.default.LngLatBounds();
            points.forEach((point) => bounds.extend(point));
            map.fitBounds(bounds, { padding: 90, maxZoom: 14.5, duration: 0 });
          }
          setMapReady(true);
        });
      } catch {
        setLocationMessage("No se ha podido cargar el mapa.");
      }
    }
    setupMap();
    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [accessToken, initialCenter, places, venues]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !mapRef.current) return;
      const map = mapRef.current;
      const markers: Marker[] = [];

      visibleVenues.forEach((venue) => {
        const element = createVenueMarkerElement();
        element.setAttribute("aria-label", `Ver local ${venue.name}`);
        element.dataset.label = venue.name;
        if (demoMode) element.classList.add("is-demo");
        if (selection?.type === "venue" && selection.item.id === venue.id) {
          element.classList.add("is-active");
        }
        element.addEventListener("click", () => {
          activateMarker(element);
          setSelection({ type: "venue", item: venue });
          map.flyTo({ center: [venue.longitude, venue.latitude], zoom: Math.max(map.getZoom(), 15), essential: true });
        });
        markers.push(new mapboxgl.default.Marker({ element }).setLngLat([venue.longitude, venue.latitude]).addTo(map));
      });

      visiblePlaces.forEach((place) => {
        const element = createPlaceMarkerElement(place);
        element.setAttribute("aria-label", `Ver ${place.name}`);
        element.dataset.label = place.name.replace(/^Ejemplo · /, "");
        if (demoMode) element.classList.add("is-demo");
        if (selection?.type === "place" && selection.item.id === place.id) {
          element.classList.add("is-active");
        }
        element.addEventListener("click", () => {
          activateMarker(element);
          setSelection({ type: "place", item: place });
          map.flyTo({ center: [place.longitude, place.latitude], zoom: Math.max(map.getZoom(), 16), essential: true });
        });
        markers.push(new mapboxgl.default.Marker({ element }).setLngLat([place.longitude, place.latitude]).addTo(map));
      });
      markersRef.current = markers;
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [demoMode, filter, mapReady, places, selection, venues, visiblePlaces, visibleVenues]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !userLocation) return;
    let cancelled = false;
    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !mapRef.current) return;
      userMarkerRef.current?.remove();
      const element = document.createElement("div");
      element.className = "pickyalo-map-user-marker";
      element.setAttribute("aria-label", "Tu ubicación aproximada");
      userMarkerRef.current = new mapboxgl.default.Marker({ element })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(mapRef.current);
    });
    return () => { cancelled = true; };
  }, [mapReady, userLocation]);

  async function locateUser() {
    setLocating(true);
    setLocationMessage(null);
    try {
      const location = await requestUserLocation();
      setUserLocation(location);
      mapRef.current?.flyTo({ center: [location.longitude, location.latitude], zoom: 15, essential: true });
    } catch (error) {
      setLocationMessage(getUserLocationErrorMessage(error));
    } finally {
      setLocating(false);
    }
  }

  const selectedDistance = selection && userLocation
    ? getDistanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        selection.item.latitude,
        selection.item.longitude,
      )
    : null;

  const hasContent = venues.length + places.length > 0;

  return (
    <main className="min-h-screen bg-[#FDE3AD] px-3 pb-8 pt-24 text-[#381932] sm:px-6 sm:pt-28 lg:px-10">
      <section className="mx-auto w-full max-w-7xl">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#741314]">Explora cerca</p>
              {demoMode ? (
                <span className="rounded-full border border-[#741314]/16 bg-[#FFF7E8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#741314]">
                  Demo visual · sin publicar
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-6xl">Un mapa para salir y descubrir.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#381932]/68 sm:text-base">
              {demoMode
                ? "Una muestra de cómo convivirían locales, parques, mesas y servicios en el explorador."
                : "Locales, parques, mesas y lugares útiles marcados y revisados por Pickyalo."}
            </p>
          </div>
          <button
            type="button"
            onClick={locateUser}
            disabled={locating}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#741314]/18 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold text-[#741314] shadow-[0_10px_26px_rgba(116,19,20,0.08)] disabled:opacity-55"
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            {locating ? "Localizando..." : userLocation ? "Centrar en mí" : "Usar mi ubicación"}
          </button>
        </header>

        <div className="mt-6 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,7rem),1fr))]">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Todo</FilterChip>
          {venues.length > 0 ? <FilterChip active={filter === "venues"} onClick={() => setFilter("venues")}>Locales</FilterChip> : null}
          {availableCategories.map((category) => (
            <FilterChip key={category.value} active={filter === category.value} onClick={() => setFilter(category.value)}>
              {category.shortLabel}
            </FilterChip>
          ))}
        </div>

        {locationMessage ? <p className="mt-2 text-sm text-[#741314]" role="status">{locationMessage}</p> : null}

        {!accessToken ? (
          <EmptyMapState title="Falta configurar Mapbox" description="Añade NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN para activar el mapa." />
        ) : !hasContent ? (
          <EmptyMapState title="El mapa está listo" description="Los lugares aparecerán cuando se publiquen desde el panel." />
        ) : (
          <div className="relative mt-4">
            <div className="relative h-[60svh] min-h-[460px] overflow-hidden rounded-[1.6rem] border border-[#741314]/14 bg-[#eadfca] shadow-[0_28px_80px_rgba(56,25,50,0.14)] sm:h-[68svh] lg:h-[calc(100svh-11rem)] lg:max-h-[780px]">
              {staticMapUrl ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${staticMapUrl}")` }}
                />
              ) : null}
              <div className="absolute inset-0 z-[1]">
                <div ref={mapContainerRef} className="h-full w-full" />
              </div>
              <div className="pointer-events-none absolute left-3 top-3 z-[3] flex items-center gap-2 rounded-full border border-[#741314]/12 bg-[#FFF7E8]/90 px-3 py-2 text-[11px] font-bold text-[#741314] shadow-[0_10px_28px_rgba(56,25,50,0.12)] backdrop-blur-md sm:left-4 sm:top-4">
                <span className="h-2 w-2 rounded-full bg-[#741314]" />
                {visibleVenues.length + visiblePlaces.length} puntos visibles
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 z-[3] hidden max-w-[15rem] rounded-xl border border-[#741314]/10 bg-[#FFF7E8]/88 px-3 py-2 text-[11px] leading-4 text-[#381932]/68 shadow-[0_10px_28px_rgba(56,25,50,0.1)] backdrop-blur-md sm:block">
                Toca un icono para descubrir el lugar y calcular cómo llegar.
              </div>
              {!mapReady ? (
                <div className="absolute inset-0 z-[2] grid place-items-center bg-[#FFF7E8]/70 text-sm font-semibold text-[#741314]">Preparando el mapa...</div>
              ) : null}
              <aside className="absolute bottom-4 right-4 z-[4] hidden w-[min(22rem,calc(100%-2rem))] rounded-[1.25rem] border border-[#741314]/12 bg-[#FFF7E8]/95 p-5 shadow-[0_22px_65px_rgba(56,25,50,0.2)] backdrop-blur-xl md:block">
                {selection?.type === "venue" ? (
                  <VenueSelection venue={selection.item} distance={selectedDistance} />
                ) : selection?.type === "place" ? (
                  <PlaceSelection place={selection.item} distance={selectedDistance} />
                ) : (
                  <p className="text-sm text-[#381932]/62">Toca un punto para ver sus datos.</p>
                )}
              </aside>
            </div>

            <aside className="mt-3 rounded-[1.25rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_18px_50px_rgba(116,19,20,0.08)] md:hidden">
              {selection?.type === "venue" ? (
                <VenueSelection venue={selection.item} distance={selectedDistance} />
              ) : selection?.type === "place" ? (
                <PlaceSelection place={selection.item} distance={selectedDistance} />
              ) : (
                <p className="text-sm text-[#381932]/62">Toca un punto para ver sus datos.</p>
              )}
            </aside>
          </div>
        )}
      </section>

      <style jsx global>{`
        .pickyalo-map-marker { position:absolute; display:grid; place-items:center; width:46px; height:46px; border-radius:15px 15px 15px 5px; cursor:pointer; transition:transform 180ms ease, background-color 180ms ease, color 180ms ease; box-shadow:0 12px 28px rgba(56,25,50,.22),0 0 0 3px rgba(255,247,232,.7); }
        .pickyalo-map-marker::after { content:attr(data-label); position:absolute; left:50%; bottom:calc(100% + 9px); max-width:180px; transform:translate(-50%,5px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border:1px solid rgba(116,19,20,.12); border-radius:999px; background:rgba(255,247,232,.96); padding:6px 10px; color:#381932; font:700 11px/1.1 ui-sans-serif,system-ui,sans-serif; box-shadow:0 10px 28px rgba(56,25,50,.15); opacity:0; pointer-events:none; transition:opacity 160ms ease,transform 160ms ease; }
        .pickyalo-map-marker:hover,.pickyalo-map-marker:focus-visible,.pickyalo-map-marker.is-active { transform:translateY(-4px) scale(1.07); z-index:3; }
        .pickyalo-map-marker:hover::after,.pickyalo-map-marker:focus-visible::after,.pickyalo-map-marker.is-active::after { opacity:1; transform:translate(-50%,0); }
        .pickyalo-map-marker--venue { border:2px solid #741314; background:#741314; color:#FDE3AD; }
        .pickyalo-map-marker--venue svg,.pickyalo-map-marker--place svg { width:23px; height:23px; }
        .pickyalo-map-marker--place { border:2px solid #741314; background:#FFF7E8; color:#741314; }
        .pickyalo-map-marker--place.is-active { background:#741314; color:#FFF7E8; }
        .pickyalo-map-user-marker { width:18px; height:18px; border:4px solid white; border-radius:999px; background:#741314; box-shadow:0 0 0 5px rgba(116,19,20,.2); }
        .mapboxgl-ctrl-group { overflow:hidden; border:1px solid rgba(116,19,20,.12); border-radius:14px!important; background:rgba(255,247,232,.94)!important; box-shadow:0 10px 28px rgba(56,25,50,.12)!important; }
        .mapboxgl-ctrl-group button { width:38px!important; height:38px!important; }
        .mapboxgl-ctrl-group button + button { border-top-color:rgba(116,19,20,.1)!important; }
        @media (prefers-reduced-motion: reduce) { .pickyalo-map-marker { transition:none; } }
      `}</style>
    </main>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-9 w-full min-w-0 items-center justify-center rounded-full border px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.14em] transition sm:min-h-10 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.2em] ${
        active
          ? "border-[#741314]/40 bg-[#741314]/12 font-semibold text-[#741314] shadow-[0_8px_20px_rgba(116,19,20,0.08)]"
          : "border-[#741314]/22 bg-white/54 font-medium text-[#381932]/60 hover:border-[#741314]/38 hover:bg-white/78"
      }`}
    >
      {children}
    </button>
  );
}

function getDirectionsHref(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

function PlaceGlyph({ place }: { place: PublicMapPlace }) {
  const category = getMapPlaceCategory(place.category);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      dangerouslySetInnerHTML={{ __html: category.markerPath }}
    />
  );
}

function VenueSelection({ venue, distance }: { venue: VenueMapItem; distance: number | null }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#741314] text-[#FDE3AD]">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/58">Local</p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-[#381932]">{venue.name}</h2>
          <p className="mt-1 text-sm text-[#381932]/58">{venue.city.name}</p>
        </div>
      </div>
      {distance !== null ? <DistanceChip distance={distance} /> : null}
      {venue.address ? <p className="mt-4 text-sm leading-6 text-[#381932]/68">{venue.address}</p> : null}
      <div className="mt-5 flex items-center gap-2">
        <Link href={`/zonas/${venue.city.slug}/venues/${venue.slug}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#741314] px-4 py-3 text-sm font-bold text-[#FFF7E8]">
          Ver selección <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a href={getDirectionsHref(venue.latitude, venue.longitude)} target="_blank" rel="noreferrer" aria-label={`Cómo llegar a ${venue.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#741314]/18 text-[#741314] transition hover:bg-[#741314]/[0.06]">
          <Navigation className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function PlaceSelection({ place, distance }: { place: PublicMapPlace; distance: number | null }) {
  const category = getMapPlaceCategory(place.category);
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#741314] text-[#FDE3AD]">
          <PlaceGlyph place={place} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/58">{category.label}</p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-[#381932]">{place.name}</h2>
          <p className="mt-1 text-sm text-[#381932]/58">{place.city.name}</p>
        </div>
      </div>
      {distance !== null ? <DistanceChip distance={distance} /> : null}
      {place.description ? <p className="mt-4 text-sm leading-6 text-[#381932]/68">{place.description}</p> : null}
      {place.amenities.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {place.amenities.map((amenity) => <span key={amenity} className="rounded-full border border-[#741314]/14 px-3 py-1.5 text-xs font-semibold text-[#741314]">{amenity}</span>)}
        </div>
      ) : null}
      {place.isAccessible ? <p className="mt-4 text-sm font-semibold text-[#741314]">Acceso adaptado indicado</p> : null}
      <a href={getDirectionsHref(place.latitude, place.longitude)} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#741314] px-4 py-3 text-sm font-bold text-[#FFF7E8]">
        Cómo llegar <Navigation className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}

function DistanceChip({ distance }: { distance: number }) {
  return (
    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#741314]/[0.08] px-3 py-1.5 text-xs font-bold text-[#741314]">
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> A {formatDistanceLabel(distance)} de ti
    </span>
  );
}

function EmptyMapState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-8">
      <h2 className="text-xl font-semibold text-[#381932]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#381932]/62">{description}</p>
    </div>
  );
}
