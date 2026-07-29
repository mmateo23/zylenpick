"use client";

import { useEffect, useState } from "react";
import { LocateFixed, X } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  getUserLocationErrorMessage,
  readUserLocation,
  requestUserLocation,
} from "@/features/location/browser-location";

const PROMPT_DISMISSED_AT_KEY = "pickyalo.location-prompt-dismissed-at";
const PROMPT_DISMISSED_FOR_MS = 24 * 60 * 60 * 1000;

function isDiscoveryPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/platos" ||
    pathname === "/zonas" ||
    pathname.startsWith("/zonas/")
  );
}

export function LocationDiscoveryPrompt() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isDiscoveryPath(pathname) || readUserLocation()) return;

    const dismissedAt = Number(
      window.localStorage.getItem(PROMPT_DISMISSED_AT_KEY),
    );

    if (
      Number.isFinite(dismissedAt) &&
      Date.now() - dismissedAt < PROMPT_DISMISSED_FOR_MS
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => setIsVisible(true), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  const dismiss = () => {
    window.localStorage.setItem(PROMPT_DISMISSED_AT_KEY, String(Date.now()));
    setIsVisible(false);
  };

  const handleUseLocation = async () => {
    setIsLocating(true);
    setFeedback(null);

    try {
      await requestUserLocation();
      window.localStorage.removeItem(PROMPT_DISMISSED_AT_KEY);
      setIsVisible(false);
    } catch (error) {
      setFeedback(getUserLocationErrorMessage(error));
    } finally {
      setIsLocating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Descubrir locales cercanos"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[64] w-[min(calc(100vw-1.5rem),29rem)] -translate-x-1/2 rounded-[1.2rem] border border-[#741314]/16 bg-[#FFF7E8]/96 p-3 text-[#741314] shadow-[0_18px_55px_rgba(116,19,20,0.2)] backdrop-blur-xl sm:p-3.5"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#741314] text-[#FFF7E8]">
          <LocateFixed aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">Descubre qué locales tienes más cerca</p>
          <p className="mt-1 text-xs leading-5 text-[#741314]/68">
            Tu ubicación se usa para ordenar distancias y solo se guarda en este dispositivo.
          </p>
          {feedback ? (
            <p className="mt-2 text-xs font-semibold leading-5" role="status" aria-live="polite">
              {feedback}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[#741314] px-4 py-2 text-xs font-bold text-[#FFF7E8] transition hover:bg-[#5F0F10] disabled:cursor-wait disabled:opacity-65"
          >
            {isLocating ? "Calculando…" : "Usar mi ubicación"}
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#741314]/55 transition hover:bg-[#741314]/8 hover:text-[#741314]"
          aria-label="Cerrar aviso de ubicación"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
