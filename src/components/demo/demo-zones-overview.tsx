"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowUpRight, MapPinned, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DemoSiteHeader } from "@/components/demo/demo-site-header";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import type { City } from "@/features/cities/types";

gsap.registerPlugin(useGSAP);

type DemoZonesOverviewProps = {
  cities: City[];
  variant?: "demo" | "public";
};

const fallbackVideoSrc =
  "https://cdn.pixabay.com/video/2018/07/08/17177-278954650_large.mp4";
const talaveraDemoVideoSrc =
  "https://cdn.pixabay.com/video/2026/04/02/344075.mp4";

function buildHeroCities(cities: City[]) {
  return cities.slice(0, 6);
}

export function DemoZonesOverview({
  cities,
  variant = "demo",
}: DemoZonesOverviewProps) {
  const rootRef = useRef<HTMLElement>(null);
  const heroCities = useMemo(() => buildHeroCities(cities), [cities]);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const cityHrefBase = variant === "public" ? "/zonas" : "/demo/zonas";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsLightTheme(event.matches);
    };

    setIsLightTheme(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        return;
      }

      const intro = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      intro
        .fromTo(
          ".zones-hero-glow",
          { autoAlpha: 0, scale: 0.92, xPercent: -10 },
          {
            autoAlpha: 0.95,
            scale: 1,
            xPercent: 0,
            duration: 0.9,
          },
        )
        .fromTo(
          ".zones-hero-copy > *",
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.58,
            stagger: 0.08,
          },
          "-=0.25",
        )
        .fromTo(
          ".zones-chip",
          { autoAlpha: 0, y: 14, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            stagger: 0.045,
          },
          "-=0.2",
        )
        .fromTo(
          ".zones-city-card",
          { autoAlpha: 0, y: 30, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.06,
          },
          "-=0.1",
        );
    },
    { scope: rootRef },
  );

  return (
    <main
      ref={rootRef}
      className={`min-h-screen transition-colors ${
        isLightTheme ? "bg-[#f6f1e6] text-[#181816]" : "bg-[#050816] text-white"
      }`}
    >
      {variant === "public" ? (
        <SiteHeader />
      ) : (
        <DemoSiteHeader
          isLightTheme={isLightTheme}
          onToggleTheme={() => setIsLightTheme((value) => !value)}
        />
      )}

      <section className="relative overflow-hidden border-b border-white/6">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
          >
            <source src={fallbackVideoSrc} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,223,129,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,rgba(6,18,13,0.62)_0%,rgba(5,8,22,0.82)_100%)]" />
          <div className="zones-hero-glow absolute inset-y-0 left-[-12%] w-[42%] bg-[radial-gradient(circle_at_center,rgba(124,255,184,0.12),transparent_62%)] blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-6.5rem)] w-full max-w-7xl flex-col justify-center px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:px-12">
          <div className="zones-hero-copy max-w-[42rem]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/60 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-[#7cffb8]" />
              Explorador visual
            </div>

            <div className="space-y-4">
              <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.34em] text-white/44">
                Demo de ciudades
              </p>
              <h1 className="max-w-[12ch] text-[clamp(2.35rem,8.6vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-white">
                Elige dónde empieza tu próxima recogida.
              </h1>
              <p className="max-w-[36rem] text-[0.95rem] leading-6 text-white/56 sm:text-base sm:leading-7">
                El mismo contenido de cities, pero llevado a una lectura más
                visual, más limpia y más actual para entrar en cada ciudad sin
                ruido innecesario.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7">
              <span className="zones-chip rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/72 backdrop-blur-xl">
                {cities.length} ciudades activas
              </span>
              <span className="zones-chip rounded-full border border-[#7cffb8]/14 bg-[#7cffb8]/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7cffb8] backdrop-blur-xl">
                Entrada directa a la zona
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.028))] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:mt-8 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/38">
                  Ciudades activas
                </p>
                <p className="mt-2 text-sm text-white/58">
                  Una lectura rápida de las ciudades disponibles ahora mismo.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/14 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/54 backdrop-blur-xl">
                Live demo
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {heroCities.map((city) => (
                <span
                  key={city.id}
                  className="zones-chip rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/72 backdrop-blur-xl"
                >
                  <MapPinned className="mr-2 inline h-3.5 w-3.5 text-[#7cffb8]" />
                  {city.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`relative border-t px-3 py-6 transition-colors sm:px-6 sm:py-8 lg:px-8 lg:py-10 ${
          isLightTheme
            ? "border-black/6 bg-[#f6f1e6]"
            : "border-white/6 bg-[#050816]"
        }`}
      >
        <div className="mx-auto w-full max-w-[96rem]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p
                className={`text-[11px] font-medium uppercase tracking-[0.3em] ${
                  isLightTheme ? "text-[#181816]/42" : "text-white/42"
                }`}
              >
                Selección visual
              </p>
              <h2
                className={`mt-3 max-w-[13ch] text-[clamp(1.9rem,3.4vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.065em] ${
                  isLightTheme ? "text-[#181816]" : "text-white"
                }`}
              >
                Ciudades preparadas para descubrir locales.
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`${cityHrefBase}/${city.slug}`}
                className={`zones-city-card group relative overflow-hidden rounded-[1.4rem] border opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:rounded-[1.8rem] ${
                  isLightTheme
                    ? "border-black/8 bg-[#e8e1d2]"
                    : "border-white/10 bg-[#0b1211]"
                }`}
              >
                <div className="relative min-h-[19rem] sm:min-h-[22rem]">
                  {city.heroVideoUrl || city.slug === "talavera-de-la-reina" ? (
                    <video
                      src={city.heroVideoUrl ?? talaveraDemoVideoSrc}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : city.heroImageUrl ? (
                    <Image
                      src={city.heroImageUrl}
                      alt={city.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,223,129,0.28),rgba(8,12,19,0.9))]" />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,11,0.04),rgba(6,10,11,0.18)_42%,rgba(6,10,11,0.88)_100%)]" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/72 backdrop-blur-xl">
                      {city.region ?? "Zona"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] p-2 text-white/72 backdrop-blur-xl">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[1.5rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-[2rem]">
                      {city.name}
                    </p>
                    <p className="mt-3 max-w-[28ch] text-sm leading-6 text-white/58">
                      Entrar en la ciudad y explorar locales preparados para
                      recogida.
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ZylenPickFooter theme={isLightTheme ? "light" : "dark"} />
    </main>
  );
}
