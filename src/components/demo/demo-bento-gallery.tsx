"use client";

import { useMemo, useRef } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DemoSiteHeader } from "@/components/demo/demo-site-header";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import type { HomeShowcaseItem } from "@/features/venues/types";

gsap.registerPlugin(useGSAP);

type DemoBentoGalleryProps = {
  items: HomeShowcaseItem[];
  mode?: "locales" | "zonas";
  variant?: "demo" | "public";
  zoneName?: string | null;
  zoneHeroImageUrl?: string | null;
  zoneHeroVideoUrl?: string | null;
};

type BentoVenueItem = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  categoryName: string | null;
  subscriptionActive: boolean;
  subscriptionTier: "basic" | "oro" | "titanio";
  cityName: string;
  citySlug: string;
};

const bentoVideoSrc =
  "https://cdn.pixabay.com/video/2022/06/03/119186-717336692_large.mp4";

function pickBentoItems(items: HomeShowcaseItem[]) {
  const seen = new Set<string>();
  const venues: BentoVenueItem[] = [];

  for (const item of items) {
    if (seen.has(item.venue.slug) || !item.imageUrl) {
      continue;
    }

    seen.add(item.venue.slug);
    venues.push({
      id: item.venue.slug,
      slug: item.venue.slug,
      name: item.venue.name,
      imageUrl: item.venue.coverUrl ?? item.imageUrl,
      description: item.description,
      categoryName: item.categoryName,
      subscriptionActive: item.venue.subscriptionActive,
      subscriptionTier: item.venue.subscriptionTier,
      cityName: item.venue.cityName,
      citySlug: item.venue.citySlug,
    });
  }

  return venues.slice(0, 8);
}

function getVenueCardClassName(item: BentoVenueItem, index: number) {
  const baseClass =
    "bento-photo-card group relative overflow-hidden rounded-[1rem] border border-white/10 bg-[#0b1211] opacity-0 sm:rounded-[1.35rem]";

  if (item.subscriptionTier === "titanio") {
    return `${baseClass} col-span-2 min-h-[15.5rem] sm:col-span-2 lg:col-span-2 lg:min-h-[19rem]`;
  }

  if (item.subscriptionTier === "oro") {
    return `${baseClass} min-h-[13rem] lg:min-h-[16rem] ${
      index % 3 === 1 ? "lg:row-span-2" : ""
    }`;
  }

  return `${baseClass} min-h-[11rem] lg:min-h-[13rem]`;
}

export function DemoBentoGallery({
  items,
  mode = "locales",
  variant = "demo",
  zoneName = null,
  zoneHeroImageUrl = null,
  zoneHeroVideoUrl = null,
}: DemoBentoGalleryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const isLightTheme = false;
  const selectedItems = useMemo(() => pickBentoItems(items), [items]);
  const galleryItems = useMemo(() => pickBentoItems(items), [items]);
  const venueLabels = useMemo(() => {
    const seen = new Set<string>();

    return selectedItems
      .filter((item) => {
        if (seen.has(item.id)) {
          return false;
        }

        seen.add(item.id);
        return true;
      })
      .slice(0, 6);
  }, [selectedItems]);
  const activeVenueCount = selectedItems.length;
  const featuredVenueCount = selectedItems.filter(
    (item) => item.subscriptionActive,
  ).length;
  const premiumVenueCount = selectedItems.filter(
    (item) => item.subscriptionTier !== "basic",
  ).length;
  const isZoneMode = mode === "zonas";
  const primaryCitySlug = items[0]?.venue.citySlug ?? null;
  const heroEyebrow = isZoneMode ? "Locales para recoger" : "Demo de locales";
  const heroTitle = isZoneMode
    ? `Elige un local en ${zoneName ?? "tu zona"}`
    : "\u00bfQu\u00e9 local nos apetece hoy?";
  const zoneDisplayName = zoneName ?? "tu zona";
  const heroDescription =
    "Una composici\u00f3n visual para descubrir locales con una direcci\u00f3n m\u00e1s editorial, inmersiva y pensada para explorar mejor.";
  const labelsTitle = isZoneMode ? "Locales para elegir" : "Locales destacados";

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
          ".zone-hero-sheen",
          { autoAlpha: 0, scale: 0.94, xPercent: -8 },
          {
            autoAlpha: 0.9,
            scale: 1,
            xPercent: 0,
            duration: 0.9,
          },
        )
        .fromTo(
          ".zone-topbar-item",
          { autoAlpha: 0, y: -18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
          },
          "-=0.55",
        )
        .fromTo(
          ".zone-hero-copy > *",
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            stagger: 0.08,
          },
          "-=0.28",
        )
        .fromTo(
          ".zone-labels-shell",
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
          },
          "-=0.2",
        )
        .fromTo(
          ".zone-label-chip",
          { autoAlpha: 0, y: 16, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            stagger: 0.045,
          },
          "-=0.24",
        )
        .fromTo(
          ".bento-photo-card",
          { autoAlpha: 0, y: 28, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.58,
            stagger: 0.055,
          },
          "-=0.12",
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
          currentCityName={isZoneMode ? zoneName : null}
          currentCitySlug={isZoneMode ? primaryCitySlug : null}
          isLightTheme={isLightTheme}
        />
      )}
      <section className="relative overflow-hidden border-b border-white/6">
        <div className="absolute inset-0 overflow-hidden">
          {isZoneMode && zoneHeroVideoUrl ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
            >
              <source src={zoneHeroVideoUrl} type="video/mp4" />
            </video>
          ) : isZoneMode && zoneHeroImageUrl ? (
            <Image
              src={zoneHeroImageUrl}
              alt={zoneName ?? "Zona"}
              fill
              priority
              sizes="100vw"
              className="scale-[1.04] object-cover"
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
            >
              <source src={bentoVideoSrc} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,223,129,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,rgba(6,18,13,0.62)_0%,rgba(5,8,22,0.82)_100%)]" />
          <div className="zone-hero-sheen absolute inset-y-0 left-[-12%] w-[42%] bg-[radial-gradient(circle_at_center,rgba(124,255,184,0.12),transparent_62%)] blur-3xl" />
        </div>
        <div className="relative mx-auto flex min-h-[calc(100svh-6.5rem)] w-full max-w-7xl flex-col justify-center px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:px-12">
          <div className="mt-6 flex flex-1 flex-col justify-center sm:mt-10">
            <div className="zone-hero-copy max-w-[40rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/60 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-[#7cffb8]" />
                Explorador visual
              </div>
              <div className="space-y-4">
                <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.34em] text-white/44">
                  {heroEyebrow}
                </p>
                <h1 className="max-w-[11ch] text-[clamp(2.35rem,8.6vw,5.4rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-white">
                  {heroTitle}
                </h1>
                <p className="max-w-[34rem] text-[0.95rem] leading-6 text-white/56 sm:max-w-[36rem] sm:text-base sm:leading-7">
                  {isZoneMode ? (
                    <>
                      Mira locales de{" "}
                      <strong className="font-semibold text-white">
                        {zoneDisplayName}
                      </strong>
                      , abre su carta y elige qu\u00e9 recoger sin complicarte.
                    </>
                  ) : (
                    heroDescription
                  )}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7">
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/72 backdrop-blur-xl">
                  {activeVenueCount} locales activos
                </span>
                <span className="rounded-full border border-[#7cffb8]/14 bg-[#7cffb8]/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7cffb8] backdrop-blur-xl">
                  {featuredVenueCount} verificados
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/72 backdrop-blur-xl">
                  {premiumVenueCount} carta clara
                </span>
              </div>
            </div>

            <div className="zone-labels-shell mt-6 rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.028))] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:mt-8 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/38">
                    {labelsTitle}
                  </p>
                  <p className="mt-2 text-sm text-white/58">
                    Toca un local para ver su carta y elegir qué recoger.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/14 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/54 backdrop-blur-xl">
                  Actualizado
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {venueLabels.map((item) => (
                  <span
                    key={item.id}
                    className={`zone-label-chip rounded-full border px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] backdrop-blur-xl ${
                      item.subscriptionActive
                        ? "border-[#7cffb8]/18 bg-[#7cffb8]/10 text-[#d9ffe8]"
                        : "border-white/10 bg-white/[0.05] text-white/72"
                    }`}
                  >
                    {item.subscriptionActive ? "\u2b50 " : ""}
                    {item.name}
                  </span>
                ))}
              </div>
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
                Selecci\u00f3n visual
              </p>
              <h2
                className={`mt-3 max-w-[13ch] text-[clamp(1.9rem,3.4vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.065em] ${
                  isLightTheme ? "text-[#181816]" : "text-white"
                }`}
              >
                Elige un local y entra en su carta.
              </h2>
            </div>
            <Link
              href="/zonas"
              className={`hidden rounded-full border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] backdrop-blur-xl transition sm:inline-flex ${
                isLightTheme
                  ? "border-black/8 bg-black/[0.04] text-[#181816]/68 hover:bg-black/[0.06]"
                  : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
              }`}
            >
              Ver ciudades
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 lg:grid-cols-3 lg:auto-rows-[13rem] lg:grid-flow-dense lg:gap-4 xl:auto-rows-[14rem]">
            {galleryItems.map((item, index) => (
              <Link
                key={item.id}
                href={`/zonas/${item.citySlug}/venues/${item.slug}`}
                className={`${getVenueCardClassName(item, index)} ${
                  isLightTheme
                    ? "border-black/8 bg-[#e8e1d2]"
                    : "border-white/10 bg-[#0b1211]"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7cffb8]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]`}
                aria-label={`Ver local ${item.name}`}
              >
                <Image
                  src={item.imageUrl ?? ""}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,11,0.02),rgba(6,10,11,0.12)_42%,rgba(6,10,11,0.88)_100%)]" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
                  {item.subscriptionActive ? (
                    <span
                      className="rounded-full border border-white/10 bg-black/18 p-2 text-white/72 backdrop-blur-xl"
                      aria-label="Local verificado"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#7cffb8]" />
                    </span>
                  ) : null}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="line-clamp-2 text-[1.02rem] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[1.14rem]">
                    {item.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[0.9rem] font-bold italic text-[#7cffb8] sm:text-[0.96rem]">
                      Ver carta
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/58 backdrop-blur-xl">
                      {item.categoryName ?? "Local"}
                    </span>
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
