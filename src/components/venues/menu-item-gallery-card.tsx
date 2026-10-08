"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowUpRight, Clock3, Info, MapPin, Store, Utensils } from "lucide-react";

import { CloseIcon } from "@/components/icons/close-icon";
import { FeaturedBadgeIcon } from "@/components/icons/featured-badge-icon";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ProductPriceBadge } from "@/components/pricing/product-price-badge";
import {
  ScrollContentHint,
  useScrollContentHint,
} from "@/components/ui/scroll-content-hint";
import {
  AllergenPictogram,
  allergenLabels,
} from "@/components/venues/allergen-pictogram";
import Link from "next/link";
import type { CartVenue } from "@/features/cart/types";
import { isDefinitivePrice } from "@/features/pricing/price-display";
import {
  getMenuItemDisplayImage,
  getMenuItemSecondaryImage,
} from "@/features/venues/menu-item-media";
import type { VenueMenuItem } from "@/features/venues/types";
import { capturePlatoVisto } from "@/lib/analytics/posthog-events";
import { trackEvent } from "@/lib/analytics/track-event";

import profileStyles from "./venue-profile.module.css";

type MenuItemGalleryCardProps = {
  item: VenueMenuItem;
  venue: CartVenue;
  anchorId?: string;
  variant?: "default" | "venueCompact";
  labels?: {
    viewDetail: string;
    addForPickup: string;
  };
};

export function MenuItemGalleryCard({
  item,
  venue,
  anchorId,
  variant = "default",
  labels,
}: MenuItemGalleryCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasCapturedViewRef = useRef(false);
  const openerButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isVenueCompact = variant === "venueCompact";
  const {
    scrollRef: viewerContentRef,
    canScrollMore: canScrollViewer,
    scrollForward: scrollViewerForward,
  } = useScrollContentHint<HTMLDivElement>(isViewerOpen ? item.id : null);

  const images = useMemo(() => {
    const configuredGallery = item.galleryImageUrls ?? [];
    const gallery = [
      getMenuItemDisplayImage(item.name, item.imageUrl),
      ...configuredGallery,
      configuredGallery.length === 0
        ? item.secondaryImageUrl ?? getMenuItemSecondaryImage(item.name)
        : null,
    ].filter(Boolean) as string[];

    return Array.from(new Set(gallery));
  }, [item.galleryImageUrls, item.imageUrl, item.name, item.secondaryImageUrl]);

  const primaryImage = images[0] ?? null;
  const selectedImage = images[selectedImageIndex] ?? primaryImage;
  const trackedItemPrice = isDefinitivePrice({
    priceAmount: item.priceAmount,
    currency: item.currency,
    priceDisplayMode: item.priceDisplayMode,
    priceDisplayText: item.priceDisplayText,
    pricesVisible: venue.pricesVisible,
  })
    ? item.priceAmount / 100
    : undefined;

  useEffect(() => {
    if (!isViewerOpen) return;

    const previousOverflow = document.body.style.overflow;
    const openerElement = openerButtonRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsViewerOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      openerElement?.focus();
    };
  }, [isViewerOpen]);

  const handleOpenViewer = () => {
    setSelectedImageIndex(0);
    setIsViewerOpen(true);

    if (!hasCapturedViewRef.current) {
      capturePlatoVisto({
        city_slug: venue.citySlug,
        venue_id: venue.id,
        venue_slug: venue.slug,
        venue_name: venue.name,
        item_id: item.id,
        item_name: item.name,
        item_price: trackedItemPrice,
        item_category: item.categoryName,
        currency: item.currency,
        source: "venue",
      });
      hasCapturedViewRef.current = true;
    }

    trackEvent("view_dish", {
      city_slug: venue.citySlug,
      city_name: venue.cityName,
      venue_id: venue.id,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: item.id,
      item_name: item.name,
      item_price: trackedItemPrice,
      currency: item.currency,
      source: "dish_card",
    });
  };

  const highlightClassName = item.isPickupMonthHighlight
    ? "border-accent-border group-hover:border-accent"
    : item.isFeatured
      ? "gold-spotlight-card border-warning/30 group-hover:border-warning/50"
      : "border-border-subtle group-hover:border-border-strong";

  return (
    <>
      {isVenueCompact ? <article id={anchorId} className={`pickyalo-media-card ${profileStyles.menuCard} scroll-mt-28`}>
        <button ref={openerButtonRef} type="button" onClick={handleOpenViewer} className={profileStyles.menuOpener} aria-label={`Ver ${item.name}`}>
          <div className={profileStyles.menuPhoto}>
            <div role="img" aria-label={item.name} className={profileStyles.menuPhotoImage} style={{ backgroundImage: primaryImage ? `url(${primaryImage})` : undefined }} />
            {!primaryImage ? <div className="absolute inset-0 grid place-items-center text-[#741314]"><Utensils size={32} aria-hidden="true" /></div> : null}
            {item.isFeatured || item.isPickupMonthHighlight ? <span className={profileStyles.featured}><FeaturedBadgeIcon size={13} />{item.isFeatured ? "Destacado" : "Selección del mes"}</span> : null}
          </div>
          <div className={profileStyles.menuCopy}>
            <h3>{item.name}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <div className={profileStyles.menuPrice}><ProductPriceBadge
              priceAmount={item.priceAmount} currency={item.currency} priceDisplayMode={item.priceDisplayMode}
              priceDisplayText={item.priceDisplayText} pricesVisible={venue.pricesVisible} compact
            /></div>
            <span className={profileStyles.detailsHint}>Detalles y alérgenos <ArrowUpRight size={15} aria-hidden="true" /></span>
          </div>
        </button>

      </article> : (
      <article
        id={anchorId}
        className={`pickyalo-media-card group relative h-full scroll-mt-28 overflow-hidden rounded-[0.9rem] border bg-surface-strong text-left shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[var(--shadow-soft)] sm:rounded-[1.05rem] ${highlightClassName}`}
      >
        {item.isFeatured ? (
          <BorderBeam
            size={260}
            duration={7}
            borderWidth={2}
            className="from-transparent via-warning to-transparent opacity-55"
          />
        ) : null}

        <button
          ref={openerButtonRef}
          type="button"
          onClick={handleOpenViewer}
          className={`gold-spotlight-content relative block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#741314] ${
            isVenueCompact
              ? "min-h-[17rem]"
              : "min-h-[18rem] sm:min-h-[20rem]"
          }`}
          aria-label={`Ver ${item.name}`}
        >
          <div
            role="img"
            aria-label={`${item.name} en ${venue.cityName}`}
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
            style={{
              backgroundImage: primaryImage
                ? `url(${primaryImage})`
                : "linear-gradient(180deg, var(--brand-accent-soft), var(--overlay-hero-from))",
            }}
          />
          <div className="pickyalo-media-overlay absolute inset-0" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
            <div className="min-w-0 space-y-2">
              {!isVenueCompact ? (
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/30 bg-[#24110E] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  <Store aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{venue.name}</span>
                </span>
              ) : null}
              <div className="flex flex-wrap gap-1.5">
                {item.categoryName ? (
                  <span className="rounded-full border border-white/25 bg-[#24110E] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-xl">
                    {item.categoryName}
                  </span>
                ) : null}
                {!isVenueCompact ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-[#24110E] px-2.5 py-1 text-[9px] font-semibold text-white/90 backdrop-blur-xl">
                    <MapPin aria-hidden="true" className="h-3 w-3" />
                    {venue.cityName}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {item.isFeatured ? (
                <span
                  title="Destacado"
                  aria-label="Destacado"
                  className="featured-badge-animated inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FDE3AD]/70 bg-[#741314] text-[#FDE3AD] backdrop-blur-xl"
                >
                  <FeaturedBadgeIcon size={22} />
                </span>
              ) : null}
              {item.isPickupMonthHighlight ? (
                <span className="inline-flex rounded-full border border-white/25 bg-[#24110E] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  Muy elegido
                </span>
              ) : null}
            </div>
          </div>

          <div className={`absolute inset-x-0 bottom-0 ${isVenueCompact ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
            <h3 className={`line-clamp-2 font-semibold leading-[0.98] tracking-[-0.04em] text-white ${
              isVenueCompact ? "text-[1.12rem] sm:text-[1.45rem]" : "text-[1.45rem] sm:text-[1.7rem]"
            }`}>
              {item.name}
            </h3>
            {item.description ? (
              <p className={`${
                isVenueCompact
                  ? "mt-2 line-clamp-2 text-xs leading-4 sm:line-clamp-1 sm:text-sm sm:leading-6"
                  : "mt-2 line-clamp-1 text-sm leading-6"
              } text-white/85 drop-shadow-[0_3px_10px_rgba(0,0,0,0.72)]`}>
                {item.description}
              </p>
            ) : null}
            <div className={`${isVenueCompact ? "mt-3 gap-1.5" : "mt-4 gap-2"} flex flex-wrap items-center`}>
              <ProductPriceBadge
                priceAmount={item.priceAmount}
                currency={item.currency}
                priceDisplayMode={item.priceDisplayMode}
                priceDisplayText={item.priceDisplayText}
                pricesVisible={venue.pricesVisible}
                compact
              />
              {!isVenueCompact ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#24110E] px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-xl">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "Recogida"}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#24110E] px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-xl">
                <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
                {item.allergens.length > 0
                  ? `${item.allergens.length} ${item.allergens.length === 1 ? "alérgeno" : "alérgenos"}`
                  : "Revisar alérgenos"}
              </span>
              <span className={`${isVenueCompact ? "px-2.5 py-1 text-[10px]" : "ml-auto px-3.5 py-1.5 text-xs"} rounded-full border border-white/25 bg-[#24110E] font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl`}>
                {labels?.viewDetail ?? "Ver detalle"}
              </span>
            </div>
          </div>
        </button>

        <div className={`gold-spotlight-content border-t border-[#FFF7E8]/14 bg-[#24110E] ${isVenueCompact ? "px-3 py-2.5" : "px-4 py-3 sm:px-5"}`}>
          <div className={`${isVenueCompact ? "mb-2" : "mb-3"} flex items-start gap-2 text-xs leading-5 text-[#FFF7E8]/68`}>
            <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FDE3AD]" />
            {item.allergens.length > 0 ? (
              <div className="min-w-0">
                {!isVenueCompact ? <p className="font-semibold text-[#FFF7E8]">Alérgenos y posibles trazas:</p> : null}
                <div className={`${isVenueCompact ? "mt-0" : "mt-2"} flex flex-wrap gap-1.5`}>
                  {item.allergens.map((allergen) => (
                    <AllergenPictogram key={allergen} allergen={allergen} compact />
                  ))}
                </div>
              </div>
            ) : (
              <p>
                <span className="font-semibold text-[#FFF7E8]">Información de alérgenos pendiente.</span>
                {!isVenueCompact ? " Confírmala con el local antes de pedir." : null}
              </p>
            )}
          </div>

        </div>
      </article>)}

      {isViewerOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-[#18090A]/85 p-2 backdrop-blur-xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`product-dialog-title-${item.id}`}
          aria-describedby={item.description ? `product-dialog-description-${item.id}` : undefined}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsViewerOpen(false);
          }}
        >
          <div className="flex h-full min-h-0 items-center justify-center">
            <section ref={dialogRef} className="pickyalo-media-card relative h-[calc(100svh-1rem)] w-full max-w-6xl overflow-hidden rounded-[1.25rem] text-[#FFF7E8] shadow-[0_32px_110px_rgba(18,3,7,0.62)] sm:h-[calc(100svh-3rem)] sm:rounded-[1.6rem] lg:h-[min(44rem,calc(100svh-3rem))]">
              <div className="absolute inset-0 min-h-0 overflow-hidden">
                <div
                  role="img"
                  aria-label={`${item.name} en ${venue.cityName}`}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: selectedImage
                      ? `url(${selectedImage})`
                      : "linear-gradient(180deg, var(--brand-accent-soft), var(--overlay-hero-from))",
                  }}
                />
                <div className="pickyalo-media-gradient" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_48%,rgba(18,6,7,0.7)_100%)] max-lg:hidden" />
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className="pickyalo-light-control magnetic-button absolute right-3 top-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#16090A]/45 text-[#FFF7E8] shadow-[0_8px_24px_rgba(0,0,0,0.24)] outline-none backdrop-blur-xl transition hover:bg-[#16090A]/70 focus-visible:ring-2 focus-visible:ring-[#FED47D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24110E] sm:right-4 sm:top-4"
                  aria-label="Cerrar visor"
                >
                  <CloseIcon size={26} />
                </button>
                {images.length > 1 ? (
                  <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-5rem)] gap-2 overflow-x-auto sm:left-4 sm:top-4 lg:top-auto lg:bottom-4">
                    {images.map((image, index) => {
                      const isActive = index === selectedImageIndex;

                      return (
                        <button
                          key={`${item.id}-mobile-${index}`}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-[0.85rem] border transition ${
                            isActive
                              ? "border-[#FED47D] shadow-[0_6px_20px_rgba(56,25,50,0.2)]"
                              : "border-white/60"
                          }`}
                          aria-label={`Ver imagen ${index + 1} de ${item.name}`}
                        >
                          <span
                            className="block h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${image})` }}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <aside className="absolute inset-x-0 bottom-0 z-20 flex max-h-[66%] min-h-0 flex-col overflow-hidden border-t border-white/15 bg-[#18090A]/54 backdrop-blur-xl lg:inset-y-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[43%] lg:border-l lg:border-t-0 lg:bg-[#18090A]/64">
                <div ref={viewerContentRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4 pt-5 sm:gap-4 sm:p-6 lg:justify-end lg:p-7">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pickyalo-media-chip uppercase tracking-[0.14em]">
                        <Store aria-hidden="true" className="h-3.5 w-3.5" />
                        {venue.name}
                      </span>
                      {item.categoryName ? (
                        <span className="pickyalo-media-chip uppercase tracking-[0.14em]">
                          {item.categoryName}
                        </span>
                      ) : null}
                    </div>
                    <h4
                      id={`product-dialog-title-${item.id}`}
                      className="mt-2 line-clamp-2 text-[clamp(1.75rem,7vw,3.2rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-[#FFF7E8] [text-shadow:0_4px_22px_rgba(0,0,0,.35)] lg:text-[2.65rem]"
                    >
                      {item.name}
                    </h4>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ProductPriceBadge
                        priceAmount={item.priceAmount}
                        currency={item.currency}
                        priceDisplayMode={item.priceDisplayMode}
                        priceDisplayText={item.priceDisplayText}
                        pricesVisible={venue.pricesVisible}
                        className="px-3.5 py-2 text-sm sm:text-base"
                      />
                      <span className="pickyalo-media-chip">
                        <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-[#C26157]" />
                        {venue.pickupEtaMin ? `${venue.pickupEtaMin} min aprox.` : "Recogida local"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#FFF7E8]/70 sm:text-sm">
                      Recogida en {venue.cityName}.
                    </p>
                  </div>

                  {item.description ? (
                    <p
                      id={`product-dialog-description-${item.id}`}
                      className="text-sm leading-5 text-[#FFF7E8]/76 sm:text-base sm:leading-6"
                    >
                      {item.description}
                    </p>
                  ) : null}

                  <section
                    className="rounded-[1rem] border border-white/14 bg-[#18090A]/38 p-3 backdrop-blur-md sm:p-4"
                    aria-labelledby={`allergens-title-${item.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#381932] text-[#FED47D]">
                        {item.allergens.length > 0 ? (
                          <AlertCircle aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <Info aria-hidden="true" className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h5
                          id={`allergens-title-${item.id}`}
                          className="text-sm font-bold text-[#FFF7E8]"
                        >
                          Alérgenos y trazas
                        </h5>
                        <p className="mt-0.5 text-[11px] leading-4 text-[#FFF7E8]/68">
                          {item.allergens.length > 0
                            ? "Datos facilitados por el establecimiento."
                            : "Pendiente de confirmar con el establecimiento."}
                        </p>
                      </div>
                    </div>

                    {item.allergens.length > 0 ? (
                      <>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {item.allergens.map((allergen) => (
                            <AllergenPictogram key={allergen} allergen={allergen} compact />
                          ))}
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-[#FFF7E8]/76">
                          Puede contener trazas de{" "}
                          {item.allergens
                            .map((allergen) => allergenLabels[allergen].toLocaleLowerCase("es"))
                            .join(", ")}.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2.5 rounded-[0.75rem] bg-white/10 px-3 py-2 text-[11px] font-semibold leading-4 text-[#FFF7E8]">
                        Confirma los alérgenos antes de pedir.
                      </p>
                    )}

                    <p className="mt-2 text-[10px] leading-4 text-[#FFF7E8]/62">
                      Si tienes una alergia o intolerancia, consulta directamente con el local antes de pedir.
                    </p>
                  </section>
                </div>

                <ScrollContentHint
                  visible={canScrollViewer}
                  onActivate={scrollViewerForward}
                  label="Desliza para leer todo"
                  positionClassName="inset-x-0 bottom-[5.5rem]"
                />

                <div className="mt-auto shrink-0 border-t border-white/12 bg-[#18090A]/48 p-3 backdrop-blur-xl sm:p-4">
                  <Link href={`/zonas/${venue.citySlug}/venues/${venue.slug}#informacion`} className="pickyalo-media-cta w-full px-5 py-3">
                    <MapPin size={18} aria-hidden="true" />Cómo llegar y contactar
                  </Link>
                </div>
              </aside>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
