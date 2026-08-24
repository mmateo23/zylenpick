"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { ArrowUpRight, Headphones, ListFilter, LocateFixed, MapPin, Maximize2, Minimize2, Navigation, Route, ShoppingBag, Sparkles, X } from "lucide-react";

import { PlacePost } from "@/components/map-places/place-post";
import { NativeDirectionsLink } from "@/components/maps/native-directions-link";
import {
  ScrollContentHint,
  useScrollContentHint,
} from "@/components/ui/scroll-content-hint";
import {
  getMapPlaceCategory,
  mapPlaceCategories,
  type MapPlaceCategoryDefinition,
} from "@/features/map-places/categories";
import { MapPlaceIcon } from "@/features/map-places/icons";
import type {
  MapPlaceCategory,
  PublicMapPlace,
} from "@/features/map-places/types";
import {
  formatDistanceLabel,
  getDistanceInKm,
  getUserLocationLabel,
  getUserLocationErrorMessage,
  readUserLocation,
  requestUserLocation,
  type UserLocation,
} from "@/features/location/browser-location";
import type { VenueMapItem } from "@/features/venues/services/venues-map-service";
import { captureLugarVisto } from "@/lib/analytics/posthog-events";

type VenuesMapProps = {
  accessToken: string;
  venues: VenueMapItem[];
  places: PublicMapPlace[];
  categories?: MapPlaceCategoryDefinition[];
  heroImageUrl?: string;
  demoMode?: boolean;
  initialPlaceSlug?: string;
  autoLocate?: boolean;
  initialExploreOnly?: boolean;
  withSiteHeader?: boolean;
};

type MapFilter = "all" | "nearby" | "venues" | "explora" | MapPlaceCategory;
type Selection =
  | { type: "venue"; item: VenueMapItem }
  | { type: "place"; item: PublicMapPlace };

type NearbyPoint = {
  type: Selection["type"];
  id: string;
  distance: number;
};

type QuickPlanStop = Selection;

type QuickPlan = {
  stops: QuickPlanStop[];
  totalDistance: number;
  walkingMinutes: number;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void;
};

const defaultCenter: [number, number] = [-4.8308, 39.9579];
const nearbyResultLimit = 3;
const placeAreasSourceId = "pickyalo-place-areas";
const placeAreasFillLayerId = `${placeAreasSourceId}-fill`;
const placeAreasLineLayerId = `${placeAreasSourceId}-line`;
const placeMarkerRoots = new WeakMap<HTMLElement, Root>();

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

function createPlaceAreasData(
  places: PublicMapPlace[],
  selectedPlaceId?: string,
) {
  return {
    type: "FeatureCollection" as const,
    features: places.flatMap((place) =>
      place.geometryType === "polygon" && place.geometry
        ? [
            {
              type: "Feature" as const,
              properties: {
                id: place.id,
                active: place.id === selectedPlaceId,
              },
              geometry: place.geometry,
            },
          ]
        : [],
    ),
  };
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
        if (id.includes("poi")) {
          map.setLayoutProperty(layer.id, "visibility", "none");
          return;
        }
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
  element.dataset.markerImportance = "pickup";
  element.innerHTML = '<img aria-hidden="true" alt="" src="/icons/pickyalo-favicon-32.png" width="32" height="32" draggable="false" />';
  return element;
}

function createPlaceMarkerElement(place: PublicMapPlace) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "pickyalo-map-marker pickyalo-map-marker--place";
  element.dataset.category = place.category;
  element.dataset.markerImportance = place.planRole;
  if (place.explore) element.classList.add("has-explore");

  const usesThumbnail = place.planRole === "discover" && Boolean(place.coverImageUrl);
  if (usesThumbnail) {
    element.classList.add("pickyalo-map-marker--landmark");
    const image = document.createElement("img");
    image.src = place.coverImageUrl ?? "";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    image.addEventListener("error", () => {
      image.remove();
      element.classList.remove("pickyalo-map-marker--landmark");
      element.classList.add("pickyalo-map-marker--image-fallback");
      element.style.setProperty("--marker-size", "50px");
    });
    element.append(image);

    const iconBadge = document.createElement("span");
    iconBadge.className = "pickyalo-map-marker-icon";
    element.append(iconBadge);
    const root = createRoot(iconBadge);
    root.render(<MapPlaceIcon name={place.iconName} aria-hidden="true" />);
    placeMarkerRoots.set(element, root);
    return element;
  }

  const root = createRoot(element);
  root.render(<MapPlaceIcon name={place.iconName} aria-hidden="true" />);
  placeMarkerRoots.set(element, root);
  return element;
}

function updateMarkerSizes(map: MapboxMap, markers: Marker[]) {
  const progress = Math.min(1, Math.max(0, (map.getZoom() - 11.5) / 5));

  markers.forEach((marker) => {
    const element = marker.getElement();
    const importance = element.dataset.markerImportance;
    const [minimum, maximum] = element.classList.contains("pickyalo-map-marker--landmark")
      ? [58, 76]
      : importance === "pickup"
        ? [46, 54]
        : importance === "discover"
          ? [46, 56]
          : [44, 50];
    const size = Math.round(minimum + (maximum - minimum) * progress);
    element.style.setProperty("--marker-size", `${size}px`);
  });
}

function removeMapMarker(marker: Marker) {
  const element = marker.getElement();
  const root = placeMarkerRoots.get(element);
  placeMarkerRoots.delete(element);
  marker.remove();
  if (root) window.setTimeout(() => root.unmount(), 0);
}

function addMarkerRank(element: HTMLElement, rank: number, mode: "nearby" | "plan") {
  element.classList.add(mode === "plan" ? "is-plan-stop" : "is-nearby");
  const badge = document.createElement("span");
  badge.className = "pickyalo-map-rank";
  badge.textContent = String(rank);
  badge.setAttribute("aria-hidden", "true");
  element.append(badge);
}

function activateMarker(element: HTMLElement) {
  document.querySelectorAll(".pickyalo-map-marker.is-active").forEach((marker) => {
    marker.classList.remove("is-active");
  });
  element.classList.add("is-active");
}

function normalizePlaceName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSelectionCoordinates(stop: QuickPlanStop) {
  return {
    latitude: stop.item.latitude,
    longitude: stop.item.longitude,
  };
}

function getPlanDirectionsHref(origin: UserLocation, stops: QuickPlanStop[]) {
  const destination = stops.at(-1);
  if (!destination) return "#";
  const destinationCoordinates = getSelectionCoordinates(destination);
  const waypoints = stops
    .slice(0, -1)
    .map((stop) => {
      const coordinates = getSelectionCoordinates(stop);
      return `${coordinates.latitude},${coordinates.longitude}`;
    })
    .join("|");
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destinationCoordinates.latitude},${destinationCoordinates.longitude}`,
    travelmode: "walking",
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function getMapboxVenueCoordinates(map: MapboxMap, venue: VenueMapItem): [number, number] | null {
  const expectedName = normalizePlaceName(venue.name);
  if (expectedName.length < 5) return null;

  const center = map.project([venue.longitude, venue.latitude]);
  const searchRadius = 72;
  const features = map.queryRenderedFeatures([
    [center.x - searchRadius, center.y - searchRadius],
    [center.x + searchRadius, center.y + searchRadius],
  ]);

  const match = features.find((feature) => {
    if (feature.geometry.type !== "Point") return false;
    const properties = feature.properties ?? {};
    const mapboxName = [properties.name, properties.name_es]
      .find((value): value is string => typeof value === "string");
    if (!mapboxName) return false;
    const normalizedMapboxName = normalizePlaceName(mapboxName);
    return normalizedMapboxName === expectedName
      || (normalizedMapboxName.length >= 6
        && (normalizedMapboxName.includes(expectedName) || expectedName.includes(normalizedMapboxName)));
  });

  if (!match || match.geometry.type !== "Point") return null;
  const [longitude, latitude] = match.geometry.coordinates;
  if (typeof longitude !== "number" || typeof latitude !== "number") return null;
  return [longitude, latitude];
}

export function VenuesMap({
  accessToken,
  venues,
  places,
  categories = mapPlaceCategories,
  heroImageUrl = "/home/zonas/badges/talavera_tile_letters.png",
  demoMode = false,
  initialPlaceSlug,
  autoLocate = false,
  initialExploreOnly = false,
  withSiteHeader = false,
}: VenuesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const hasExplorePoints = places.some((place) => Boolean(place.explore));
  const initialExplorePlace = initialExploreOnly
    ? places.find((place) => Boolean(place.explore))
    : undefined;
  const [filter, setFilter] = useState<MapFilter>(
    initialExplorePlace ? "explora" : "all",
  );
  const [selection, setSelection] = useState<Selection | null>(
    initialExplorePlace
      ? { type: "place", item: initialExplorePlace }
      : venues[0]
      ? { type: "venue", item: venues[0] }
      : places[0]
        ? { type: "place", item: places[0] }
        : null,
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [userLocationLabel, setUserLocationLabel] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [openPlace, setOpenPlace] = useState<PublicMapPlace | null>(null);
  const lastTrackedOpenPlaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!openPlace) {
      lastTrackedOpenPlaceRef.current = null;
      return;
    }

    if (lastTrackedOpenPlaceRef.current === openPlace.id) return;
    lastTrackedOpenPlaceRef.current = openPlace.id;
    captureLugarVisto({
      place_id: openPlace.id,
      place_name: openPlace.name,
      place_category: openPlace.category,
      city_slug: openPlace.city.slug,
      source: "mapa",
    });
  }, [openPlace]);
  const [mobileSelectionOpen, setMobileSelectionOpen] = useState(Boolean(initialExplorePlace));
  const [isImmersive, setIsImmersive] = useState(false);
  const [immersiveFiltersOpen, setImmersiveFiltersOpen] = useState(false);
  const [quickPlanOpen, setQuickPlanOpen] = useState(false);
  const initialPlaceHandledRef = useRef(false);
  const autoLocateHandledRef = useRef(false);
  const {
    scrollRef: mobileSelectionRef,
    canScrollMore: canScrollMobileSelection,
    scrollForward: scrollMobileSelectionForward,
  } = useScrollContentHint<HTMLElement>(
    mobileSelectionOpen && selection ? `${selection.type}:${selection.item.id}` : null,
  );

  const initialCenter = useMemo(() => getInitialCenter(venues, places), [venues, places]);
  const availableCategories = useMemo(
    () => categories.filter((category) => places.some((place) => place.category === category.value)),
    [categories, places],
  );
  const nearbyPoints = useMemo<NearbyPoint[]>(() => {
    if (!userLocation) return [];

    return [
      ...venues.map((venue) => ({
        type: "venue" as const,
        id: venue.id,
        distance: getDistanceInKm(
          userLocation.latitude,
          userLocation.longitude,
          venue.latitude,
          venue.longitude,
        ),
      })),
      ...places.map((place) => ({
        type: "place" as const,
        id: place.id,
        distance: getDistanceInKm(
          userLocation.latitude,
          userLocation.longitude,
          place.latitude,
          place.longitude,
        ),
      })),
    ]
      .sort((left, right) => left.distance - right.distance)
      .slice(0, nearbyResultLimit);
  }, [places, userLocation, venues]);
  const nearbyPointMeta = useMemo(
    () => new Map(
      nearbyPoints.map((point, index) => [
        `${point.type}:${point.id}`,
        { distance: point.distance, rank: index + 1 },
      ]),
    ),
    [nearbyPoints],
  );
  const planningOrigin = useMemo<UserLocation | null>(
    () => userLocation ?? (demoMode ? { latitude: defaultCenter[1], longitude: defaultCenter[0] } : null),
    [demoMode, userLocation],
  );
  const quickPlan = useMemo<QuickPlan | null>(() => {
    if (!planningOrigin || venues.length === 0) return null;

    const venue = venues.reduce((nearest, candidate) => {
      const nearestDistance = getDistanceInKm(
        planningOrigin.latitude,
        planningOrigin.longitude,
        nearest.latitude,
        nearest.longitude,
      );
      const candidateDistance = getDistanceInKm(
        planningOrigin.latitude,
        planningOrigin.longitude,
        candidate.latitude,
        candidate.longitude,
      );
      return candidateDistance < nearestDistance ? candidate : nearest;
    });
    const candidates = places.filter(
      (place) => place.city.slug === venue.city.slug && place.isPlanCandidate,
    );

    function nearestPlace(role: PublicMapPlace["planRole"], latitude: number, longitude: number) {
      const roleCandidates = candidates.filter((place) => place.planRole === role);
      if (roleCandidates.length === 0) return null;
      const nearest = roleCandidates.reduce((current, candidate) => {
        const currentDistance = getDistanceInKm(latitude, longitude, current.latitude, current.longitude);
        const candidateDistance = getDistanceInKm(latitude, longitude, candidate.latitude, candidate.longitude);
        return candidateDistance < currentDistance ? candidate : current;
      });
      return getDistanceInKm(latitude, longitude, nearest.latitude, nearest.longitude) <= 3
        ? nearest
        : null;
    }

    const discoverPlace = nearestPlace("discover", venue.latitude, venue.longitude);
    const enjoyOrigin = discoverPlace ?? venue;
    const enjoyPlace = nearestPlace("enjoy", enjoyOrigin.latitude, enjoyOrigin.longitude);
    const placesInPlan = [discoverPlace, enjoyPlace].filter(
      (place): place is PublicMapPlace => Boolean(place),
    );
    if (placesInPlan.length === 0) return null;

    const stops: QuickPlanStop[] = [
      { type: "venue", item: venue },
      ...placesInPlan.map((place) => ({ type: "place" as const, item: place })),
    ];
    let previous = { latitude: planningOrigin.latitude, longitude: planningOrigin.longitude };
    const totalDistance = stops.reduce((total, stop) => {
      const coordinates = getSelectionCoordinates(stop);
      const distance = getDistanceInKm(
        previous.latitude,
        previous.longitude,
        coordinates.latitude,
        coordinates.longitude,
      );
      previous = coordinates;
      return total + distance;
    }, 0);

    return {
      stops,
      totalDistance,
      walkingMinutes: Math.max(1, Math.round(totalDistance * 12)),
    };
  }, [places, planningOrigin, venues]);
  const quickPlanPointMeta = useMemo(
    () => new Map(
      quickPlanOpen && quickPlan
        ? quickPlan.stops.map((stop, index) => [`${stop.type}:${stop.item.id}`, { rank: index + 1 }])
        : [],
    ),
    [quickPlan, quickPlanOpen],
  );
  const visibleVenues = useMemo(
    () => {
      if (filter === "all" || filter === "venues") return venues;
      if (filter === "nearby") {
        return venues.filter((venue) => nearbyPointMeta.has(`venue:${venue.id}`));
      }
      return [];
    },
    [filter, nearbyPointMeta, venues],
  );
  const visiblePlaces = useMemo(
    () =>
      filter === "all"
        ? places
        : filter === "nearby"
          ? places.filter((place) => nearbyPointMeta.has(`place:${place.id}`))
        : filter === "venues"
          ? []
        : filter === "explora"
          ? places.filter((place) => Boolean(place.explore))
          : places.filter((place) => place.category === filter),
    [filter, nearbyPointMeta, places],
  );
  const activeFilterLabel = useMemo(() => {
    if (filter === "all") return "Todo";
    if (filter === "nearby") return "Cerca de ti";
    if (filter === "venues") return "Recogida";
    if (filter === "explora") return "Historias";
    return availableCategories.find((category) => category.value === filter)?.shortLabel ?? "Explorar";
  }, [availableCategories, filter]);

  useEffect(() => {
    setUserLocation(readUserLocation());
  }, []);

  useEffect(() => {
    if (!userLocation || !accessToken) {
      setUserLocationLabel(null);
      return;
    }

    const controller = new AbortController();
    void getUserLocationLabel(accessToken, userLocation, controller.signal).then((label) => {
      if (!controller.signal.aborted) setUserLocationLabel(label);
    });

    return () => controller.abort();
  }, [accessToken, userLocation]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => mapRef.current?.resize());
    return () => window.cancelAnimationFrame(frame);
  }, [isImmersive]);

  useEffect(() => {
    if (!isImmersive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (immersiveFiltersOpen) {
        setImmersiveFiltersOpen(false);
        return;
      }
      setIsImmersive(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [immersiveFiltersOpen, isImmersive]);

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
        map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "bottom-right");
        map.once("load", () => {
          if (cancelled) return;
          applyPickyaloMapStyle(map);
          map.addSource(placeAreasSourceId, {
            type: "geojson",
            data: createPlaceAreasData(places),
          });
          map.addLayer({
            id: placeAreasFillLayerId,
            type: "fill",
            source: placeAreasSourceId,
            paint: {
              "fill-color": "#741314",
              "fill-opacity": [
                "case",
                ["==", ["get", "active"], true],
                0.3,
                0.14,
              ],
            },
          });
          map.addLayer({
            id: placeAreasLineLayerId,
            type: "line",
            source: placeAreasSourceId,
            paint: {
              "line-color": "#741314",
              "line-opacity": 0.88,
              "line-width": [
                "case",
                ["==", ["get", "active"], true],
                4,
                2,
              ],
            },
          });
          map.on("mouseenter", placeAreasFillLayerId, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", placeAreasFillLayerId, () => {
            map.getCanvas().style.cursor = "";
          });
          map.on("click", placeAreasFillLayerId, (event) => {
            const placeId = event.features?.[0]?.properties?.id;
            const place = places.find((candidate) => candidate.id === placeId);
            if (!place) return;
            setQuickPlanOpen(false);
            setSelection({ type: "place", item: place });
            setMobileSelectionOpen(true);
            map.flyTo({
              center: [place.longitude, place.latitude],
              zoom: Math.max(map.getZoom(), 16),
              essential: true,
            });
          });
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
      markersRef.current.forEach(removeMapMarker);
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
    const source = mapRef.current.getSource(placeAreasSourceId) as
      | { setData: (data: ReturnType<typeof createPlaceAreasData>) => void }
      | undefined;
    source?.setData(
      createPlaceAreasData(
        visiblePlaces,
        selection?.type === "place" ? selection.item.id : undefined,
      ),
    );
  }, [mapReady, selection, visiblePlaces]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;
    let removeZoomListener: (() => void) | null = null;
    markersRef.current.forEach(removeMapMarker);
    markersRef.current = [];

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !mapRef.current) return;
      const map = mapRef.current;
      const markers: Marker[] = [];

      visibleVenues.forEach((venue) => {
        const element = createVenueMarkerElement();
        const nearbyMeta = filter === "nearby" ? nearbyPointMeta.get(`venue:${venue.id}`) : null;
        const planMeta = quickPlanPointMeta.get(`venue:${venue.id}`);
        const markerCoordinates: [number, number] = getMapboxVenueCoordinates(map, venue)
          ?? [venue.longitude, venue.latitude];
        element.setAttribute("aria-label", `Ver local ${venue.name}`);
        element.dataset.label = nearbyMeta
          ? `${venue.name} · ${formatDistanceLabel(nearbyMeta.distance)}`
          : venue.name;
        if (planMeta) addMarkerRank(element, planMeta.rank, "plan");
        else if (nearbyMeta) addMarkerRank(element, nearbyMeta.rank, "nearby");
        if (demoMode) element.classList.add("is-demo");
        if (selection?.type === "venue" && selection.item.id === venue.id) {
          element.classList.add("is-active");
        }
        element.addEventListener("click", () => {
          activateMarker(element);
          setQuickPlanOpen(false);
          setSelection({ type: "venue", item: venue });
          setMobileSelectionOpen(true);
          map.flyTo({ center: markerCoordinates, zoom: Math.max(map.getZoom(), 15), essential: true });
        });
        markers.push(
          new mapboxgl.default.Marker({ element, anchor: "bottom", offset: [0, -7] })
            .setLngLat(markerCoordinates)
            .addTo(map),
        );
      });

      visiblePlaces.forEach((place) => {
        const element = createPlaceMarkerElement(place);
        const nearbyMeta = filter === "nearby" ? nearbyPointMeta.get(`place:${place.id}`) : null;
        const planMeta = quickPlanPointMeta.get(`place:${place.id}`);
        element.setAttribute("aria-label", `Ver ${place.name}`);
        const placeLabel = place.name.replace(/^Ejemplo · /, "");
        element.dataset.label = nearbyMeta
          ? `${placeLabel} · ${formatDistanceLabel(nearbyMeta.distance)}`
          : placeLabel;
        if (planMeta) addMarkerRank(element, planMeta.rank, "plan");
        else if (nearbyMeta) addMarkerRank(element, nearbyMeta.rank, "nearby");
        if (demoMode) element.classList.add("is-demo");
        if (selection?.type === "place" && selection.item.id === place.id) {
          element.classList.add("is-active");
        }
        element.addEventListener("click", () => {
          activateMarker(element);
          setQuickPlanOpen(false);
          setSelection({ type: "place", item: place });
          setMobileSelectionOpen(true);
          map.flyTo({ center: [place.longitude, place.latitude], zoom: Math.max(map.getZoom(), 16), essential: true });
        });
        markers.push(
          new mapboxgl.default.Marker({ element, anchor: "bottom", offset: [0, -7] })
            .setLngLat([place.longitude, place.latitude])
            .addTo(map),
        );
      });
      markersRef.current = markers;
      const handleZoom = () => updateMarkerSizes(map, markers);
      handleZoom();
      map.on("zoom", handleZoom);
      removeZoomListener = () => map.off("zoom", handleZoom);
    });

    return () => {
      cancelled = true;
      removeZoomListener?.();
      markersRef.current.forEach(removeMapMarker);
      markersRef.current = [];
    };
  }, [demoMode, filter, mapReady, nearbyPointMeta, places, quickPlanPointMeta, selection, venues, visiblePlaces, visibleVenues]);

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

  useEffect(() => {
    if (!autoLocate || !mapReady || autoLocateHandledRef.current) return;
    autoLocateHandledRef.current = true;

    const savedLocation = readUserLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
      mapRef.current?.flyTo({
        center: [savedLocation.longitude, savedLocation.latitude],
        zoom: 15,
        essential: true,
      });
      return;
    }

    void locateUser();
  }, [autoLocate, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !initialPlaceSlug || initialPlaceHandledRef.current) return;
    const place = places.find((candidate) => candidate.id === initialPlaceSlug || candidate.slug === initialPlaceSlug);
    const placeBySlug = place ?? places.find((candidate) => normalizePlaceName(candidate.name) === normalizePlaceName(initialPlaceSlug));
    if (!placeBySlug) return;
    initialPlaceHandledRef.current = true;
    setSelection({ type: "place", item: placeBySlug });
    setMobileSelectionOpen(true);
    mapRef.current.flyTo({
      center: [placeBySlug.longitude, placeBySlug.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 16),
      essential: true,
    });
  }, [initialPlaceSlug, mapReady, places]);

  useEffect(() => {
    if (!quickPlanOpen || !quickPlan || !planningOrigin || !mapRef.current) return;
    const points = [
      [planningOrigin.longitude, planningOrigin.latitude] as [number, number],
      ...quickPlan.stops.map((stop) => {
        const coordinates = getSelectionCoordinates(stop);
        return [coordinates.longitude, coordinates.latitude] as [number, number];
      }),
    ];
    const longitudes = points.map((point) => point[0]);
    const latitudes = points.map((point) => point[1]);
    mapRef.current.fitBounds(
      [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
      ],
      { padding: 90, maxZoom: 15.5, duration: 650 },
    );
  }, [planningOrigin, quickPlan, quickPlanOpen]);

  async function locateUser(intent: "center" | "nearby" | "plan" = "center") {
    setLocating(true);
    setLocationMessage(null);
    try {
      const location = await requestUserLocation();
      setUserLocation(location);
      if (intent === "nearby") setFilter("nearby");
      if (intent === "plan") {
        setFilter("all");
        setQuickPlanOpen(true);
      }
      mapRef.current?.flyTo({ center: [location.longitude, location.latitude], zoom: 15, essential: true });
      setLocationMessage("Ubicación aproximada encontrada.");
    } catch (error) {
      setLocationMessage(getUserLocationErrorMessage(error));
    } finally {
      setLocating(false);
    }
  }

  function openQuickPlan() {
    setMobileSelectionOpen(false);
    setImmersiveFiltersOpen(false);
    setFilter("all");
    if (!planningOrigin) {
      void locateUser("plan");
      return;
    }
    if (!quickPlan) {
      setLocationMessage("Aún no hay suficientes lugares revisados para crear un plan cerca.");
      return;
    }
    setLocationMessage(null);
    setQuickPlanOpen(true);
  }

  function toggleImmersiveMap() {
    const nextValue = !isImmersive;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewTransitionDocument = document as ViewTransitionDocument;

    if (reduceMotion || !viewTransitionDocument.startViewTransition) {
      setIsImmersive(nextValue);
      if (!nextValue) setImmersiveFiltersOpen(false);
      return;
    }

    viewTransitionDocument.startViewTransition(() => {
      flushSync(() => {
        setIsImmersive(nextValue);
        if (!nextValue) setImmersiveFiltersOpen(false);
      });
    });
  }

  function selectMapFilter(nextFilter: MapFilter) {
    setQuickPlanOpen(false);
    setMobileSelectionOpen(false);
    setImmersiveFiltersOpen(false);
    if (nextFilter === "nearby" && !userLocation) {
      void locateUser("nearby");
      return;
    }

    setFilter(nextFilter);
    if (nextFilter === "nearby" && userLocation) {
      mapRef.current?.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 15),
        essential: true,
      });
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
  const openPlaceDistance = openPlace && userLocation
    ? getDistanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        openPlace.latitude,
        openPlace.longitude,
      )
    : null;
  const nearestVenue = useMemo(() => {
    if (!openPlace || venues.length === 0) return null;
    const cityVenues = venues.filter((venue) => venue.city.slug === openPlace.city.slug);
    if (cityVenues.length === 0) return null;

    const nearest = cityVenues.reduce((currentNearest, venue) => {
      const venueDistance = getDistanceInKm(
        openPlace.latitude,
        openPlace.longitude,
        venue.latitude,
        venue.longitude,
      );
      const nearestDistance = getDistanceInKm(
        openPlace.latitude,
        openPlace.longitude,
        currentNearest.latitude,
        currentNearest.longitude,
      );
      return venueDistance < nearestDistance ? venue : currentNearest;
    });
    const distance = getDistanceInKm(
      openPlace.latitude,
      openPlace.longitude,
      nearest.latitude,
      nearest.longitude,
    );

    return distance <= 3 ? nearest : null;
  }, [openPlace, venues]);

  return (
    <main className={`min-h-screen bg-[#FFF7E8] px-3 pb-8 text-[#381932] sm:px-6 lg:px-10 ${withSiteHeader ? "pt-8 sm:pt-10" : "pt-24 sm:pt-28"}`}>
      <section className="mx-auto w-full max-w-7xl">
        <header className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,23rem)] lg:gap-10">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#741314]">Explora cerca</p>
              {demoMode ? (
                <span className="rounded-full border border-[#741314] bg-[#FFF7E8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#741314]">
                  Demo visual · sin publicar
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#381932] sm:text-6xl">Un mapa para salir y descubrir.</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-[#381932]/82 sm:text-base">
              {demoMode
                ? "Una muestra de cómo convivirían locales, parques, mesas y servicios en el explorador."
                : "Puntos de recogida, parques, monumentos y lugares útiles marcados y revisados por Pickyalo."}
            </p>
          </div>
          <div className="group relative mx-auto flex w-full max-w-[21rem] flex-col items-center lg:mx-0 lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute bottom-[4.5rem] left-1/2 h-8 w-[72%] -translate-x-1/2 rounded-[50%] bg-[#741314]/14 blur-xl"
            />
            <Image
              src={heroImageUrl}
              alt="Maqueta isométrica de Talavera de la Reina"
              width={500}
              height={500}
              sizes="(max-width: 1023px) 240px, 336px"
              className="relative h-auto w-[15rem] select-none object-contain drop-shadow-[0_20px_20px_rgba(56,25,50,0.18)] transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:scale-[1.025] lg:w-[21rem]"
            />
            <button
              type="button"
              onClick={() => void locateUser()}
              disabled={locating}
              className="relative mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#741314] bg-white/80 px-4 py-2.5 text-sm font-bold text-[#741314] shadow-[0_10px_26px_rgba(116,19,20,0.08)] backdrop-blur-sm transition hover:bg-white disabled:opacity-55 sm:w-auto"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              {locating ? "Localizando..." : userLocation ? "Centrar en mí" : "Usar mi ubicación"}
            </button>
            {userLocation ? (
              <p className="mt-2 flex max-w-[21rem] items-center justify-center gap-1.5 text-center text-xs font-semibold leading-5 text-[#381932]/70" aria-live="polite">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#741314]" aria-hidden="true" />
                {userLocationLabel ?? "Tu ubicación aproximada"}
              </p>
            ) : null}
          </div>
        </header>

        <div className="mt-6 grid grid-cols-3 border-y border-[#741314]/12 py-4 sm:max-w-2xl">
          <MapSummaryItem icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />} value={venues.length} label="Recogida" />
          <MapSummaryItem icon={<MapPin className="h-4 w-4" aria-hidden="true" />} value={places.length} label="Lugares" />
          <MapSummaryItem icon={<Sparkles className="h-4 w-4" aria-hidden="true" />} value={activeFilterLabel} label="Viendo" />
        </div>

        <MapFilterControls
          filter={filter}
          categories={availableCategories}
          hasPickupPoints={venues.length > 0}
          hasExplorePoints={hasExplorePoints}
          onSelect={selectMapFilter}
          className="mt-5"
        />

        <button
          type="button"
          onClick={openQuickPlan}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-[#741314]/16 bg-[#FFF7E8] px-4 py-3 text-left text-[#381932] shadow-[0_12px_30px_rgba(116,19,20,0.07)] transition hover:border-[#741314]/30 hover:bg-white sm:w-auto sm:min-w-[22rem]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#741314] text-[#FFF7E8]">
            <Route className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <strong className="block text-sm">{demoMode ? "Ver plan de ejemplo" : "Crear un plan cerca"}</strong>
            <span className="mt-0.5 block text-xs leading-5 text-[#381932]/58">Local + descubrimiento + un lugar para disfrutar.</span>
          </span>
          <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-[#741314]" aria-hidden="true" />
        </button>

        {locationMessage ? <p className="mt-2 text-sm text-[#741314]" role="status">{locationMessage}</p> : null}

        {!accessToken ? (
          <EmptyMapState title="Falta configurar Mapbox" description="Añade NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN para activar el mapa." />
        ) : !hasContent ? (
          <EmptyMapState title="El mapa está listo" description="Los lugares aparecerán cuando se publiquen desde el panel." />
        ) : (
          <div className="relative mt-4">
            <div
              className={`pickyalo-map-viewport overflow-hidden bg-[#eadfca] transition-[border-radius] duration-200 ${
                isImmersive
                  ? "fixed inset-0 z-[110] h-[100svh] min-h-0 rounded-none border-0 shadow-none"
                  : "relative h-[60svh] min-h-[460px] rounded-[1.6rem] border border-[#741314]/55 shadow-[0_28px_80px_rgba(56,25,50,0.14)] sm:h-[68svh] lg:h-[calc(100svh-11rem)] lg:max-h-[780px]"
              }`}
            >
              <div className="absolute inset-0 z-[1]">
                <div ref={mapContainerRef} className="h-full w-full" />
              </div>
              <div
                className={`pointer-events-none absolute left-3 z-[3] flex items-center gap-2 rounded-full border border-[#741314] bg-[#FFF7E8]/90 px-3 py-2 text-[11px] font-bold text-[#741314] shadow-[0_10px_28px_rgba(56,25,50,0.12)] backdrop-blur-md sm:left-4 ${
                  isImmersive ? "top-[4.15rem] sm:top-[4.4rem]" : "top-3 sm:top-4"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-[#741314]" />
                {activeFilterLabel} · {visibleVenues.length + visiblePlaces.length} puntos visibles
              </div>
              {isImmersive ? (
                <>
                  <button
                    type="button"
                    onClick={() => setImmersiveFiltersOpen((current) => !current)}
                    aria-expanded={immersiveFiltersOpen}
                    aria-controls="immersive-map-filters"
                    aria-label={immersiveFiltersOpen ? "Cerrar filtros del mapa" : "Abrir filtros del mapa"}
                    className="absolute left-3 top-3 z-[8] inline-flex h-10 items-center gap-2 rounded-full border border-[#741314] bg-[#FFF7E8]/95 px-3.5 text-xs font-bold text-[#741314] shadow-[0_14px_34px_rgba(56,25,50,0.18)] backdrop-blur-xl transition hover:bg-white sm:left-4 sm:top-4"
                  >
                    <ListFilter className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                    Explorar
                  </button>
                  {immersiveFiltersOpen ? (
                    <div
                      id="immersive-map-filters"
                      className="pickyalo-map-filter-panel absolute left-3 right-3 top-[4.15rem] z-[7] rounded-[1.2rem] border border-[#741314]/14 bg-[#FFF7E8]/95 p-3 shadow-[0_24px_70px_rgba(56,25,50,0.22)] backdrop-blur-xl sm:left-4 sm:right-auto sm:top-[4.4rem] sm:w-[27rem] sm:p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3 px-1">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/58">Qué quieres descubrir</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#381932]">Todos los filtros del mapa</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImmersiveFiltersOpen(false)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#741314]/12 bg-white/70 text-[#741314]"
                          aria-label="Cerrar filtros"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <MapFilterControls
                        filter={filter}
                        categories={availableCategories}
                        hasPickupPoints={venues.length > 0}
                        hasExplorePoints={hasExplorePoints}
                        onSelect={selectMapFilter}
                      />
                      <button
                        type="button"
                        onClick={openQuickPlan}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#741314] px-4 py-3 text-sm font-bold text-[#FFF7E8]"
                      >
                        <Route className="h-4 w-4" aria-hidden="true" />
                        {demoMode ? "Ver plan de ejemplo" : "Crear plan cerca"}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
              <button
                type="button"
                onClick={toggleImmersiveMap}
                aria-pressed={isImmersive}
                className="absolute right-3 top-3 z-[6] inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#FFF7E8]/60 bg-[#741314] px-3 text-xs font-bold text-[#FFF7E8] shadow-[0_14px_34px_rgba(56,25,50,0.24)] transition hover:bg-[#5f1012] sm:right-4 sm:top-4"
                aria-label={isImmersive ? "Salir del mapa a pantalla completa" : "Abrir mapa a pantalla completa"}
              >
                {isImmersive ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
                <span className="hidden sm:inline">{isImmersive ? "Salir" : "Ampliar"}</span>
              </button>
              <div className="pointer-events-none absolute bottom-3 left-3 z-[3] hidden max-w-[15rem] rounded-xl border border-[#741314]/10 bg-[#FFF7E8]/88 px-3 py-2 text-[11px] leading-4 text-[#381932]/68 shadow-[0_10px_28px_rgba(56,25,50,0.1)] backdrop-blur-md sm:block">
                Toca un icono para descubrir el lugar y calcular cómo llegar.
              </div>
              {!mapReady ? (
                <div className="absolute inset-0 z-[2] grid place-items-center bg-[#FFF7E8]/70 text-sm font-semibold text-[#741314]">Preparando el mapa...</div>
              ) : null}
              {!mobileSelectionOpen && !quickPlanOpen ? (
                <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[4] flex justify-center md:hidden">
                  <p className="rounded-full border border-[#741314] bg-[#FFF7E8]/94 px-3.5 py-2 text-center text-[11px] font-semibold text-[#381932] shadow-[0_12px_32px_rgba(56,25,50,0.14)] backdrop-blur-md">
                    Toca un punto para ver sus datos
                  </p>
                </div>
              ) : null}
              {mobileSelectionOpen && selection && !quickPlanOpen ? (
                <>
                  <aside
                    ref={mobileSelectionRef}
                    className="pickyalo-map-selection-sheet absolute inset-x-3 bottom-3 z-[5] max-h-[46%] overflow-y-auto overscroll-contain rounded-[1.15rem] border border-[#741314]/14 bg-[#FFF7E8]/[0.98] p-3.5 pr-11 shadow-[0_22px_65px_rgba(56,25,50,0.26)] backdrop-blur-xl md:hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setMobileSelectionOpen(false)}
                      className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-[#741314]/12 bg-white/70 text-[#741314]"
                      aria-label="Cerrar información del punto"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {selection.type === "venue" ? (
                      <VenueSelection venue={selection.item} distance={selectedDistance} compact />
                    ) : (
                      <PlaceSelection
                        place={selection.item}
                        category={getMapPlaceCategory(selection.item.category, categories)}
                        distance={selectedDistance}
                        compact
                        onDiscover={() => setOpenPlace(selection.item)}
                      />
                    )}
                  </aside>
                  <ScrollContentHint
                    visible={canScrollMobileSelection}
                    onActivate={scrollMobileSelectionForward}
                    positionClassName="inset-x-4 bottom-4"
                  />
                </>
              ) : null}
              {quickPlanOpen && quickPlan && planningOrigin ? (
                <QuickPlanCard
                  plan={quickPlan}
                  origin={planningOrigin}
                  demoMode={demoMode}
                  onClose={() => setQuickPlanOpen(false)}
                />
              ) : null}
              {!quickPlanOpen ? (
                <aside className="absolute bottom-4 right-4 z-[4] hidden w-[min(22rem,calc(100%-2rem))] rounded-[1.25rem] border border-[#741314]/12 bg-[#FFF7E8]/95 p-5 shadow-[0_22px_65px_rgba(56,25,50,0.2)] backdrop-blur-xl md:block">
                  {selection?.type === "venue" ? (
                    <VenueSelection venue={selection.item} distance={selectedDistance} />
                  ) : selection?.type === "place" ? (
                    <PlaceSelection place={selection.item} category={getMapPlaceCategory(selection.item.category, categories)} distance={selectedDistance} onDiscover={() => setOpenPlace(selection.item)} />
                  ) : (
                    <p className="text-sm text-[#381932]/62">Toca un punto para ver sus datos.</p>
                  )}
                </aside>
              ) : null}
            </div>

          </div>
        )}
      </section>

      <style jsx global>{`
        .pickyalo-map-marker { --marker-size:46px; position:absolute; display:grid; width:var(--marker-size); height:var(--marker-size); place-items:center; border-radius:15px 15px 15px 5px; cursor:pointer; transition:width 140ms ease,height 140ms ease,transform 180ms ease,background-color 180ms ease,color 180ms ease; box-shadow:0 12px 28px rgba(56,25,50,.22),0 0 0 3px rgba(255,247,232,.76); }
        .pickyalo-map-marker::before { content:""; position:absolute; left:50%; bottom:-5px; width:10px; height:10px; transform:translateX(-50%) rotate(45deg); border-right:2px solid #741314; border-bottom:2px solid #741314; background:inherit; }
        .pickyalo-map-marker::after { content:attr(data-label); position:absolute; left:50%; bottom:calc(100% + 9px); max-width:180px; transform:translate(-50%,5px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border:1px solid rgba(116,19,20,.12); border-radius:999px; background:rgba(255,247,232,.96); padding:6px 10px; color:#381932; font:700 11px/1.1 ui-sans-serif,system-ui,sans-serif; box-shadow:0 10px 28px rgba(56,25,50,.15); opacity:0; pointer-events:none; transition:opacity 160ms ease,transform 160ms ease; }
        .pickyalo-map-marker:hover,.pickyalo-map-marker:focus-visible,.pickyalo-map-marker.is-active { transform:translateY(-4px) scale(1.07); z-index:3; }
        .pickyalo-map-marker.is-active { animation:pickyalo-map-marker-select 320ms cubic-bezier(.2,.8,.2,1); box-shadow:0 14px 32px rgba(56,25,50,.28),0 0 0 3px rgba(255,247,232,.92),0 0 0 8px rgba(116,19,20,.18); }
        .pickyalo-map-marker:hover::after,.pickyalo-map-marker:focus-visible::after,.pickyalo-map-marker.is-active::after { opacity:1; transform:translate(-50%,0); }
        .pickyalo-map-marker--venue { border:2px solid #741314; background:#FFF7E8; color:#741314; }
        .pickyalo-map-marker--venue img { width:calc(var(--marker-size) - 14px); height:calc(var(--marker-size) - 14px); border-radius:9px; object-fit:cover; pointer-events:none; user-select:none; }
        .pickyalo-map-marker--place svg { width:23px; height:23px; }
        .pickyalo-map-marker--landmark { overflow:visible; border:3px solid #FFF7E8; border-radius:16px 16px 16px 5px; background:#741314; box-shadow:0 16px 34px rgba(56,25,50,.28),0 0 0 2px rgba(116,19,20,.92); }
        .pickyalo-map-marker--landmark::before { border-color:#741314; background:#FFF7E8; }
        .pickyalo-map-marker--landmark > img { width:100%; height:100%; border-radius:12px 12px 12px 3px; object-fit:cover; pointer-events:none; user-select:none; }
        .pickyalo-map-marker-icon { position:absolute; right:-7px; bottom:-7px; display:grid; width:25px; height:25px; place-items:center; border:2px solid #FFF7E8; border-radius:999px; background:#741314; color:#FFF7E8; box-shadow:0 6px 14px rgba(56,25,50,.24); }
        .pickyalo-map-marker-icon svg { width:13px!important; height:13px!important; }
        .pickyalo-map-marker--image-fallback .pickyalo-map-marker-icon { position:static; width:auto; height:auto; border:0; background:transparent; box-shadow:none; }
        .pickyalo-map-marker--image-fallback .pickyalo-map-marker-icon svg { width:23px!important; height:23px!important; }
        .pickyalo-map-marker.is-nearby { box-shadow:0 14px 34px rgba(56,25,50,.28),0 0 0 3px rgba(255,247,232,.94),0 0 0 8px rgba(116,19,20,.14); }
        .pickyalo-map-marker.is-plan-stop { box-shadow:0 14px 36px rgba(56,25,50,.3),0 0 0 3px rgba(255,247,232,.96),0 0 0 9px rgba(253,211,125,.72); }
        .pickyalo-map-rank { position:absolute; right:-7px; top:-8px; z-index:2; display:grid; width:21px; height:21px; place-items:center; border:2px solid #FFF7E8; border-radius:999px; background:#741314; color:#FFF7E8; font:800 10px/1 ui-sans-serif,system-ui,sans-serif; box-shadow:0 6px 14px rgba(56,25,50,.2); pointer-events:none; }
        .pickyalo-map-marker--place { border:2px solid #741314; background:#FFF7E8; color:#741314; }
        .pickyalo-map-marker--place[data-category="bench"] { border-color:#4f6954; background:#edf2e8; color:#405b46; }
        .pickyalo-map-marker--place[data-category="bench"]::before { border-color:#4f6954; }
        .pickyalo-map-marker--place[data-category="tables"] { border-color:#9d572f; background:#fde3ad; color:#71391f; }
        .pickyalo-map-marker--place[data-category="tables"]::before { border-color:#9d572f; }
        .pickyalo-map-marker--place.is-active { background:#741314; color:#FFF7E8; }
        .pickyalo-map-marker--place.is-active::before { border-color:#741314; }
        .pickyalo-map-marker--place.has-explore { box-shadow:0 14px 32px rgba(56,25,50,.24),0 0 0 3px rgba(255,247,232,.94),0 0 0 7px rgba(253,227,173,.88); }
        .pickyalo-map-user-marker { width:18px; height:18px; border:4px solid white; border-radius:999px; background:#741314; box-shadow:0 0 0 5px rgba(116,19,20,.2); }
        .mapboxgl-ctrl-group { display:grid; gap:6px; overflow:visible; border:0!important; background:transparent!important; box-shadow:none!important; }
        .mapboxgl-ctrl-group button { width:40px!important; height:40px!important; overflow:hidden; border:1px solid rgba(116,19,20,.16)!important; border-radius:999px!important; background-color:rgba(255,247,232,.96)!important; box-shadow:0 10px 26px rgba(56,25,50,.15)!important; transition:background-color 160ms ease,transform 160ms ease!important; }
        .mapboxgl-ctrl-group button:hover { background-color:#FDE3AD!important; transform:translateY(-1px); }
        .mapboxgl-ctrl-group button + button { border-top:1px solid rgba(116,19,20,.16)!important; }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon { opacity:.76; }
        .pickyalo-map-selection-sheet { animation:pickyalo-map-sheet-in 280ms cubic-bezier(.2,.8,.2,1); transform-origin:center bottom; }
        .pickyalo-map-filter-panel { animation:pickyalo-map-filter-in 220ms cubic-bezier(.2,.8,.2,1); transform-origin:top left; }
        .pickyalo-map-viewport { view-transition-name:pickyalo-map; }
        ::view-transition-group(pickyalo-map) { animation-duration:380ms; animation-timing-function:cubic-bezier(.2,.8,.2,1); }
        ::view-transition-old(pickyalo-map),::view-transition-new(pickyalo-map) { mix-blend-mode:normal; }
        @keyframes pickyalo-map-sheet-in { from { opacity:0; transform:translateY(18px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes pickyalo-map-filter-in { from { opacity:0; transform:translateY(-8px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes pickyalo-map-marker-select { 0% { transform:translateY(0) scale(.9); } 65% { transform:translateY(-6px) scale(1.11); } 100% { transform:translateY(-4px) scale(1.07); } }
        @media (prefers-reduced-motion: reduce) { .pickyalo-map-marker { transition:none; } .pickyalo-map-marker.is-active,.pickyalo-map-selection-sheet,.pickyalo-map-filter-panel { animation:none; } }
      `}</style>
      {openPlace ? (
        <PlacePost
          place={openPlace}
          category={getMapPlaceCategory(openPlace.category, categories)}
          distance={openPlaceDistance}
          nearbyVenue={nearestVenue}
          onClose={() => setOpenPlace(null)}
        />
      ) : null}
    </main>
  );
}

function QuickPlanCard({
  plan,
  origin,
  demoMode,
  onClose,
}: {
  plan: QuickPlan;
  origin: UserLocation;
  demoMode: boolean;
  onClose: () => void;
}) {
  const {
    scrollRef,
    canScrollMore,
    scrollForward,
  } = useScrollContentHint<HTMLElement>(plan.stops.map((stop) => `${stop.type}:${stop.item.id}`).join("|"));

  return (
    <>
    <aside ref={scrollRef} className="pickyalo-map-selection-sheet absolute inset-x-3 bottom-3 z-[7] max-h-[72%] overflow-y-auto overscroll-contain rounded-[1.25rem] border border-[#741314]/14 bg-[#FFF7E8]/[0.98] p-4 shadow-[0_24px_70px_rgba(56,25,50,0.28)] backdrop-blur-xl md:inset-x-auto md:bottom-4 md:left-4 md:w-[23rem] md:p-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-[#741314]/12 bg-white/75 text-[#741314]"
        aria-label="Cerrar plan"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <p className="pr-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/58">
        Plan Pickyalo · {demoMode ? "ejemplo" : "cerca de ti"}
      </p>
      <h2 className="mt-2 pr-10 text-xl font-semibold leading-tight text-[#381932]">Recoge, descubre y disfruta.</h2>
      <p className="mt-2 text-xs leading-5 text-[#381932]/58">Una propuesta corta creada con lugares revisados. El recorrido es orientativo.</p>

      <ol className="mt-4 space-y-2.5">
        {plan.stops.map((stop, index) => {
          const role = stop.type === "venue"
            ? "Recoge"
            : stop.item.planRole === "discover"
              ? "Descubre"
              : stop.item.planRole === "enjoy"
                ? "Disfruta"
                : "Apoyo";
          return (
            <li key={`${stop.type}:${stop.item.id}`} className="flex items-center gap-3 rounded-xl border border-[#741314]/10 bg-white/70 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#741314] text-xs font-black text-[#FFF7E8]">{index + 1}</span>
              <span className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[#741314]/55">{role}</span>
                <strong className="mt-0.5 block truncate text-sm font-semibold text-[#381932]">{stop.item.name}</strong>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#741314]/24 pt-4">
        <div>
          <p className="text-lg font-semibold text-[#381932]">{plan.walkingMinutes} min</p>
          <p className="text-[11px] text-[#381932]/55">{formatDistanceLabel(plan.totalDistance)} andando</p>
        </div>
        <a
          href={getPlanDirectionsHref(origin, plan.stops)}
          rel="external"
          className="inline-flex items-center gap-2 rounded-full bg-[#741314] px-4 py-3 text-sm font-bold text-[#FFF7E8]"
        >
          Abrir ruta <Navigation className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </aside>
    <ScrollContentHint
      visible={canScrollMore}
      onActivate={scrollForward}
      label="Desliza para ver el plan completo"
      positionClassName="inset-x-4 bottom-4"
    />
    </>
  );
}

function MapSummaryItem({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 border-r border-[#741314]/12 px-2 last:border-r-0 sm:justify-start sm:px-4 first:pl-0">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#741314]/[0.08] text-[#741314]">
        {icon}
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-sm font-semibold text-[#381932]">{value}</strong>
        <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#741314]/55 sm:text-[10px]">{label}</span>
      </span>
    </div>
  );
}

function MapFilterControls({
  filter,
  categories,
  hasPickupPoints,
  hasExplorePoints,
  onSelect,
  className = "",
}: {
  filter: MapFilter;
  categories: MapPlaceCategoryDefinition[];
  hasPickupPoints: boolean;
  hasExplorePoints: boolean;
  onSelect: (filter: MapFilter) => void;
  className?: string;
}) {
  return (
    <div className={`${className} space-y-3`}>
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#741314]/58">
          Cómo quieres explorar
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FilterChip icon={<Sparkles className="h-4 w-4" aria-hidden="true" />} active={filter === "all"} onClick={() => onSelect("all")}>Todo</FilterChip>
          <FilterChip icon={<LocateFixed className="h-4 w-4" aria-hidden="true" />} active={filter === "nearby"} onClick={() => onSelect("nearby")}>Cerca de ti</FilterChip>
          {hasPickupPoints ? (
            <FilterChip icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />} active={filter === "venues"} onClick={() => onSelect("venues")}>Recogida</FilterChip>
          ) : null}
          {hasExplorePoints ? (
            <FilterChip icon={<Headphones className="h-4 w-4" aria-hidden="true" />} active={filter === "explora"} onClick={() => onSelect("explora")}>Explora</FilterChip>
          ) : null}
        </div>
      </div>
      {categories.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#741314]/58">
            Categorías
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías del mapa">
            {categories.map((category) => (
              <FilterChip
                key={category.value}
                icon={<MapPlaceIcon name={category.iconName} className="h-5 w-5" />}
                active={filter === category.value}
                onClick={() => onSelect(category.value)}
                iconOnly
              >
                {category.shortLabel}
              </FilterChip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  icon,
  children,
  iconOnly = false,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  iconOnly?: boolean;
}) {
  const accessibleLabel = typeof children === "string" ? children : undefined;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={iconOnly ? accessibleLabel : undefined}
      title={iconOnly ? accessibleLabel : undefined}
      onClick={onClick}
      className={`inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border py-2.5 text-center text-xs leading-tight transition-[width,background-color,border-color,color,box-shadow,padding] duration-200 sm:text-[13px] ${
        iconOnly ? (active ? "w-auto px-4" : "w-12 px-0") : "w-full min-w-0 px-3 sm:px-3.5"
      } ${
        active
          ? "border-[#741314] bg-[#741314] font-bold text-[#FFF7E8] shadow-[0_8px_20px_rgba(116,19,20,0.16)]"
          : "border-[#741314] bg-white/72 font-semibold text-[#381932]/74 hover:bg-white"
      }`}
    >
      {icon ? <span className="grid h-5 w-5 shrink-0 place-items-center" aria-hidden="true">{icon}</span> : null}
      {!iconOnly || active ? <span className="min-w-0 whitespace-nowrap">{children}</span> : null}
    </button>
  );
}

function PlaceGlyph({ place }: { place: PublicMapPlace }) {
  return <MapPlaceIcon name={place.iconName} className="h-6 w-6" aria-hidden="true" />;
}

function VenueSelection({
  venue,
  distance,
  compact = false,
}: {
  venue: VenueMapItem;
  distance: number | null;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className={`grid shrink-0 place-items-center rounded-xl bg-[#741314] text-[#FDE3AD] ${compact ? "h-10 w-10" : "h-11 w-11"}`}>
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/58">Local</p>
          <h2 className={`mt-1 font-semibold leading-tight text-[#381932] ${compact ? "line-clamp-1 text-base" : "text-xl"}`}>{venue.name}</h2>
          <p className={`${compact ? "mt-0.5 text-xs" : "mt-1 text-sm"} text-[#381932]/58`}>{venue.city.name}</p>
        </div>
      </div>
      {distance !== null ? <DistanceChip distance={distance} /> : null}
      {venue.address ? <p className={`${compact ? "mt-2 line-clamp-1 text-xs leading-5" : "mt-4 text-sm leading-6"} text-[#381932]/68`}>{venue.address}</p> : null}
      <div className={`${compact ? "mt-3" : "mt-5"} flex items-center gap-2`}>
        <Link href={`/zonas/${venue.city.slug}/venues/${venue.slug}`} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8] ${compact ? "py-2.5" : "py-3"}`}>
          Ver selección <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <NativeDirectionsLink destination={{ latitude: venue.latitude, longitude: venue.longitude }} destinationLabel={venue.name} aria-label={`Cómo llegar a ${venue.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#741314]/18 text-[#741314] transition hover:bg-[#741314]/[0.06]">
          <Navigation className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </NativeDirectionsLink>
      </div>
    </div>
  );
}

function PlaceSelection({
  place,
  category,
  distance,
  onDiscover,
  compact = false,
}: {
  place: PublicMapPlace;
  category: MapPlaceCategoryDefinition;
  distance: number | null;
  onDiscover: () => void;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className={`grid shrink-0 place-items-center rounded-xl bg-[#741314] text-[#FDE3AD] ${compact ? "h-10 w-10" : "h-11 w-11"}`}>
          <PlaceGlyph place={place} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/58">{category.label}</p>
          <h2 className={`mt-1 font-semibold leading-tight text-[#381932] ${compact ? "line-clamp-1 text-base" : "text-xl"}`}>{place.name}</h2>
          <p className={`${compact ? "mt-0.5 text-xs" : "mt-1 text-sm"} text-[#381932]/58`}>{place.city.name}</p>
        </div>
      </div>
      {distance !== null ? <DistanceChip distance={distance} /> : null}
      {place.explore ? (
        <p className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#741314]/18 bg-[#FDE3AD]/55 px-3 text-xs font-bold text-[#741314]">
          <Headphones className="h-3.5 w-3.5" aria-hidden="true" /> Historia disponible
        </p>
      ) : null}
      {place.description ? <p className={`${compact ? "mt-2 line-clamp-2 text-xs leading-5" : "mt-4 text-sm leading-6"} text-[#381932]/68`}>{place.description}</p> : null}
      {!compact && place.amenities.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {place.amenities.map((amenity) => <span key={amenity} className="rounded-full border border-[#741314] bg-[#FFF7E8]/80 px-3 py-1.5 text-xs font-semibold text-[#741314]">{amenity}</span>)}
        </div>
      ) : null}
      {!compact && place.isAccessible ? <p className="mt-4 text-sm font-semibold text-[#741314]">Acceso adaptado indicado</p> : null}
      <div className={`${compact ? "mt-3" : "mt-5"} flex items-center gap-2`}>
        <button
          type="button"
          onClick={onDiscover}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8] ${compact ? "py-2.5" : "py-3"}`}
        >
          Descubrir <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <NativeDirectionsLink
          destination={{ latitude: place.latitude, longitude: place.longitude }}
          destinationLabel={place.name}
          aria-label={`Cómo llegar a ${place.name}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#741314]/18 text-[#741314] transition hover:bg-[#741314]/[0.06]"
        >
          <Navigation className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </NativeDirectionsLink>
      </div>
    </div>
  );
}

function DistanceChip({ distance }: { distance: number }) {
  const walkingMinutes = Math.max(1, Math.round(distance * 12));
  return (
    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#741314] bg-[#741314]/[0.08] px-3 py-1.5 text-xs font-bold text-[#741314]">
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> A {formatDistanceLabel(distance)} · {walkingMinutes} min a pie
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
