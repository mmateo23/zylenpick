"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const DISMISSED_KEY = "pickyalo.pwa-install-dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return true;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIOSDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const forcePrompt = new URLSearchParams(window.location.search).has(
      "pwa_prompt",
    );

    if (!forcePrompt && isStandaloneMode()) {
      return;
    }

    if (window.localStorage.getItem(DISMISSED_KEY) === "true") {
      if (!forcePrompt) {
        return;
      }

      window.localStorage.removeItem(DISMISSED_KEY);
    }

    if (forcePrompt) {
      setShowIOSInstructions(true);
      setIsVisible(true);
    }

    const isiOS = isIOSDevice();
    if (isiOS) {
      setShowIOSInstructions(true);
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowIOSInstructions(false);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(DISMISSED_KEY, "true");
      setInstallPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    window.localStorage.setItem(DISMISSED_KEY, "true");
    setInstallPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const canInstall = Boolean(installPrompt);

  return (
    <aside
      aria-label="Instalar Pickyalo"
      className="fixed left-1/2 top-[calc(0.75rem+env(safe-area-inset-top))] z-[65] w-[min(calc(100vw-1.5rem),35rem)] -translate-x-1/2 rounded-[1.5rem] border border-[#381932]/10 bg-[#fffaf3]/95 px-2.5 py-2 text-[#381932] shadow-[0_18px_56px_rgba(56,25,50,0.16)] backdrop-blur-xl sm:top-4 sm:rounded-full"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FED47D] shadow-[0_10px_24px_rgba(254,212,125,0.28)]">
          <Image
            src="/logo/Pickyalo_isotipo_Coral.svg"
            alt=""
            width={25}
            height={25}
            className="h-[25px] w-[25px]"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-black">
            {"A\u00f1adir Pickyalo a inicio"}
          </p>
          <p className="truncate text-xs font-medium text-[#381932]/62">
            {canInstall
              ? "\u00c1brelo como una app cuando quieras."
              : "En iPhone: Compartir y A\u00f1adir a pantalla de inicio."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {canInstall ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="rounded-full bg-[#C26157] px-3.5 py-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(194,97,87,0.22)] transition hover:bg-[#aa5048]"
            >
              Instalar
            </button>
          ) : null}

          {showIOSInstructions ? (
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full bg-[#C26157] px-3.5 py-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(194,97,87,0.22)] transition hover:bg-[#aa5048]"
            >
              Entendido
            </button>
          ) : null}

          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full text-base font-black text-[#381932]/48 transition hover:bg-[#381932]/8 hover:text-[#381932]"
            aria-label="Cerrar aviso de instalaci\u00f3n"
          >
            &times;
          </button>
        </div>
      </div>
    </aside>
  );
}
