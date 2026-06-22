"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsentStatus,
} from "@/lib/cookies/analytics-consent";

export function CookieConsentBanner() {
  const [consentStatus, setConsentStatus] =
    useState<AnalyticsConsentStatus>(null);
  const [hasLoadedConsent, setHasLoadedConsent] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const shouldShowPanel = isPanelOpen;

  useEffect(() => {
    const initialStatus = readAnalyticsConsent();
    setConsentStatus(initialStatus);
    setHasLoadedConsent(true);

    return subscribeAnalyticsConsent((nextStatus) => {
      setConsentStatus(nextStatus);
      setHasLoadedConsent(true);
      setIsPanelOpen(false);
    });
  }, []);

  const handleReject = () => {
    writeAnalyticsConsent("rejected");
    setIsPanelOpen(false);
  };

  const handleAccept = () => {
    writeAnalyticsConsent("accepted");
    setIsPanelOpen(false);
  };

  return (
    <>
      <style>
        {`
          @keyframes pickyalo-cookie-ticket-wiggle {
            0%, 88%, 100% { transform: translateY(0) rotate(0deg); }
            90% { transform: translateY(-3px) rotate(-4deg); }
            93% { transform: translateY(1px) rotate(3deg); }
            96% { transform: translateY(-1px) rotate(-2deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            .pickyalo-cookie-ticket-icon {
              animation: none !important;
            }
          }
        `}
      </style>

      {shouldShowPanel ? (
        <section
          aria-label="Preferencias de cookies"
          className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-[23rem] text-[#381932] sm:bottom-5 sm:right-5 sm:left-auto sm:mx-0"
        >
          <div className="relative overflow-hidden rounded-[1rem] border border-[#381932]/14 bg-[#fffdf5] shadow-[0_22px_70px_rgba(56,25,50,0.18)]">
            <div
              aria-hidden="true"
              className="h-2.5 bg-[radial-gradient(circle_at_6px_-3px,transparent_7px,#fffdf5_8px)] bg-[length:16px_10px]"
            />

            <div className="px-4 pb-4 pt-3.5 sm:px-4.5">
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="pickyalo-cookie-ticket-icon relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.8rem] border border-dashed border-[#381932]/22 bg-[#FFE9EC] font-mono text-[13px] font-black text-[#C26157] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] [animation:pickyalo-cookie-ticket-wiggle_5.2s_ease-in-out_infinite]"
                >
                  <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#fffdf5]" />
                  <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#fffdf5]" />
                  PY
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#C26157]">
                    Cookie ticket
                  </p>
                  <h2 className="mt-1 text-[1.35rem] font-black uppercase leading-[0.9] tracking-[-0.05em]">
                    Analítica clara
                  </h2>
                  <p className="mt-2 text-[13px] leading-5 text-[#381932]/76">
                    Usamos analítica para mejorar Pickyalo. No vendemos tus
                    datos ni capturamos información personal.
                  </p>
                </div>
              </div>

              <div className="my-3 border-t border-dashed border-[#381932]/22" />

              <div className="grid grid-cols-3 gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#381932]/62">
                <div>
                  <span className="block">Uso</span>
                  <strong className="mt-0.5 block text-[10px] text-[#381932]">
                    Producto
                  </strong>
                </div>
                <div>
                  <span className="block">Venta</span>
                  <strong className="mt-0.5 block text-[10px] text-[#381932]">
                    No
                  </strong>
                </div>
                <div>
                  <span className="block">Personal</span>
                  <strong className="mt-0.5 block text-[10px] text-[#381932]">
                    No
                  </strong>
                </div>
              </div>

              <div className="my-3 border-t border-dashed border-[#381932]/22" />

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleReject}
                    className="inline-flex min-h-10 items-center justify-center rounded-[0.75rem] border border-[#381932]/18 bg-[#fffdf5] px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.11em] text-[#381932] transition hover:bg-[#FFE9EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C26157]/45"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="inline-flex min-h-10 items-center justify-center rounded-[0.75rem] border border-[#381932]/18 bg-[#fffdf5] px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.11em] text-[#381932] transition hover:bg-[#FFE9EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C26157]/45"
                  >
                    Aceptar analítica
                  </button>
                </div>

                <Link
                  href="/cookies"
                  className="self-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#C26157] underline-offset-4 hover:underline"
                >
                  Política de cookies
                </Link>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="h-2.5 rotate-180 bg-[radial-gradient(circle_at_6px_-3px,transparent_7px,#fffdf5_8px)] bg-[length:16px_10px]"
            />
          </div>
        </section>
      ) : null}

      {hasLoadedConsent && consentStatus !== "accepted" && !isPanelOpen ? (
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          aria-label="Cambiar preferencias de cookies"
          className="fixed bottom-3 left-3 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#381932]/12 bg-[#fffdf5] text-[#381932] shadow-[0_10px_30px_rgba(56,25,50,0.14)] transition hover:bg-[#FFE9EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C26157]/45"
        >
          <svg
            aria-hidden="true"
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20.2 13.2a7.8 7.8 0 1 1-9.4-9.4 3.1 3.1 0 0 0 3.7 3.7 3.1 3.1 0 0 0 2 3.9 3.1 3.1 0 0 0 3.7 1.8Z"
              fill="#FFE9EC"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M9 10.2h.01M13.6 14.5h.01M8.4 16.4h.01M15.2 9.4h.01"
              stroke="#C26157"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </>
  );
}
