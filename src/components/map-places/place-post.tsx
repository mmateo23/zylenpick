"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  ArrowUpRight,
  ChevronDown,
  Clock3,
  ExternalLink,
  Info,
  Headphones,
  MapPin,
  Navigation,
  Send,
  Store,
  X,
} from "lucide-react";

import { NativeDirectionsLink } from "@/components/maps/native-directions-link";
import { ScrollContentHint } from "@/components/ui/scroll-content-hint";
import type { MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { MapPlaceIcon } from "@/features/map-places/icons";
import type { PublicMapPlace } from "@/features/map-places/types";
import type { VenueMapItem } from "@/features/venues/services/venues-map-service";

type PlacePostProps = {
  place: PublicMapPlace;
  category: MapPlaceCategoryDefinition;
  distance: number | null;
  nearbyVenue?: VenueMapItem | null;
  onClose: () => void;
};

function formatWalkingTime(distance: number) {
  return `${Math.max(1, Math.round(distance * 12))} min andando`;
}

function getSafeBackgroundImage(url: string | null) {
  if (!url) return undefined;
  return `url("${url.replace(/["\\]/g, "")}")`;
}

function PlaceGlyph({ place, className = "h-6 w-6" }: { place: PublicMapPlace; className?: string }) {
  return <MapPlaceIcon name={place.iconName} className={className} aria-hidden="true" />;
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

export function PlacePost({ place, category, distance, nearbyVenue, onClose }: PlacePostProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const exploreHref = place.explore
    ? `/explora/${place.explore.routeSlug}/${place.explore.pointSlug}?unlock=${place.explore.publicToken}`
    : null;

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#18090A]/85 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Cerrar lugar" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[29rem] md:max-w-[58rem]">
        <article
          role="dialog"
          aria-modal="true"
          aria-labelledby={`place-post-title-${place.id}`}
          className="pickyalo-media-card relative h-[min(94svh,52rem)] w-full overflow-hidden rounded-[1.65rem] text-[#FFF7E8] shadow-[0_32px_110px_rgba(18,3,7,0.62)]"
        >
        <button
          type="button"
          onClick={() => setIsImageFullscreen(true)}
          className="absolute inset-0 w-full overflow-hidden bg-[#741314]"
          aria-label="Ver imagen del lugar en grande"
        >
          <PlaceVisual place={place} />
        </button>
        <div className="pickyalo-media-gradient" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_48%,rgba(18,6,7,0.68)_100%)] max-md:hidden" />

        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-[#16090A]/46 text-[#FDE3AD] backdrop-blur-xl">
              <PlaceGlyph place={place} className="h-5 w-5" />
            </span>
            <span className="min-w-0 rounded-full border border-white/20 bg-[#16090A]/46 px-3 py-2 backdrop-blur-xl">
              <span className="block truncate text-sm font-semibold leading-5 text-[#FFF7E8]">{place.name}</span>
              <span className="block truncate text-xs leading-4 text-[#FFF7E8]/66">
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
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#16090A]/46 text-[#FFF7E8] backdrop-blur-xl transition hover:bg-[#16090A]/70"
                aria-label="Ver fuente oficial"
              >
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
              </a>
            ) : null}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="pickyalo-light-control inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#16090A]/46 text-[#FFF7E8] backdrop-blur-xl transition hover:bg-[#16090A]/70"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        <section
          ref={articleRef}
          onScroll={handleArticleScroll}
          className="absolute inset-x-0 bottom-0 z-20 max-h-[68%] overflow-y-auto overscroll-contain border-t border-white/14 bg-[#18090A]/56 px-4 pb-14 pt-4 backdrop-blur-xl [scrollbar-width:thin] sm:pb-4 md:inset-y-0 md:left-auto md:flex md:h-full md:w-[47%] md:max-h-none md:flex-col md:justify-end md:border-l md:border-t-0 md:bg-[#18090A]/66 md:px-6 md:pb-6 md:pt-24"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowDetails((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/8 text-[#FFF7E8] transition hover:bg-white/14"
                aria-label={showDetails ? "Ocultar información" : "Ver información"}
                aria-expanded={showDetails}
                aria-controls={`place-post-details-${place.id}`}
              >
                <Info className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/8 text-[#FFF7E8] transition hover:bg-white/14"
                aria-label="Compartir lugar"
              >
                <Send className="h-6 w-6" aria-hidden="true" />
              </button>
              {nearbyVenue ? (
                <Link
                  href={`/zonas/${nearbyVenue.city.slug}/venues/${nearbyVenue.slug}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/8 text-[#FFF7E8] transition hover:bg-white/14"
                  aria-label={`Ver qué recoger cerca en ${nearbyVenue.name}`}
                >
                  <Store className="h-6 w-6" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <NativeDirectionsLink
              destination={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              destinationLabel={place.name}
              className="pickyalo-media-cta h-11 px-4"
              aria-label={`Cómo llegar a ${place.name}`}
            >
              <Navigation className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs">Cómo llegar</span>
            </NativeDirectionsLink>
          </div>

          {feedback ? (
            <p className="mt-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-xs font-medium leading-4 text-[#FFF7E8]" role="status">
              {feedback}
            </p>
          ) : null}

          <div className="mt-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 id={`place-post-title-${place.id}`} className="text-[clamp(1.75rem,7vw,2.8rem)] font-semibold leading-[.95] tracking-[-.045em] text-[#FFF7E8]">
                {place.name}
              </h2>
              <span className="pickyalo-media-chip shrink-0 uppercase tracking-[0.1em]">
                {category.shortLabel}
              </span>
            </div>
            {place.description ? <p className="line-clamp-2 text-sm leading-5 text-[#FFF7E8]/74">{place.description}</p> : null}

            {exploreHref ? (
              <Link
                href={exploreHref}
                className="flex min-h-12 items-center justify-between gap-3 rounded-[0.9rem] border border-white/16 bg-white/9 px-3.5 text-sm font-bold text-[#FFF7E8] transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED47D]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Headphones className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Abrir historia</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            ) : null}

            <div className="flex flex-wrap gap-1.5">
              {place.openingHoursNote ? (
                <span className="pickyalo-media-chip">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {place.openingHoursNote}
                </span>
              ) : null}
              {distance !== null ? (
                <span className="pickyalo-media-chip">
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
            className="mt-3 flex w-full items-center justify-between gap-3 border-y border-white/12 py-2.5 text-left text-sm font-semibold text-[#FFF7E8]"
          >
            <span>{showDetails ? "Ocultar historia y datos" : "Historia y datos"}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#FDE3AD] transition-transform ${showDetails ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {showDetails ? (
            <div
              id={`place-post-details-${place.id}`}
              className="mt-2 space-y-3 rounded-[0.9rem] border border-white/12 bg-[#18090A]/38 p-3 text-[#FFF7E8]"
            >
              {place.story ? (
                <section>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDE3AD]">Sobre este lugar</h3>
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-[#FFF7E8]/72">{place.story}</p>
                </section>
              ) : null}
              {place.amenities.length > 0 ? (
                <section className="border-t border-white/10 pt-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDE3AD]">Qué encontrarás</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {place.amenities.map((amenity) => (
                      <span key={amenity} className="rounded-full border border-white/14 bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-[#FFF7E8]/72">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}
              {place.accessibilityNote || place.isAccessible ? (
                <section className="border-t border-white/10 pt-3">
                  <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDE3AD]">
                    <Accessibility className="h-3.5 w-3.5" aria-hidden="true" /> Accesibilidad
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#FFF7E8]/72">
                    {place.accessibilityNote ?? "Punto indicado como accesible."}
                  </p>
                </section>
              ) : null}
              {place.sourceUrl ? (
                <a href={place.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs font-bold text-[#FDE3AD] underline underline-offset-4">
                  {place.sourceLabel ?? "Fuente oficial"} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ) : null}

          {nearbyVenue ? (
            <Link
              href={`/zonas/${nearbyVenue.city.slug}/venues/${nearbyVenue.slug}`}
              className="mt-3 flex items-center justify-between gap-3 rounded-[0.9rem] border border-white/14 bg-white/8 px-3 py-2.5 text-sm font-semibold text-[#FFF7E8]"
            >
              <span className="min-w-0 truncate">Qué recoger cerca · {nearbyVenue.name}</span>
              <Store className="h-4 w-4 shrink-0 text-[#FDE3AD]" aria-hidden="true" />
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
            className="pickyalo-light-control absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition hover:bg-white/18"
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
