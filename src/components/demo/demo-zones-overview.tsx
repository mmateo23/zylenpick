"use client";

import { useMemo, useRef } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowUpRight, MapPinned, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DemoSiteHeader } from "@/components/demo/demo-site-header";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import type { City } from "@/features/cities/types";
import type { SiteDesignConfig } from "@/features/design/site-design-config";

gsap.registerPlugin(useGSAP);

type DemoZonesOverviewProps = {
  cities: City[];
  variant?: "demo" | "public";
  design?: SiteDesignConfig;
};

const fallbackVideoSrc =
  "https://cdn.pixabay.com/video/2018/07/08/17177-278954650_large.mp4";
const talaveraDemoVideoSrc =
  "https://cdn.pixabay.com/video/2026/04/02/344075.mp4";

const comingSoonZones = [
  {
    id: "soon-toledo",
    slug: "toledo",
    name: "Toledo",
    region: "Castilla-La Mancha",
    imageUrl: "/home/zonas/toledo-card.jpg",
  },
  {
    id: "soon-soria",
    slug: "soria",
    name: "Soria",
    region: "Castilla y León",
    imageUrl: "/home/zonas/soria-card.jpg",
  },
  {
    id: "soon-avila",
    slug: "avila",
    name: "Ávila",
    region: "Castilla y León",
    imageUrl: "/home/zonas/avila-card.jpg",
  },
  {
    id: "soon-segovia",
    slug: "segovia",
    name: "Segovia",
    region: "Castilla y León",
    imageUrl: "/home/zonas/segovia-card.jpg",
  },
  {
    id: "soon-guadalajara",
    slug: "guadalajara",
    name: "Guadalajara",
    region: "Castilla-La Mancha",
    imageUrl: "/home/zonas/guadalajara-card.jpg",
  },
  {
    id: "soon-cuenca",
    slug: "cuenca",
    name: "Cuenca",
    region: "Castilla-La Mancha",
    imageUrl: "/home/zonas/cuenca-card.jpg",
  },
  {
    id: "soon-ciudad-real",
    slug: "ciudad-real",
    name: "Ciudad Real",
    region: "Castilla-La Mancha",
    imageUrl: "/home/zonas/ciudad-real-card.jpg",
  },
];

function buildHeroCities(cities: City[]) {
  return cities.slice(0, 6);
}

function getCityDecisionContext(city: City, index: number) {
  if (city.heroVideoUrl || city.heroImageUrl) {
    return "productos, platos y locales";
  }

  if (index < 3) {
    return "para decidir rápido";
  }

  return "locales cercanos";
}

function getCityDecisionSignal(city: City, index: number) {
  if (city.heroVideoUrl || city.slug === "talavera-de-la-reina") {
    return "Ver esta zona";
  }

  if (city.heroImageUrl) {
    return "Platos y locales";
  }

  if (index < 3) {
    return "Decidir rápido";
  }

  return "Locales cerca";
}

export function DemoZonesOverview({
  cities,
  variant = "demo",
  design,
}: DemoZonesOverviewProps) {
  const rootRef = useRef<HTMLElement>(null);
  const heroCities = useMemo(() => buildHeroCities(cities), [cities]);
  const isLightTheme = variant === "public";
  const cityHrefBase = variant === "public" ? "/zonas" : "/demo/zonas";
  const zonesHeroMediaType = design?.media.zonesHeroMediaType ?? "video";
  const zonesHeroMediaUrl = design?.media.zonesHeroMediaUrl || fallbackVideoSrc;

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
        isLightTheme ? "bg-[#fcfaf5] text-[#24110E]" : "bg-[#050816] text-white"
      }`}
    >
      {variant === "public" ? (
        <SiteHeader />
      ) : (
        <DemoSiteHeader isLightTheme={isLightTheme} />
      )}

      <section className={isLightTheme ? "relative overflow-hidden px-1.5 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-7 lg:px-8 lg:pt-9" : "relative overflow-hidden border-b border-white/6"}>
        {isLightTheme ? (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(116,19,20,0.10),transparent_24%),linear-gradient(180deg,#fcfaf5_0%,#f2ece1_100%)]" />
        ) : null}

        <div className={isLightTheme ? "relative z-10 mx-auto max-w-[1600px]" : "relative mx-auto w-full max-w-7xl"}>
          <div className={isLightTheme ? "relative -mx-2 overflow-hidden rounded-[2rem] px-4 py-8 sm:-mx-4 sm:px-7 sm:py-9 lg:px-10 lg:py-10" : "relative flex min-h-[calc(100svh-6.5rem)] flex-col justify-center px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:px-12"}>
            <div className={isLightTheme ? "absolute inset-0 -z-10 overflow-hidden rounded-[inherit] bg-[#741314]" : "absolute inset-0 -z-10 overflow-hidden"}>
          {zonesHeroMediaType === "image" ? (
            <Image
              src={zonesHeroMediaUrl}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="scale-[1.04] object-cover opacity-72 saturate-[1.05]"
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-72 saturate-[1.05]"
            >
              <source src={zonesHeroMediaUrl} type="video/mp4" />
            </video>
          )}
              <div className={isLightTheme ? "absolute inset-0 bg-[linear-gradient(110deg,rgba(253,227,173,0.30)_0%,rgba(253,227,173,0)_100%)]" : "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(116,19,20,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,rgba(6,18,13,0.62)_0%,rgba(5,8,22,0.82)_100%)]"} />
            </div>
            <div className={isLightTheme ? "zones-hero-glow absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(circle_at_18%_18%,rgba(253,227,173,0.18),transparent_34%),radial-gradient(circle_at_84%_28%,rgba(253,227,173,0.14),transparent_32%),linear-gradient(180deg,rgba(255,247,232,0.08),transparent_42%)]" : "zones-hero-glow absolute inset-y-0 left-[-12%] -z-10 w-[42%] bg-[radial-gradient(circle_at_center,rgba(116,19,20,0.12),transparent_62%)] blur-3xl"} />

        <div className="relative z-10 grid min-h-[min(52svh,31rem)] items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:gap-12">
          <div className="zones-hero-copy max-w-[42rem]">
            <div className="space-y-4">
              <p className={isLightTheme ? "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FDE3AD] drop-shadow-[0_4px_16px_rgba(0,0,0,0.42)]" : "mt-6 text-[11px] font-medium uppercase tracking-[0.34em] text-white/44"}>
                Zonas disponibles
              </p>
              <h1 className={isLightTheme ? "max-w-[11ch] text-[clamp(2.75rem,9vw,6.35rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-[#FDE3AD] drop-shadow-[0_18px_48px_rgba(0,0,0,0.45)]" : "max-w-[12ch] text-[clamp(2.35rem,8.6vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-white"}>
                {design?.zones.title ??
                  "Elige dónde empieza tu próxima recogida."}
              </h1>
              <p className={isLightTheme ? "inline-flex max-w-[34rem] rounded-[1.35rem] border border-[#FDE3AD] bg-[#FDE3AD] px-4 py-2.5 text-base font-semibold leading-7 text-[#741314] shadow-[0_14px_34px_rgba(0,0,0,0.18)] sm:px-5 sm:py-3 sm:text-lg sm:leading-8" : "max-w-[36rem] text-[0.95rem] leading-6 text-white/56 sm:text-base sm:leading-7"}>
                {design?.zones.subtitle ??
                  "Explora zonas activas, entra en cada una y descubre locales preparados para recoger sin complicarte."}
              </p>
            </div>

          </div>

          <div className={isLightTheme ? "rounded-[1.9rem] border border-[#741314]/22 bg-[#FFF7E8]/86 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6" : "mt-6 rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.028))] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:mt-8 sm:p-6"}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={isLightTheme ? "text-[10px] font-semibold uppercase tracking-[0.3em] text-[#741314]" : "text-[10px] font-medium uppercase tracking-[0.3em] text-white/38"}>
                  Ciudades activas
                </p>
                <p className={isLightTheme ? "mt-2 text-sm text-[#24110E]/64" : "mt-2 text-sm text-white/58"}>
                  Una lectura rápida de las ciudades disponibles ahora mismo.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {heroCities.map((city) => (
                <span
                  key={city.id}
                  className={isLightTheme ? "zones-chip rounded-full border border-[#741314]/16 bg-[#FDE3AD]/70 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#741314] backdrop-blur-xl" : "zones-chip rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/72 backdrop-blur-xl"}
                >
                  <MapPinned className={isLightTheme ? "mr-2 inline h-3.5 w-3.5 text-[#741314]" : "mr-2 inline h-3.5 w-3.5 text-[#FDE3AD]"} />
                  {city.name}
                </span>
              ))}
            </div>
          </div>
        </div>

            <div className={isLightTheme ? "relative z-10 mt-8 flex flex-wrap gap-2.5 border-t border-[#FDE3AD]/40 pt-5 sm:mt-9 sm:pt-6" : "relative z-10 mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-5 sm:mt-9 sm:pt-6"}>
              {["Zonas activas", "Locales reales", "Recogida cerca", "Talavera", "M\u00e1s ciudades"].map((label) => (
                <span
                  key={label}
                  className={isLightTheme ? "rounded-full border border-[#FDE3AD]/50 bg-[#741314]/24 px-2.5 py-1.5 text-[10px] font-bold text-[#FDE3AD] shadow-[0_8px_18px_rgba(0,0,0,0.16)] backdrop-blur-md sm:px-3 sm:py-2 sm:text-xs" : "rounded-full border border-white/12 bg-white/[0.055] px-2.5 py-1.5 text-[10px] font-bold text-[#FDE3AD] shadow-[0_8px_18px_rgba(0,0,0,0.14)] backdrop-blur-md sm:px-3 sm:py-2 sm:text-xs"}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`relative border-t px-3 py-6 transition-colors sm:px-6 sm:py-8 lg:px-8 lg:py-10 ${
          isLightTheme
            ? "border-[#741314]/10 bg-[#fcfaf5]"
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
                {design?.zones.sectionTitle ??
                  "Ciudades preparadas para descubrir locales."}
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {cities.map((city, index) => (
              <Link
                key={city.id}
                href={`${cityHrefBase}/${city.slug}`}
                className={`zones-city-card group relative overflow-hidden rounded-[1.4rem] border opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:rounded-[1.8rem] ${
                  isLightTheme
                    ? "border-black/8 bg-[#FFF7E8]"
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
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(116,19,20,0.26),rgba(8,12,19,0.9))]" />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,11,0.04),rgba(6,10,11,0.18)_42%,rgba(6,10,11,0.88)_100%)]" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/72 backdrop-blur-xl">
                      {design?.zones.cardCtaLabel ??
                        getCityDecisionSignal(city, index)}
                    </span>
                    <span className="rounded-full border border-[#FDE3AD]/30 bg-[#FDE3AD]/12 p-2 text-[#FDE3AD] backdrop-blur-xl">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[1.5rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-[2rem]">
                      {city.name} · {getCityDecisionContext(city, index)}
                    </p>
                    <p className="mt-3 max-w-[28ch] text-sm font-medium leading-6 text-[#FDE3AD]">
                      {design?.zones.cardMicrocopy ??
                        "Descubre locales de esta zona."}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {comingSoonZones.map((zone) => (
              <article
                key={zone.id}
                aria-label={`${zone.name}, próximamente`}
                className={`zones-city-card group relative overflow-hidden rounded-[1.4rem] border opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:rounded-[1.8rem] ${
                  isLightTheme
                    ? "border-black/8 bg-[#e8e1d2]"
                    : "border-white/10 bg-[#0b1211]"
                }`}
              >
                <div className="relative min-h-[19rem] sm:min-h-[22rem]">
                  <Image
                    src={zone.imageUrl}
                    alt={zone.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(116,19,20,0.20),transparent_34%),linear-gradient(180deg,rgba(6,10,11,0.06),rgba(6,10,11,0.24)_42%,rgba(6,10,11,0.9)_100%)]" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <span className="rounded-full border border-[#741314]/25 bg-[#741314]/12 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#FDE3AD] backdrop-blur-xl">
                      Próximamente
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] p-2 text-[#FFF7E8] backdrop-blur-xl">
                      <Sparkles className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[1.5rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-[2rem]">
                      {zone.name} · Próximamente
                    </p>
                    <p className="mt-3 max-w-[28ch] text-sm font-medium leading-6 text-[#FDE3AD] drop-shadow-[0_6px_18px_rgba(0,0,0,0.46)]">
                      Preparando una selección visual de locales en {zone.region}.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#FFF7E8]">
                        Zona futura
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#FFF7E8]">
                        Locales cercanos
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ZylenPickFooter theme={isLightTheme ? "light" : "dark"} />
    </main>
  );
}

