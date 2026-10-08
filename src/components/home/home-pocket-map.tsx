"use client";

import Link from "next/link";
import { MapPinned } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LngLatBoundsLike, Map as MapboxMap, Marker } from "mapbox-gl";

import styles from "./home-discovery.module.css";

type PocketMapItem = {
  id: string;
  title: string;
  href: string;
  latitude: number;
  longitude: number;
};

type HomePocketMapProps = {
  accessToken: string;
  cityName: string;
  items: PocketMapItem[];
  onOpen: () => void;
};

function ensureMapboxStylesheet() {
  if (document.getElementById("mapbox-gl-home-pocket-stylesheet")) return;
  const stylesheet = document.createElement("link");
  stylesheet.id = "mapbox-gl-home-pocket-stylesheet";
  stylesheet.rel = "stylesheet";
  stylesheet.href = "https://api.mapbox.com/mapbox-gl-js/v3.22.0/mapbox-gl.css";
  document.head.append(stylesheet);
}

export function HomePocketMap({ accessToken, cityName, items, onOpen }: HomePocketMapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !accessToken || !hostRef.current || !items.length) return;
    let cancelled = false;
    ensureMapboxStylesheet();

    async function setupMap() {
      try {
        const mapboxgl = await import("mapbox-gl");
        if (cancelled || !hostRef.current) return;
        mapboxgl.default.accessToken = accessToken;

        const map = new mapboxgl.default.Map({
          container: hostRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [items[0].longitude, items[0].latitude],
          zoom: 13.4,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
          cooperativeGestures: true,
        });
        mapRef.current = map;
        map.scrollZoom.disable();
        map.touchZoomRotate.disableRotation();
        map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new mapboxgl.default.AttributionControl({ compact: true }), "bottom-left");

        map.once("load", () => {
          if (cancelled) return;
          const bounds = new mapboxgl.default.LngLatBounds();

          markersRef.current = items.map((item) => {
            bounds.extend([item.longitude, item.latitude]);
            const markerLink = document.createElement("a");
            markerLink.href = item.href;
            markerLink.className = "pickyalo-pocket-marker";
            markerLink.setAttribute("aria-label", `${item.title} · abrir ficha`);
            markerLink.title = item.title;
            markerLink.innerHTML = '<span aria-hidden="true"></span>';
            markerLink.addEventListener("click", onOpen);
            const marker = new mapboxgl.default.Marker({ element: markerLink, anchor: "bottom" })
              .setLngLat([item.longitude, item.latitude])
              .addTo(map);
            markerLink.setAttribute("role", "link");
            return marker;
          });

          if (items.length > 1) {
            map.fitBounds(bounds as LngLatBoundsLike, { padding: 46, maxZoom: 14.4, duration: 0 });
          }
          setReady(true);
        });
        map.on("error", () => {
          if (!cancelled) setFailed(true);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void setupMap();
    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [accessToken, items, onOpen, shouldLoad]);

  return (
    <div className={styles.pocketMap} aria-label={`Mapa compacto e interactivo de ${cityName}`}>
      <div ref={hostRef} className={styles.pocketMapCanvas} />
      <div className={styles.pocketPixels} aria-hidden="true" />
      {!ready ? <span className={styles.pocketLoading}>{failed || !accessToken ? "Abre el mapa para explorar" : "Cargando ciudad…"}</span> : null}
      <span className={styles.pocketPlaceLabel} aria-hidden="true">{cityName}</span>
      <Link href="/mapa" className={styles.pocketOpen} onClick={onOpen}>
        <MapPinned size={17} aria-hidden="true" /> Explorar
      </Link>
    </div>
  );
}
