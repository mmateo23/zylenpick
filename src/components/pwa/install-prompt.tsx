"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowDownToLine, Check, ChevronDown, PlusSquare, Share, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const DISMISSED_KEY = "pickyalo.pwa-install-dismissed";

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, "true");
  } catch {
    // Private browsing may disable storage; closing must still work.
  }
}

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

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const dismissed = useRef(false);

  useEffect(() => {
    const forcePrompt = new URLSearchParams(window.location.search).has(
      "pwa_prompt",
    );

    if (!forcePrompt && isStandaloneMode()) {
      return;
    }

    try {
      if (!forcePrompt && window.localStorage.getItem(DISMISSED_KEY) === "true") {
        return;
      }
    } catch {
      // Installation remains available when local storage is blocked.
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
      if (dismissed.current) return;
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowIOSInstructions(false);
      setGuideOpen(false);
      setError(null);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      rememberDismissal();
      dismissed.current = true;
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
    rememberDismissal();
    dismissed.current = true;
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!installPrompt || submitting.current) {
      return;
    }

    submitting.current = true;
    setIsInstalling(true);
    setError(null);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") rememberDismissal();
      dismissed.current = true;
      setIsVisible(false);
    } catch {
      setError("No se ha podido abrir la instalación. Recarga la página para intentarlo de nuevo o utiliza el menú de tu navegador.");
    } finally {
      // Each browser installation event can only be used once.
      setInstallPrompt(null);
      setIsInstalling(false);
      submitting.current = false;
    }
  };

  if (
    !isVisible ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/manage") ||
    pathname.startsWith("/explora/") ||
    pathname.startsWith("/q/")
  ) {
    return null;
  }

  const canInstall = Boolean(installPrompt);

  return (
    <aside
      aria-labelledby="pwa-install-title"
      className="fixed left-3 right-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-[65] max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] overflow-y-auto overscroll-contain whitespace-normal rounded-2xl border border-[#741314]/25 bg-[#FFF7E8] p-4 text-[#24110E] shadow-[0_12px_40px_rgba(36,17,14,0.16)] [overflow-wrap:anywhere] sm:left-auto sm:right-5 sm:w-[400px]"
    >
      <div className="flex items-center gap-3 pr-9">
          <Image
            src="/icons/pickyalo-app.svg"
            alt=""
            width={52}
            height={52}
            className="h-[52px] w-[52px] shrink-0 rounded-xl"
            aria-hidden="true"
          />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#741314]">En tu pantalla de inicio</p>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar aviso de instalación"
        className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-[#741314] hover:bg-[#FDE3AD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#741314]"
      >
        <X size={20} aria-hidden="true" />
      </button>
      <h2 id="pwa-install-title" className="mt-3 whitespace-normal text-xl font-bold leading-7">
        Pickyalo, siempre a mano.
      </h2>
      <p className="mb-3 mt-1 text-sm leading-6">Tus platos y tu ciudad, a un toque.</p>
      <div className="flex flex-col items-stretch gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:gap-2">
        {canInstall ? (
          <button
            type="button"
            onClick={() => void handleInstall()}
            disabled={isInstalling}
            aria-busy={isInstalling}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#741314] px-4 py-2.5 text-sm font-semibold text-[#FFF7E8] hover:bg-[#5F0F10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#741314] disabled:opacity-60"
          >
            <ArrowDownToLine size={18} aria-hidden="true" />
            {isInstalling ? "Abriendo instalación…" : "Instalar Pickyalo"}
          </button>
        ) : showIOSInstructions ? (
          <button
            type="button"
            aria-expanded={guideOpen}
            aria-controls="pwa-install-guide"
            onClick={() => setGuideOpen(!guideOpen)}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#741314] px-4 py-2.5 text-sm font-semibold text-[#FFF7E8] hover:bg-[#5F0F10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#741314]"
          >
            Cómo añadirlo <ChevronDown size={18} aria-hidden="true" className={guideOpen ? "rotate-180" : ""} />
          </button>
        ) : null}
        <button type="button" onClick={dismiss} className="min-h-11 rounded-lg px-3 text-sm font-medium text-[#741314] underline decoration-[#741314]/35 underline-offset-4 hover:bg-[#FDE3AD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">
          Ahora no
        </button>
      </div>
      {showIOSInstructions && guideOpen ? (
        <div id="pwa-install-guide" className="mt-4 border-t border-[#741314]/20 pt-4">
          <p className="mb-3 text-sm font-semibold">Desde Safari, en tres pasos:</p>
          <ol className="space-y-3 text-sm leading-5">
            <li className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#FDE3AD] text-[#741314]"><Share size={20} aria-hidden="true" /></span><span><strong>1. Abre Compartir</strong><br />En el menú del navegador.</span></li>
            <li className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#FDE3AD] text-[#741314]"><PlusSquare size={20} aria-hidden="true" /></span><span><strong>2. Añadir a pantalla de inicio</strong><br />Desplaza el menú si no aparece.</span></li>
            <li className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#FDE3AD] text-[#741314]"><Check size={20} aria-hidden="true" /></span><span><strong>3. Confirma con Añadir</strong><br />Si aparece, activa «Abrir como app web».</span></li>
          </ol>
          <p className="mt-3 text-xs leading-5 text-[#741314]">
            Si estás dentro de otra app, abre primero Pickyalo en Safari.
          </p>
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-3 text-sm leading-5 text-[#741314]">{error}</p> : null}
    </aside>
  );
}
