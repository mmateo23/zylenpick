"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPinned, Sparkles, Store } from "lucide-react";

type ZylenPickFooterProps = {
  theme?: "dark" | "light";
};

const footerLinks = [
  {
    label: "Ciudades",
    href: "/zonas",
    icon: MapPinned,
  },
  {
    label: "Locales",
    href: "/zonas",
    icon: Store,
  },
  {
    label: "Proyecto",
    href: "/el-proyecto",
    icon: Sparkles,
  },
];

export function ZylenPickFooter({
  theme = "dark",
}: ZylenPickFooterProps) {
  const isLightTheme = theme === "light";

  return (
    <footer className="relative mt-0 overflow-hidden px-1.5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-0 sm:mt-4 sm:px-6 lg:px-8">
      <div
        className={
          isLightTheme
            ? "relative overflow-hidden rounded-[1.4rem] border border-black/[0.03] bg-[linear-gradient(135deg,rgba(246,242,234,0.98),rgba(242,236,225,0.94))] shadow-[0_10px_30px_rgba(0,0,0,0.035)] sm:rounded-[2rem]"
            : "relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(10,14,16,0.96),rgba(7,10,13,0.92))] shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:rounded-[2rem]"
        }
      >
        <div
          className={
            isLightTheme
              ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,223,129,0.15),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,222,128,0.12),transparent_28%)]"
              : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,223,129,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,214,102,0.14),transparent_26%)]"
          }
        />

        <div className="relative grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center">
              <Image
                src="/logo/ZyelnpickLOGO_greeb.svg"
                alt="ZylenPick"
                width={136}
                height={28}
                className="h-auto w-[92px] sm:w-[112px]"
              />
            </div>

            <h2
              className={
                isLightTheme
                  ? "mt-5 max-w-[12ch] text-[clamp(2.1rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-[#111111]"
                  : "mt-5 max-w-[12ch] text-[clamp(2.1rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-white"
              }
            >
              La nueva forma de descubrir qué pedir.
            </h2>

            <p
              className={
                isLightTheme
                  ? "mt-4 max-w-[36rem] text-sm leading-7 text-black/56 sm:text-base"
                  : "mt-4 max-w-[36rem] text-sm leading-7 text-white/56 sm:text-base"
              }
            >
              Una experiencia visual para ciudades, locales y platos pensada
              para encontrar mejor, decidir más rápido y hacer que cada pedido
              entre por los ojos.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {footerLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={
                    isLightTheme
                      ? "group flex items-center justify-between rounded-[1.15rem] border border-black/8 bg-white/58 px-4 py-4 text-sm text-black/72 backdrop-blur-xl transition hover:bg-white"
                      : "group flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/72 backdrop-blur-xl transition hover:bg-white/[0.07]"
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{link.label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              );
            })}

            <Link
              href="https://www.instagram.com/"
              className={
                isLightTheme
                  ? "group flex items-center justify-between rounded-[1.15rem] border border-black/8 bg-[#111111] px-4 py-4 text-sm text-white transition hover:bg-black"
                  : "group flex items-center justify-between rounded-[1.15rem] border border-[#7cffb8]/20 bg-[rgba(124,255,184,0.08)] px-4 py-4 text-sm text-white transition hover:bg-[rgba(124,255,184,0.14)]"
              }
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[9px] font-semibold uppercase leading-none">
                  IG
                </span>
                <span className="font-medium">Instagram</span>
              </span>
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
