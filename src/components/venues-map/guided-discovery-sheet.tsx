"use client";

import {
  ArrowUpRight,
  ChevronDown,
  CircleDashed,
  Info,
  MapPin,
  Pencil,
  Shapes,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import type { DiscoveryGeometry } from "@/features/map-discovery/geometry";
import type { MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { MapPlaceIcon } from "@/features/map-places/icons";

export type GuidedDiscoveryIntent = "all" | "food" | "commerce";
export type GuidedDrawingMode = "circle" | "polygon" | null;

export type GuidedDiscoveryResult = {
  id: string;
  type: "venue" | "place";
  name: string;
  meta: string;
  imageUrl?: string | null;
};

type GuidedDiscoverySheetProps = {
  geometry: DiscoveryGeometry | null;
  drawingMode: GuidedDrawingMode;
  selectedIntent: GuidedDiscoveryIntent | null;
  results: GuidedDiscoveryResult[];
  categories: MapPlaceCategoryDefinition[];
  expanded: boolean;
  onStartDrawing: (mode: Exclude<GuidedDrawingMode, null>) => void;
  onCancelDrawing: () => void;
  onClearGeometry: () => void;
  onSelectIntent: (intent: GuidedDiscoveryIntent) => void;
  onClearIntent: () => void;
  onToggleResults: () => void;
  onSelectResult: (result: GuidedDiscoveryResult) => void;
  onClose: () => void;
};

const intentOptions = [
  { value: "all" as const, label: "Todo", icon: Sparkles },
  { value: "food" as const, label: "Comer", icon: Utensils },
  { value: "commerce" as const, label: "Comercios", icon: Store },
];

export function GuidedDiscoverySheet({
  geometry,
  drawingMode,
  selectedIntent,
  results,
  categories,
  expanded,
  onStartDrawing,
  onCancelDrawing,
  onClearGeometry,
  onSelectIntent,
  onClearIntent,
  onToggleResults,
  onSelectResult,
  onClose,
}: GuidedDiscoverySheetProps) {
  const [drawingOptionsOpen, setDrawingOptionsOpen] = useState(false);

  function startDrawing(mode: Exclude<GuidedDrawingMode, null>) {
    setDrawingOptionsOpen(false);
    onStartDrawing(mode);
  }

  return (
    <aside className="pickyalo-map-selection-sheet absolute inset-x-3 bottom-3 z-[7] max-h-[60%] overflow-y-auto overscroll-contain rounded-[1.5rem] border border-[#741314]/15 bg-[#FFF7E8] p-3 shadow-[0_8px_28px_rgba(36,17,14,0.14)] md:inset-x-auto md:bottom-4 md:left-4 md:w-[23rem] [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[#741314]">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-[#741314] transition hover:bg-[#FDE3AD]/50"
        aria-label="Cerrar búsqueda por zona"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {drawingMode ? (
        <div className="pr-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/62">
            Delimitar zona
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-tight text-[#24110E]">
            Dibuja directamente sobre el mapa
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-[#24110E]/68">
            Mantén pulsado y arrastra. Al soltar, actualizaremos los resultados.
          </p>
          <button
            type="button"
            onClick={onCancelDrawing}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314] px-4 text-sm font-bold text-[#741314]"
          >
            <X className="h-4 w-4" aria-hidden="true" /> Cancelar dibujo
          </button>
        </div>
      ) : !geometry ? (
        <div className="pr-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#741314]/62">
            Buscar en una zona
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-tight text-[#24110E]">
            Delimita dónde quieres mirar
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-[#24110E]/68">
            Elige una forma y dibuja directamente sobre el mapa.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <DrawingButton
              label="Círculo"
              description="Más rápido"
              icon={<CircleDashed className="h-5 w-5" aria-hidden="true" />}
              onClick={() => startDrawing("circle")}
            />
            <DrawingButton
              label="Forma libre"
              description="Más precisa"
              icon={<Shapes className="h-5 w-5" aria-hidden="true" />}
              onClick={() => startDrawing("polygon")}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="py-2 text-lg font-semibold leading-tight text-[#24110E]">
                ¿Qué te apetece?
              </h2>
            </div>
            {selectedIntent ? (
              <button
                type="button"
                onClick={onClearIntent}
                className="inline-flex min-h-11 items-center gap-1.5 px-1 text-xs font-bold text-[#741314]"
              >
                Limpiar <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="mt-1 grid grid-cols-3 gap-1.5" role="group" aria-label="Qué quieres encontrar">
            {intentOptions.map((option) => {
              const Icon = option.icon;
              const active = (selectedIntent ?? "all") === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => active ? onClearIntent() : onSelectIntent(option.value)}
                  className={`group flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-2 text-xs font-semibold transition-colors duration-150 motion-safe:active:scale-95 ${
                    active
                      ? "border-[#741314] bg-[#741314] text-[#FFF7E8]"
                      : "border-[#741314]/35 bg-[#FDE3AD]/35 text-[#741314] hover:bg-[#FDE3AD]"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {
            <div className="mt-3 border-t border-[#741314]/12 pt-2" aria-live="polite">
              <button
                type="button"
                onClick={onToggleResults}
                className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
                aria-expanded={expanded}
                disabled={results.length === 0}
                aria-label={expanded ? "Ocultar resultados" : `Ver ${results.length} ${results.length === 1 ? "resultado" : "resultados"}`}
              >
                <span>
                  <strong className="block text-sm text-[#24110E]">
                    {results.length} {results.length === 1 ? "resultado" : "resultados"}
                  </strong>
                  <span className="text-xs text-[#24110E]/62">
                    {results.length > 0 ? (geometry ? "En tu zona" : "Para descubrir") : "Prueba otra búsqueda o amplía la zona"}
                  </span>
                </span>
                {results.length > 0 ? (
                  <ChevronDown className={`h-5 w-5 text-[#741314] motion-safe:transition-transform motion-safe:duration-150 ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                ) : null}
              </button>

              {results.length > 0 ? (
                <div className="mt-2 grid max-h-52 divide-y divide-[#741314]/10 overflow-y-auto">
                  {(expanded ? results : results.slice(0, 1)).map((result) => (
                    <button
                      key={`${result.type}:${result.id}`}
                      type="button"
                      onClick={() => onSelectResult(result)}
                      className="group flex min-h-16 items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-[#FDE3AD]/40"
                    >
                      <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#FDE3AD]/70 text-[#741314]">
                        {result.imageUrl ? <Image src={result.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : result.type === "venue" ? <ShoppingBag className="h-5 w-5" aria-hidden="true" /> : <MapPin className="h-5 w-5" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-[#24110E]">{result.name}</strong>
                        <span className="mt-0.5 block truncate text-xs text-[#24110E]/75">{result.meta}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#741314] motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          }

          <details className="mt-2 border-t border-[#741314]/12">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-semibold text-[#741314] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314] [&::-webkit-details-marker]:hidden">
              <Info className="h-4 w-4" aria-hidden="true" />
              Leyenda del mapa
              <ChevronDown className="ml-auto h-4 w-4" aria-hidden="true" />
            </summary>
            <div className="pb-3 text-sm text-[#24110E]">
              <ul className="grid grid-cols-2 gap-x-3 gap-y-3" aria-label="Iconos del mapa">
                <li className="flex items-center gap-2">
                  <Image src="/icons/pickyalo-app.svg" alt="" width={28} height={28} className="shrink-0 rounded-full" />
                  <span>Local Pickyalo</span>
                </li>
                {categories.map((category) => (
                  <li key={category.value} className="flex min-w-0 items-center gap-2">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-[#FFF7E8] text-[#741314] ${category.value === "bench" ? "border-[#4f6954] !bg-[#edf2e8] !text-[#405b46]" : category.value === "tables" ? "border-[#9d572f] !bg-[#fde3ad] !text-[#71391f]" : "border-[#741314]"}`}>
                      <MapPlaceIcon name={category.iconName} className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>{category.label}</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 space-y-3 border-t border-[#741314]/12 pt-3" aria-label="Colores y zonas">
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#741314] bg-[#FDE3AD]" aria-hidden="true" />
                  Con ruta o historia para descubrir
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-[#741314] ring-2 ring-[#741314] ring-offset-2 ring-offset-[#FFF7E8]" aria-hidden="true" />
                  Punto seleccionado
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 shrink-0 rounded border border-[#741314] bg-[#741314]/10" aria-hidden="true" />
                  Zona delimitada
                </li>
              </ul>
            </div>
          </details>
          <div className="mt-2 border-t border-[#741314]/12 pt-2">
            {geometry ? (
              <div className="flex min-h-11 items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#24110E]">
                  <MapPin className="h-4 w-4 shrink-0 text-[#741314]" aria-hidden="true" />
                  <span className="truncate">
                    {geometry.type === "circle" ? "Zona circular aplicada" : "Zona personalizada aplicada"}
                  </span>
                </p>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => startDrawing(geometry.type)}
                    className="grid h-11 w-11 place-items-center rounded-full text-[#741314] transition hover:bg-[#FDE3AD]/45"
                    aria-label="Volver a dibujar la zona"
                    title="Volver a dibujar"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={onClearGeometry}
                    className="grid h-11 w-11 place-items-center rounded-full text-[#741314] transition hover:bg-[#FDE3AD]/45"
                    aria-label="Borrar la zona"
                    title="Borrar zona"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setDrawingOptionsOpen((current) => !current)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-bold text-[#741314]"
                  aria-expanded={drawingOptionsOpen}
                >
                  <span className="flex items-center gap-2">
                    <Shapes className="h-4 w-4" aria-hidden="true" />
                    Delimitar una zona
                  </span>
                  <span className="text-xs">{drawingOptionsOpen ? "Cerrar" : "Opcional"}</span>
                </button>
                {drawingOptionsOpen ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <DrawingButton
                      label="Círculo"
                      description="Rápido"
                      icon={<CircleDashed className="h-5 w-5" aria-hidden="true" />}
                      onClick={() => startDrawing("circle")}
                    />
                    <DrawingButton
                      label="Forma libre"
                      description="Más precisa"
                      icon={<Shapes className="h-5 w-5" aria-hidden="true" />}
                      onClick={() => startDrawing("polygon")}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

function DrawingButton({
  label,
  description,
  icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 items-center gap-2 rounded-xl border border-[#741314] bg-white/65 px-2.5 text-left text-[#741314] transition hover:bg-[#FDE3AD]/45"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#FDE3AD]/70">{icon}</span>
      <span>
        <strong className="block text-xs">{label}</strong>
        <span className="block text-[10px] text-[#24110E]/56">{description}</span>
      </span>
    </button>
  );
}
