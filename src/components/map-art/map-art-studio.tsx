"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { motion } from "motion/react";
import {
  Download,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";

import type { MapArtResponse } from "@/features/map-art/types";
import { saveUserLocation } from "@/features/location/browser-location";

type MapArtStudioProps = {
  initialQuery: string;
};

type ViewState = {
  x: number;
  y: number;
  scale: number;
};

type FrameStyle = {
  id: string;
  label: string;
  outer: string;
  inner: string;
  mat: string;
  localStroke: string;
  secondaryStroke: string;
  primaryStroke: string;
  text: string;
  meta: string;
};

const presets = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"];

const frameStyles: FrameStyle[] = [
  {
    id: "black",
    label: "Negro",
    outer: "#151515",
    inner: "#242424",
    mat: "#f3efe7",
    localStroke: "rgba(22,22,22,0.18)",
    secondaryStroke: "rgba(22,22,22,0.45)",
    primaryStroke: "#161616",
    text: "#161616",
    meta: "rgba(22,22,22,0.68)",
  },
  {
    id: "white",
    label: "Blanco",
    outer: "#e7e1d6",
    inner: "#f7f3eb",
    mat: "#fffdf8",
    localStroke: "rgba(24,24,24,0.16)",
    secondaryStroke: "rgba(24,24,24,0.42)",
    primaryStroke: "#181818",
    text: "#181818",
    meta: "rgba(24,24,24,0.68)",
  },
  {
    id: "wood",
    label: "Madera",
    outer: "#8c6847",
    inner: "#b3885f",
    mat: "#f5efe4",
    localStroke: "rgba(23,23,23,0.17)",
    secondaryStroke: "rgba(23,23,23,0.42)",
    primaryStroke: "#171717",
    text: "#171717",
    meta: "rgba(23,23,23,0.68)",
  },
];

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCoordinates(data: MapArtResponse) {
  return `${Math.abs(data.center.lat).toFixed(4)}° ${data.center.lat >= 0 ? "N" : "S"} · ${Math.abs(data.center.lon).toFixed(4)}° ${data.center.lon >= 0 ? "E" : "O"}`;
}

function getFittedView(data: MapArtResponse): ViewState {
  const padding = 320;
  const width = Math.max(40, data.contentBounds.maxX - data.contentBounds.minX);
  const height = Math.max(40, data.contentBounds.maxY - data.contentBounds.minY);
  const paddedWidth = Math.min(1000, width + padding * 2);
  const paddedHeight = Math.min(1000, height + padding * 2);
  const dimension = Math.max(paddedWidth, paddedHeight);
  const scale = clamp((1000 / dimension) * 0.55, 0.28, 3.5);
  const visibleSize = 1000 / scale;
  const centerX = (data.contentBounds.minX + data.contentBounds.maxX) / 2;
  const centerY = (data.contentBounds.minY + data.contentBounds.maxY) / 2;

  return {
    x: clamp(centerX - visibleSize / 2, 0, 1000 - visibleSize),
    y: clamp(centerY - visibleSize / 2, 0, 1000 - visibleSize),
    scale,
  };
}

function buildPosterSvg({
  data,
  frame,
  title,
  subtitle,
  view,
}: {
  data: MapArtResponse;
  frame: FrameStyle;
  title: string;
  subtitle: string;
  view: ViewState;
}) {
  const strokeFor = (kind: "primary" | "secondary" | "local") => {
    if (kind === "primary") {
      return { color: frame.primaryStroke, width: 4.8, opacity: 1 };
    }

    if (kind === "secondary") {
      return { color: frame.secondaryStroke, width: 3.2, opacity: 0.95 };
    }

    return { color: frame.localStroke, width: 0.85, opacity: 0.9 };
  };

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1800" height="2400" viewBox="0 0 1200 1600" fill="none">
      <rect width="1200" height="1600" fill="#ddd7cc" />
      <rect x="72" y="56" width="1056" height="1488" rx="28" fill="${frame.outer}" />
      <rect x="96" y="80" width="1008" height="1440" rx="18" fill="${frame.inner}" />
      <rect x="142" y="126" width="916" height="1348" fill="${frame.mat}" />
      <svg x="206" y="190" width="788" height="974" viewBox="${view.x} ${view.y} ${1000 / view.scale} ${1000 / view.scale}" preserveAspectRatio="xMidYMid slice">
        ${data.paths
          .map(
            (path) => {
              const stroke = strokeFor(path.kind);
              return `<path d="${path.d}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${stroke.opacity}" />`;
            },
          )
          .join("")}
      </svg>
      <text x="600" y="1270" text-anchor="middle" fill="${frame.text}" font-family="Georgia, Times New Roman, serif" font-size="56">${escapeXml(title)}</text>
      <text x="600" y="1320" text-anchor="middle" fill="${frame.meta}" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="3">${escapeXml(subtitle.toUpperCase())}</text>
      <text x="600" y="1362" text-anchor="middle" fill="${frame.meta}" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="2">${escapeXml(formatCoordinates(data))}</text>
    </svg>
  `;
}

function downloadPoster({
  data,
  frame,
  title,
  subtitle,
  view,
}: {
  data: MapArtResponse;
  frame: FrameStyle;
  title: string;
  subtitle: string;
  view: ViewState;
}) {
  const blob = new Blob([buildPosterSvg({ data, frame, title, subtitle, view })], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");

  link.href = url;
  link.download = `${safeName || "cuadro-mapa"}.svg`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function PosterPreview({
  data,
  frame,
  title,
  subtitle,
  view,
  onViewChange,
}: {
  data: MapArtResponse;
  frame: FrameStyle;
  title: string;
  subtitle: string;
  view: ViewState;
  onViewChange: React.Dispatch<React.SetStateAction<ViewState>>;
}) {
  const localPaths = data.paths.filter((path) => path.kind === "local");
  const secondaryPaths = data.paths.filter((path) => path.kind === "secondary");
  const primaryPaths = data.paths.filter((path) => path.kind === "primary");
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = 1000 / view.scale;
  const viewHeight = 1000 / view.scale;
  const fittedView = useMemo(() => getFittedView(data), [data]);

  const updateScale = (nextScale: number, originX = 500, originY = 500) => {
    onViewChange((current) => {
      const clampedScale = clamp(nextScale, Math.max(0.25, fittedView.scale * 0.6), 3.5);

      if (clampedScale === current.scale) {
        return current;
      }

      const currentViewWidth = 1000 / current.scale;
      const currentViewHeight = 1000 / current.scale;
      const worldX = current.x + (originX / 1000) * currentViewWidth;
      const worldY = current.y + (originY / 1000) * currentViewHeight;
      const nextViewWidth = 1000 / clampedScale;
      const nextViewHeight = 1000 / clampedScale;

      return {
        x: clamp(worldX - (originX / 1000) * nextViewWidth, 0, 1000 - nextViewWidth),
        y: clamp(worldY - (originY / 1000) * nextViewHeight, 0, 1000 - nextViewHeight),
        scale: clampedScale,
      };
    });
  };

  const beginDrag = (pointerId: number, clientX: number, clientY: number) => {
    dragStateRef.current = {
      pointerId,
      startClientX: clientX,
      startClientY: clientY,
      startX: view.x,
      startY: view.y,
    };
  };

  const updateDrag = (pointerId: number, clientX: number, clientY: number) => {
    const dragState = dragStateRef.current;
    const viewport = viewportRef.current;

    if (!dragState || dragState.pointerId !== pointerId || !viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const dx = ((clientX - dragState.startClientX) / rect.width) * viewWidth;
    const dy = ((clientY - dragState.startClientY) / rect.height) * viewHeight;

    onViewChange((current) => ({
      ...current,
      x: clamp(dragState.startX - dx, 0, 1000 - viewWidth),
      y: clamp(dragState.startY - dy, 0, 1000 - viewHeight),
    }));
  };

  const endDrag = (pointerId: number) => {
    if (dragStateRef.current?.pointerId === pointerId) {
      dragStateRef.current = null;
    }
  };

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_26%),#ddd7cc]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_24%,rgba(0,0,0,0.08))]" />
      <motion.div
        initial={{ opacity: 0.2, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative aspect-[3/4] h-[92%] max-h-[980px] w-auto max-w-[76vw] min-w-[280px]"
      >
        <div
          className="absolute inset-0 rounded-[1.8rem] shadow-[0_42px_120px_rgba(0,0,0,0.28)]"
          style={{ backgroundColor: frame.outer }}
        />
        <div
          className="absolute inset-[1.5%] rounded-[1.3rem]"
          style={{ backgroundColor: frame.inner }}
        />
        <div
          className="absolute inset-[5.8%] overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
          style={{ backgroundColor: frame.mat }}
        >
          <div
            ref={viewportRef}
            className="absolute left-[7%] right-[7%] top-[4.8%] bottom-[24%] overflow-hidden touch-none"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              beginDrag(event.pointerId, event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              updateDrag(event.pointerId, event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
              endDrag(event.pointerId);
            }}
            onPointerCancel={(event) => {
              endDrag(event.pointerId);
            }}
            onWheel={(event) => {
              event.preventDefault();
              const rect = event.currentTarget.getBoundingClientRect();
              const originX = ((event.clientX - rect.left) / rect.width) * 1000;
              const originY = ((event.clientY - rect.top) / rect.height) * 1000;
              updateScale(view.scale * (event.deltaY > 0 ? 0.9 : 1.1), originX, originY);
            }}
          >
            <svg
              viewBox={`${view.x} ${view.y} ${viewWidth} ${viewHeight}`}
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full cursor-grab active:cursor-grabbing"
              aria-hidden="true"
            >
              {localPaths.map((path, index) => (
                <path
                  key={`local-${index}`}
                  d={path.d}
                  fill="none"
                  stroke={frame.localStroke}
                  strokeWidth={0.85}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.9}
                />
              ))}
              {secondaryPaths.map((path, index) => (
                <path
                  key={`secondary-${index}`}
                  d={path.d}
                  fill="none"
                  stroke={frame.secondaryStroke}
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.95}
                />
              ))}
              {primaryPaths.map((path, index) => (
                <path
                  key={`primary-${index}`}
                  d={path.d}
                  fill="none"
                  stroke={frame.primaryStroke}
                  strokeWidth={4.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={1}
                />
              ))}
            </svg>

            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/75 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-black/55 backdrop-blur">
              Arrastra para mover · rueda para zoom
            </div>
          </div>

          <div className="absolute inset-x-[8%] bottom-[7%] text-center">
            <h1
              className="text-[clamp(1.6rem,2.7vw,3.25rem)] leading-none tracking-[-0.04em]"
              style={{ color: frame.text, fontFamily: "Georgia, serif" }}
            >
              {title}
            </h1>
            <p
              className="mt-4 text-[10px] uppercase tracking-[0.42em] sm:text-xs"
              style={{ color: frame.meta }}
            >
              {subtitle}
            </p>
            <p
              className="mt-3 text-[10px] tracking-[0.24em] sm:text-xs"
              style={{ color: frame.meta }}
            >
              {formatCoordinates(data)}
            </p>
          </div>

          <div className="absolute right-[8%] top-[8%] flex gap-2">
            <button
              type="button"
              onClick={() => updateScale(view.scale * 1.15)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/85 text-black shadow-sm backdrop-blur"
              aria-label="Acercar"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => updateScale(view.scale * 0.87)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/85 text-black shadow-sm backdrop-blur"
              aria-label="Alejar"
            >
              <Minus className="h-4 w-4" />
            </button>
              <button
                type="button"
                onClick={() => onViewChange(fittedView)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/85 text-black shadow-sm backdrop-blur"
                aria-label="Restablecer encuadre"
              >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function MapArtStudio({ initialQuery }: MapArtStudioProps) {
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState<MapArtResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frameId, setFrameId] = useState(frameStyles[0].id);
  const [title, setTitle] = useState("Madrid");
  const [subtitle, setSubtitle] = useState("España");
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);

  const frame = useMemo(
    () => frameStyles.find((item) => item.id === frameId) ?? frameStyles[0],
    [frameId],
  );

  const applyLocationLabels = useCallback((payload: MapArtResponse) => {
    const parts = payload.location.split(",").map((part) => part.trim());
    setTitle(parts[0] || payload.query);
    setSubtitle(parts.at(-1) || "Ubicación personalizada");
  }, []);

  const loadMap = useCallback((nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();

    if (!trimmedQuery) {
      setError("Escribe una ubicación.");
      return;
    }

    startTransition(async () => {
      setError(null);

      try {
        const response = await fetch(
          `/api/map-art?location=${encodeURIComponent(trimmedQuery)}`,
        );
        const payload = (await response.json()) as
          | MapArtResponse
          | { error?: string };

        if (!response.ok || !("paths" in payload)) {
          const errorMessage = "error" in payload ? payload.error : undefined;
          setData(null);
          setError(errorMessage ?? "No se pudo generar el mapa.");
          return;
        }

        setData(payload);
        applyLocationLabels(payload);
        setView(getFittedView(payload));
      } catch {
        setData(null);
        setError("No se pudo conectar con el generador.");
      }
    });
  }, [applyLocationLabels]);

  const loadMapByCoordinates = (latitude: number, longitude: number) => {
    startTransition(async () => {
      setError(null);

      try {
        const response = await fetch(
          `/api/map-art?lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}`,
        );
        const payload = (await response.json()) as
          | MapArtResponse
          | { error?: string };

        if (!response.ok || !("paths" in payload)) {
          const errorMessage = "error" in payload ? payload.error : undefined;
          setData(null);
          setError(errorMessage ?? "No se pudo localizar tu posición.");
          return;
        }

        setQuery(payload.query);
        setData(payload);
        applyLocationLabels(payload);
        setView(getFittedView(payload));
      } catch {
        setData(null);
        setError("No se pudo localizar tu posición.");
      }
    });
  };

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no permite ubicación automática.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        saveUserLocation({ latitude, longitude });
        setIsLocating(false);
        loadMapByCoordinates(latitude, longitude);
      },
      () => {
        setIsLocating(false);
        setError("No he podido acceder a tu ubicación.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  useEffect(() => {
    loadMap(initialQuery);
  }, [initialQuery, loadMap]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#ece6dc] text-[#171717]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col gap-4 border-r border-black/8 bg-[#faf6ef] p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-black/45">
              Cuadro mapa
            </p>
            <h2 className="mt-2 text-2xl tracking-[-0.04em]">
              Editor de cuadro mapa
            </h2>
            <p className="mt-2 text-sm text-black/52">
              Busca la ubicación, ajusta el encuadre y personaliza la lámina.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-black/8 bg-white/65 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
                  Ubicación
                </p>
                <p className="mt-1 text-sm text-black/52">
                  Busca una ciudad o toca una sugerencia.
                </p>
              </div>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={isLocating || isPending}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f7f3eb] px-3 py-2 text-[11px] text-black/65 transition hover:bg-white disabled:opacity-60"
              >
                {isLocating ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" />
                )}
                Mi ubicación
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[1.4rem] border border-black/10 bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/45">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    loadMap(query);
                  }
                }}
                placeholder="Madrid, Chueca, París, Tokio..."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/30"
              />
              <button
                type="button"
                onClick={() => loadMap(query)}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm text-white transition hover:bg-black disabled:opacity-60"
                aria-label="Buscar ubicación"
              >
                {isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setQuery(preset);
                    loadMap(preset);
                  }}
                  className="rounded-full border border-black/10 bg-[#f7f3eb] px-3 py-2 text-sm text-black/68 transition hover:bg-white hover:text-black"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.6rem] border border-black/8 bg-white/50 p-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-black/45">
                Título
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-black/45">
                Subtítulo
              </label>
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-black/8 bg-white/50 p-3">
            <label className="text-[11px] uppercase tracking-[0.28em] text-black/45">
              Marco
            </label>
            <div className="mt-3 flex gap-2">
              {frameStyles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFrameId(item.id)}
                  className="flex-1 rounded-full border px-3 py-2 text-xs transition"
                  style={{
                    borderColor:
                      item.id === frame.id ? "rgba(23,23,23,0.48)" : "rgba(23,23,23,0.1)",
                    backgroundColor:
                      item.id === frame.id ? "rgba(23,23,23,0.08)" : "#ffffff",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              data &&
              downloadPoster({
                data,
                frame,
                title,
                subtitle,
                view,
              })
            }
            disabled={!data}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm text-white disabled:opacity-45"
          >
            <Download className="h-4 w-4" />
            Descargar SVG
          </button>

          {error ? (
            <p className="text-sm text-[#8d2f14]">{error}</p>
          ) : null}
        </aside>

        <section className="min-h-0 bg-[#e7e0d4] p-5">
          {data ? (
            <PosterPreview
              data={data}
              frame={frame}
              title={title}
              subtitle={subtitle}
              view={view}
              onViewChange={setView}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-black/10 bg-white/35 text-sm text-black/45">
              {error ?? "Generando cuadro..."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
