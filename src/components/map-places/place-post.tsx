"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  ChevronDown,
  Clock3,
  ExternalLink,
  Info,
  MapPin,
  Navigation,
  Send,
  Store,
  X,
} from "lucide-react";

import { ScrollContentHint } from "@/components/ui/scroll-content-hint";
import { getMapPlaceCategory } from "@/features/map-places/categories";
import type { PublicMapPlace } from "@/features/map-places/types";
import type { VenueMapItem } from "@/features/venues/services/venues-map-service";

type PlacePostProps = {
  place: PublicMapPlace;
  distance: number | null;
  nearbyVenue?: VenueMapItem | null;
  onClose: () => void;
};

function getDirectionsHref(place: PublicMapPlace) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
}

function formatWalkingTime(distance: number) {
  return `${Math.max(1, Math.round(distance * 12))} min andando`;
}

function getSafeBackgroundImage(url: string | null) {
  if (!url) return undefined;
  return `url("${url.replace(/["\\]/g, "")}")`;
}

function PlaceGlyph({ place, className = "h-6 w-6" }: { place: PublicMapPlace; className?: string }) {
  const category = getMapPlaceCategory(place.category);

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      dangerouslySetInnerHTML={{ __html: category.markerPath }}
    />
  );
}

function PlaceVisual({ place }: { place: PublicMapPlace }) {
  if (place.coverImageUrl) {
    return (
      <span
        role="img"
        aria-label={`Vista de ${place.name}`}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: getSafeBackgroundImage(place.coverImageUrl) }}
      />
    );
  }

  return (
    <span className="absolute inset-0 grid place-items-center bg-[#741314] text-[#FDE3AD]">
      <PlaceGlyph place={place} className="h-24 w-24 opacity-85" />
    </span>
  );
}

export function PlacePost({ place, distance, nearbyVenue, onClose }: PlacePostProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const category = getMapPlaceCategory(place.category);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isImageFullscreen) {
        setIsImageFullscreen(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageFullscreen, onClose]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const updateScrollHint = () => {
      const remainingScroll = article.scrollHeight - article.scrollTop - article.clientHeight;
      setCanScrollMore(remainingScroll > 16);
    };

    const frame = window.requestAnimationFrame(updateScrollHint);
    const resizeObserver = new ResizeObserver(updateScrollHint);
    resizeObserver.observe(article);
    window.addEventListener("resize", updateScrollHint);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollHint);
    };
  }, [feedback, place.id, showDetails]);

  function handleArticleScroll() {
    const article = articleRef.current;
    if (!article) return;
    const remainingScroll = article.scrollHeight - article.scrollTop - article.clientHeight;
    setCanScrollMore(remainingScroll > 16);
  }

  function scrollArticleForward() {
    const article = articleRef.current;
    if (!article) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    article.scrollBy({
      top: Math.min(article.clientHeight * 0.56, 300),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  async function handleShare() {
    const shareData = {
      title: `${place.name} | Pickyalo`,
      text: place.description ?? `Descubre ${place.name} en Pickyalo.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setFeedback("Lugar compartido.");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setFeedback("Enlace copiado.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setFeedback("No se ha podido compartir.");
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Cerrar lugar" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[29rem] md:max-w-[31rem]">
        <article
          ref={articleRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`place-post-title-${place.id}`}
          onScroll={handleArticleScroll}
          className="relative max-h-[94svh] w-full overflow-y-auto overscroll-contain rounded-[1.65rem] bg-white text-[#111111] shadow-[0_28px_90px_rgba(0,0,0,0.34)] [scrollbar-width:thin]"
        >
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/8 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#741314] text-[#FDE3AD]">
              <PlaceGlyph place={place} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-5 text-[#111111]">{place.name}</span>
              <span className="block truncate text-xs leading-4 text-[#6f6f6f]">
                {distance !== null ? formatWalkingTime(distance) : place.city.name}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {place.sourceUrl ? (
              <a
                href={place.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
                aria-label="Ver fuente oficial"
              >
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
              </a>
            ) : null}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06]"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        <button
          type="button"
          onClick={() => setIsImageFullscreen(true)}
          className="relative h-[clamp(15rem,42svh,23rem)] w-full shrink-0 overflow-hidden bg-[#741314] sm:aspect-[4/5] sm:h-auto"
          aria-label="Ver imagen del lugar en grande"
        >
          <PlaceVisual place={place} />
        </button>

        <section className="bg-white px-4 pb-14 pt-3 sm:pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowDetails((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                aria-label={showDetails ? "Ocultar información" : "Ver información"}
                aria-expanded={showDetails}
                aria-controls={`place-post-details-${place.id}`}
              >
                <Info className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                aria-label="Compartir lugar"
              >
                <Send className="h-6 w-6" aria-hidden="true" />
              </button>
              {nearbyVenue ? (
                <Link
                  href={`/zonas/${nearbyVenue.city.slug}/venues/${nearbyVenue.slug}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#252525] transition hover:bg-black/[0.06]"
                  aria-label={`Ver qué recoger cerca en ${nearbyVenue.name}`}
                >
                  <Store className="h-6 w-6" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <a
              href={getDirectionsHref(place)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#741314] text-[#FDE3AD] shadow-[0_14px_30px_rgba(116,19,20,0.3)] transition hover:bg-[#5f1012]"
              aria-label={`Cómo llegar a ${place.name}`}
            >
              <Navigation className="h-6 w-6" aria-hidden="true" />
            </a>
          </div>

          {feedback ? (
            <p className="mt-2 rounded-full bg-black/[0.05] px-3 py-2 text-xs font-medium leading-4 text-[#303030]" role="status">
              {feedback}
            </p>
          ) : null}

          <div className="mt-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 id={`place-post-title-${place.id}`} className="text-xl font-semibold leading-6 text-[#111111]">
                {place.name}
              </h2>
              <span className="shrink-0 rounded-full bg-[#FFE9EC] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#741314]">
                {category.shortLabel}
              </span>
            </div>
            {place.description ? <p className="line-clamp-2 text-sm leading-5 text-[#5f5f5f]">{place.description}</p> : null}

            <div className="flex flex-wrap gap-1.5">
              {place.openingHoursNote ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f1f1] px-3 py-1.5 text-xs font-medium text-[#4a4a4a]">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {place.openingHoursNote}
                </span>
              ) : null}
              {distance !== null ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f1f1] px-3 py-1.5 text-xs font-medium text-[#4a4a4a]">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {formatWalkingTime(distance)}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            aria-expanded={showDetails}
            aria-controls={`place-post-details-${place.id}`}
            className="mt-3 flex w-full items-center justify-between gap-3 border-y border-black/8 py-2.5 text-left text-sm font-semibold text-[#381932]"
          >
            <span>{showDetails ? "Ocultar historia y datos" : "Historia y datos"}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#741314] transition-transform ${showDetails ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {showDetails ? (
            <div
              id={`place-post-details-${place.id}`}
              className="mt-2 space-y-3 rounded-[0.9rem] border border-[#C26157]/16 bg-[#FFE9EC]/55 p-3 text-[#381932]"
            >
              {place.story ? (
                <section>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#741314]">Sobre este lugar</h3>
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-[#381932]/72">{place.story}</p>
                </section>
              ) : null}
              {place.amenities.length > 0 ? (
                <section className="border-t border-[#741314]/10 pt-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#741314]">Qué encontrarás</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {place.amenities.map((amenity) => (
                      <span key={amenity} className="rounded-full border border-[#741314]/12 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-[#381932]/72">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}
              {place.accessibilityNote || place.isAccessible ? (
                <section className="border-t border-[#741314]/10 pt-3">
                  <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#741314]">
                    <Accessibility className="h-3.5 w-3.5" aria-hidden="true" /> Accesibilidad
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#381932]/72">
                    {place.accessibilityNote ?? "Punto indicado como accesible."}
                  </p>
                </section>
              ) : null}
              {place.sourceUrl ? (
                <a href={place.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border-t border-[#741314]/10 pt-3 text-xs font-bold text-[#741314] underline underline-offset-4">
                  {place.sourceLabel ?? "Fuente oficial"} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ) : null}

          {nearbyVenue ? (
            <Link
              href={`/zonas/${nearbyVenue.city.slug}/venues/${nearbyVenue.slug}`}
              className="mt-3 flex items-center justify-between gap-3 rounded-[0.9rem] border border-black/8 bg-[#FFF9F1] px-3 py-2.5 text-sm font-semibold text-[#381932]"
            >
              <span className="min-w-0 truncate">Qué recoger cerca · {nearbyVenue.name}</span>
              <Store className="h-4 w-4 shrink-0 text-[#741314]" aria-hidden="true" />
            </Link>
          ) : null}
        </section>
        </article>

        <ScrollContentHint
          visible={canScrollMore}
          onActivate={scrollArticleForward}
          label="Desliza para seguir leyendo"
        />
      </div>

      {isImageFullscreen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black p-4">
          <button
            type="button"
            onClick={() => setIsImageFullscreen(false)}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition hover:bg-white/18"
            aria-label="Cerrar imagen"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="relative h-full w-full max-w-5xl overflow-hidden bg-black">
            <PlaceVisual place={place} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
