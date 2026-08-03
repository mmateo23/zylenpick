"use client";

import Link from "next/link";
import { LocateFixed, MapPinned, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useNearMode } from "@/features/location/use-near-mode";

type NearModeControlProps = {
  zoneHref?: string;
  compact?: boolean;
  floating?: boolean;
};

export function NearModeControl({
  zoneHref = "/zonas",
  compact = false,
  floating = false,
}: NearModeControlProps) {
  const { isActive, isLocating, feedback, activate, disable, clearFeedback } =
    useNearMode();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        clearFeedback();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        clearFeedback();
      }
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [clearFeedback, isOpen]);

  const handleActivate = async () => {
    const nextLocation = await activate();
    if (nextLocation) window.setTimeout(() => setIsOpen(false), 650);
  };

  const buttonLabel = isActive ? "Cerca activo" : "Cerca de mí";

  return (
    <div
      ref={rootRef}
      className={floating ? "fixed bottom-5 left-4 z-[62] sm:left-6" : "relative"}
    >
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={buttonLabel}
        title={buttonLabel}
        className={`relative inline-flex items-center justify-center border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]/30 ${
          floating
            ? "h-12 gap-2 rounded-full border-[#741314]/16 bg-[#FFF7E8]/94 px-4 text-sm font-bold text-[#741314] shadow-[0_14px_35px_rgba(116,19,20,0.18)] backdrop-blur-xl"
            : compact
              ? `h-9 w-9 rounded-full ${isActive ? "border-[#741314] bg-[#741314] text-[#FDE3AD]" : "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314]"}`
              : `h-14 w-[4.35rem] flex-col gap-1 rounded-[1.25rem] ${isActive ? "border-[#741314] bg-[#741314] text-[#FDE3AD]" : "border-transparent text-[#741314]/72 hover:-translate-y-[1px] hover:bg-[#741314]/10 hover:text-[#741314]"}`
        }`}
      >
        <LocateFixed aria-hidden="true" size={compact ? 22 : floating ? 20 : 24} strokeWidth={2.05} />
        {!compact ? (
          <span className={floating ? "leading-none" : "text-[10px] font-semibold leading-none"}>
            {floating ? buttonLabel : "Cerca"}
          </span>
        ) : null}
        {isActive ? (
          <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FFF7E8] bg-emerald-500" />
        ) : null}
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Preferencias de cercanía"
          className={`rounded-[1.2rem] border border-[#741314]/14 bg-[#FFF7E8] p-4 text-[#741314] shadow-[0_20px_55px_rgba(116,19,20,0.2)] ${
            floating
              ? "absolute bottom-[calc(100%+0.65rem)] left-0 w-[min(20rem,calc(100vw-1.5rem))]"
              : compact
                ? "fixed left-3 right-3 top-[4.75rem] w-auto"
                : "absolute left-1/2 top-[calc(100%+0.65rem)] w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black">
                {isActive ? "Cerca de ti está activo" : "¿Qué puedes recoger cerca?"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#741314]/68">
                Ordenamos locales y platos por distancia. Tu ubicación se queda en este dispositivo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#741314]/8"
              aria-label="Cerrar"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={handleActivate}
              disabled={isLocating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#741314] px-4 text-sm font-bold text-[#FDE3AD] transition hover:bg-[#5F0F10] disabled:cursor-wait disabled:opacity-65"
            >
              <LocateFixed aria-hidden="true" className="h-4 w-4" />
              {isLocating ? "Calculando…" : isActive ? "Actualizar ubicación" : "Usar mi ubicación"}
            </button>
            <Link
              href={zoneHref}
              onClick={() => setIsOpen(false)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#741314]/16 px-4 text-sm font-bold transition hover:bg-[#741314]/[0.07]"
            >
              <MapPinned aria-hidden="true" className="h-4 w-4" />
              Elegir zona
            </Link>
            {isActive ? (
              <button
                type="button"
                onClick={() => {
                  disable();
                  setIsOpen(false);
                }}
                className="min-h-9 text-xs font-semibold text-[#741314]/62 underline decoration-[#741314]/24 underline-offset-4"
              >
                Desactivar cercanía
              </button>
            ) : null}
          </div>
          {feedback ? (
            <p className="mt-3 text-xs font-semibold leading-5" role="status" aria-live="polite">
              {feedback}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
