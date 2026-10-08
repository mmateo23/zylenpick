"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { Check, Crosshair, MapPin, X } from "lucide-react";

import {
  saveUserLocation,
  type UserLocation,
} from "@/features/location/browser-location";

type ManualLocationPickerProps = {
  accessToken: string;
  center: { latitude: number; longitude: number };
  currentLocation: UserLocation | null;
  onClose: () => void;
  onConfirm?: (location: UserLocation) => void;
};

function ensureMapboxStylesheet() {
  if (document.getElementById("mapbox-gl-manual-location-stylesheet")) return;

  const stylesheet = document.createElement("link");
  stylesheet.id = "mapbox-gl-manual-location-stylesheet";
  stylesheet.rel = "stylesheet";
  stylesheet.href = "https://api.mapbox.com/mapbox-gl-js/v3.22.0/mapbox-gl.css";
  document.head.append(stylesheet);
}

export function ManualLocationPicker({
  accessToken,
  center,
  currentLocation,
  onClose,
  onConfirm,
}: ManualLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const initialLocation = currentLocation ?? center;
  const [draftLocation, setDraftLocation] = useState(initialLocation);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current) {
      setError("El mapa no está disponible ahora mismo.");
      return;
    }

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
          center: [initialLocation.longitude, initialLocation.latitude],
          zoom: currentLocation ? 16 : 14.5,
          attributionControl: false,
          pitchWithRotate: false,
          dragRotate: false,
        });
        mapRef.current = map;
        map.addControl(
          new mapboxgl.default.AttributionControl({ compact: true }),
          "bottom-right",
        );
        map.addControl(
          new mapboxgl.default.NavigationControl({
            showCompass: false,
            visualizePitch: false,
          }),
          "top-right",
        );

        map.once("load", () => {
          if (cancelled) return;
          setIsReady(true);
        });
        map.on("move", () => {
          const nextCenter = map.getCenter();
          setDraftLocation({
            latitude: nextCenter.lat,
            longitude: nextCenter.lng,
          });
        });
        map.on("click", (event) => {
          map.easeTo({ center: event.lngLat, duration: 240 });
        });
        map.on("error", () => {
          if (!cancelled) setError("No hemos podido cargar este mapa.");
        });
      } catch {
        if (!cancelled) setError("No hemos podido cargar este mapa.");
      }
    }

    void setupMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // This modal remounts for each manual selection session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const confirmLocation = () => {
    const savedLocation = saveUserLocation({
      latitude: draftLocation.latitude,
      longitude: draftLocation.longitude,
      accuracy: 0,
      capturedAt: Date.now(),
    });
    onConfirm?.(savedLocation);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#180309]/78 px-3 py-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-location-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[1.65rem] border-4 border-[#24110E] bg-[#F6D99A] p-2 shadow-[0_26px_80px_rgba(18,3,7,0.56)]">
        <div className="rounded-[1.15rem] border-2 border-[#741314] bg-[#FFF7E8] p-3 shadow-[inset_0_-6px_0_rgba(116,19,20,0.12)] sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#741314]/62">
                Pickyalo pocket map
              </p>
              <h2
                id="manual-location-title"
                className="mt-1 text-xl font-black tracking-[-0.035em] text-[#24110E]"
              >
                ¿Dónde estás ahora?
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#684237]">
                Mueve el mapa o toca un punto. El pin del centro eres tú.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="pickyalo-light-control grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#741314] bg-[#FDE3AD] text-[#741314] shadow-[0_3px_0_#741314] transition active:translate-y-[2px] active:shadow-none"
              aria-label="Cerrar selector de ubicación"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[0.8rem] border-4 border-[#24110E] bg-[#9AAF75] shadow-[inset_0_0_0_3px_#FDE3AD]">
            <div
              ref={mapContainerRef}
              className="pocket-location-map h-[min(48vh,23rem)] min-h-[18rem] w-full"
              aria-label="Mapa para elegir tu posición"
            />
            <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(rgba(36,17,14,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(36,17,14,0.055)_1px,transparent_1px)] bg-[size:8px_8px] mix-blend-multiply" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-[78%]">
              <div className="relative grid h-12 w-12 place-items-center rounded-full border-4 border-[#FFF7E8] bg-[#741314] text-[#FDE3AD] shadow-[0_5px_0_#24110E,0_8px_18px_rgba(36,17,14,0.34)]">
                <MapPin className="h-6 w-6" strokeWidth={2.6} />
                <span className="absolute -bottom-5 font-mono text-[9px] font-black uppercase tracking-[0.08em] text-[#24110E] [text-shadow:0_1px_0_#FFF7E8,1px_0_0_#FFF7E8,-1px_0_0_#FFF7E8]">
                  Tú
                </span>
              </div>
            </div>
            {!isReady && !error ? (
              <div className="absolute inset-0 z-[4] grid place-items-center bg-[#9AAF75] font-mono text-xs font-black uppercase tracking-[0.12em] text-[#24110E]">
                Cargando mapa…
              </div>
            ) : null}
            {error ? (
              <div className="absolute inset-0 z-[4] grid place-items-center bg-[#FDE3AD] p-6 text-center text-sm font-bold text-[#741314]">
                {error}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 text-[#741314]" aria-hidden="true">
              <span className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2 rounded-sm bg-[#741314]" />
              <span className="absolute left-0 top-1/2 h-5 w-full -translate-y-1/2 rounded-sm bg-[#741314]" />
              <Crosshair className="absolute left-1/2 top-1/2 z-[1] h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-[#FDE3AD]" />
            </div>
            <button
              type="button"
              onClick={confirmLocation}
              disabled={!isReady || Boolean(error)}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#24110E] bg-[#741314] px-5 text-sm font-black text-[#FFF7E8] shadow-[0_5px_0_#24110E] transition active:translate-y-[3px] active:shadow-[0_2px_0_#24110E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              Estoy aquí
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] font-semibold leading-4 text-[#684237]">
            Guardamos este punto durante 24 horas solo en este dispositivo.
          </p>
        </div>
      </div>

      <style jsx global>{`
        .pocket-location-map .mapboxgl-canvas {
          filter: sepia(0.2) saturate(0.78) contrast(1.08);
        }
        .pocket-location-map .mapboxgl-ctrl-group {
          overflow: hidden;
          border: 2px solid #24110e;
          border-radius: 6px;
          background: #fde3ad;
          box-shadow: 0 3px 0 #24110e;
        }
        .pocket-location-map .mapboxgl-ctrl-group button {
          width: 34px;
          height: 34px;
          background-color: #fde3ad;
        }
        .pocket-location-map .mapboxgl-ctrl-attrib {
          font-family: monospace;
          font-size: 9px;
        }
      `}</style>
    </div>
  );
}
