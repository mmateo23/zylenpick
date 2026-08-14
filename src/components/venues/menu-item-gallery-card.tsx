"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Clock3, Info, MapPin, Store } from "lucide-react";

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
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import type { CartVenue } from "@/features/cart/types";
import { isDefinitivePrice } from "@/features/pricing/price-display";
import {
  getMenuItemDisplayImage,
  getMenuItemSecondaryImage,
} from "@/features/venues/menu-item-media";
import type { VenueMenuItem } from "@/features/venues/types";
import { capturePlatoVisto } from "@/lib/analytics/posthog-events";
import { trackEvent } from "@/lib/analytics/track-event";

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
    const gallery = [
      getMenuItemDisplayImage(item.name, item.imageUrl),
      item.secondaryImageUrl ?? getMenuItemSecondaryImage(item.name),
    ].filter(Boolean) as string[];

    return Array.from(new Set(gallery));
  }, [item.imageUrl, item.name, item.secondaryImageUrl]);

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
      <article
        id={anchorId}
        className={`group relative h-full scroll-mt-28 overflow-hidden rounded-[0.9rem] border bg-surface-strong text-left shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[var(--shadow-soft)] sm:rounded-[1.05rem] ${highlightClassName}`}
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--overlay-card-from),var(--overlay-card-mid)_42%,var(--overlay-card-to)_100%)]" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
            <div className="min-w-0 space-y-2">
              {!isVenueCompact ? (
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/30 bg-black/[0.45] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  <Store aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{venue.name}</span>
                </span>
              ) : null}
              <div className="flex flex-wrap gap-1.5">
                {item.categoryName ? (
                  <span className="rounded-full border border-white/25 bg-black/[0.38] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-xl">
                    {item.categoryName}
                  </span>
                ) : null}
                {!isVenueCompact ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/[0.38] px-2.5 py-1 text-[9px] font-semibold text-white/90 backdrop-blur-xl">
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
                  className="featured-badge-animated inline-flex h-9 w-9 items-center justify-center rounded-full border border-warning/40 bg-black/[0.45] text-warning backdrop-blur-xl"
                >
                  <FeaturedBadgeIcon size={22} />
                </span>
              ) : null}
              {item.isPickupMonthHighlight ? (
                <span className="inline-flex rounded-full border border-white/25 bg-black/[0.45] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  Muy elegido
                </span>
              ) : null}
            </div>
          </div>

          <div className={`absolute inset-x-0 bottom-0 ${isVenueCompact ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
            <h3 className={`line-clamp-2 font-semibold leading-[0.98] tracking-[-0.04em] text-text-inverse ${
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
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-xl">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "Recogida"}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-xl">
                <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
                {item.allergens.length > 0
                  ? `${item.allergens.length} ${item.allergens.length === 1 ? "alérgeno" : "alérgenos"}`
                  : "Revisar alérgenos"}
              </span>
              <span className={`${isVenueCompact ? "px-2.5 py-1 text-[10px]" : "ml-auto px-3.5 py-1.5 text-xs"} rounded-full border border-white/25 bg-black/[0.45] font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl`}>
                {labels?.viewDetail ?? "Ver detalle"}
              </span>
            </div>
          </div>
        </button>

        <div className={`gold-spotlight-content border-t border-border-subtle bg-surface-strong ${isVenueCompact ? "px-3 py-2.5" : "px-4 py-3 sm:px-5"}`}>
          <div className={`${isVenueCompact ? "mb-2" : "mb-3"} flex items-start gap-2 text-xs leading-5 text-text-muted`}>
            <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            {item.allergens.length > 0 ? (
              <div className="min-w-0">
                {!isVenueCompact ? <p className="font-semibold text-text">Alérgenos y posibles trazas:</p> : null}
                <div className={`${isVenueCompact ? "mt-0" : "mt-2"} flex flex-wrap gap-1.5`}>
                  {item.allergens.map((allergen) => (
                    <AllergenPictogram key={allergen} allergen={allergen} compact />
                  ))}
                </div>
              </div>
            ) : (
              <p>
                <span className="font-semibold text-text">Información de alérgenos pendiente.</span>
                {!isVenueCompact ? " Confírmala con el local antes de pedir." : null}
              </p>
            )}
          </div>
          {isVenueCompact && !venue.pricesVisible ? (
            <p className="rounded-[0.75rem] bg-[#741314]/[0.06] px-3 py-2 text-center text-[11px] font-semibold leading-4 text-[#741314]">
              Precio y pedido por confirmar
            </p>
          ) : (
            <AddToCartButton
              venue={venue}
              item={{
                id: item.id,
                name: item.name,
                description: item.description,
                priceAmount: item.priceAmount,
                currency: item.currency,
                priceDisplayMode: item.priceDisplayMode,
                priceDisplayText: item.priceDisplayText,
                imageUrl: primaryImage,
              }}
              className="mt-0"
              source="dish_card"
              label={labels?.addForPickup ?? "Añadir para recoger"}
              buttonClassName="magnetic-button inline-flex min-h-11 w-full justify-center rounded-full border border-accent-border bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent-strong outline-none transition hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
              feedbackClassName="mt-3 text-sm leading-6 text-text-muted"
              disabled={!venue.pricesVisible}
              disabledLabel="Aún no disponible para añadir"
            />
          )}
        </div>
      </article>

      {isViewerOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-[#381932]/55 p-2 backdrop-blur-[2px] sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`product-dialog-title-${item.id}`}
          aria-describedby={item.description ? `product-dialog-description-${item.id}` : undefined}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsViewerOpen(false);
          }}
        >
          <div className="flex h-full min-h-0 items-center justify-center">
            <section ref={dialogRef} className="grid h-[calc(100svh-1rem)] w-full max-w-6xl grid-rows-[minmax(10.5rem,28svh)_minmax(0,1fr)] overflow-hidden rounded-[1.25rem] border border-[#381932]/10 bg-[#FFF9F1] text-[#381932] shadow-[0_28px_90px_rgba(56,25,50,0.28)] sm:h-[calc(100svh-3rem)] sm:grid-rows-[minmax(14rem,38svh)_minmax(0,1fr)] sm:rounded-[1.6rem] lg:h-[min(44rem,calc(100svh-3rem))] lg:grid-cols-[minmax(0,1.18fr)_minmax(23rem,0.82fr)] lg:grid-rows-none">
              <div className="relative min-h-0 overflow-hidden">
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
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(56,25,50,0.02)_0%,rgba(56,25,50,0.02)_58%,rgba(56,25,50,0.3)_100%)]" />
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className="magnetic-button absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[#FFF9F1]/90 text-[#381932] shadow-[0_8px_24px_rgba(56,25,50,0.18)] outline-none backdrop-blur-md transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 sm:right-4 sm:top-4"
                  aria-label="Cerrar visor"
                >
                  <CloseIcon size={26} />
                </button>
                {images.length > 1 ? (
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto p-3 sm:p-4">
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

              <aside className="relative flex min-h-0 flex-col overflow-hidden bg-[#FFF9F1]">
                <div ref={viewerContentRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4 sm:gap-4 sm:p-6 lg:p-7">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#381932]/12 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#381932]/72">
                        <Store aria-hidden="true" className="h-3.5 w-3.5" />
                        {venue.name}
                      </span>
                      {item.categoryName ? (
                        <span className="rounded-full border border-[#381932]/12 bg-[#FFE9EC] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#381932]/72">
                          {item.categoryName}
                        </span>
                      ) : null}
                    </div>
                    <h4
                      id={`product-dialog-title-${item.id}`}
                      className="mt-2 line-clamp-2 text-[clamp(1.75rem,7vw,3.2rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-[#381932] lg:text-[2.65rem]"
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
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#381932]/12 bg-white px-3 py-1.5 text-[11px] font-bold text-[#381932]/72">
                        <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-[#C26157]" />
                        {venue.pickupEtaMin ? `${venue.pickupEtaMin} min aprox.` : "Recogida local"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#381932]/62 sm:text-sm">
                      Recogida en {venue.cityName}.
                    </p>
                  </div>

                  {item.description ? (
                    <p
                      id={`product-dialog-description-${item.id}`}
                      className="text-sm leading-5 text-[#381932]/78 sm:text-base sm:leading-6"
                    >
                      {item.description}
                    </p>
                  ) : null}

                  <section
                    className={`rounded-[1rem] border p-3 sm:p-4 ${
                      item.allergens.length > 0
                        ? "border-[#C26157]/22 bg-[#FFE9EC]/65"
                        : "border-[#381932]/12 bg-white"
                    }`}
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
                          className="text-sm font-bold text-[#381932]"
                        >
                          Alérgenos y trazas
                        </h5>
                        <p className="mt-0.5 text-[11px] leading-4 text-[#381932]/64">
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
                        <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-[#381932]/72">
                          Puede contener trazas de{" "}
                          {item.allergens
                            .map((allergen) => allergenLabels[allergen].toLocaleLowerCase("es"))
                            .join(", ")}.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2.5 rounded-[0.75rem] bg-[#FFE9EC] px-3 py-2 text-[11px] font-semibold leading-4 text-[#381932]">
                        Confirma los alérgenos antes de pedir.
                      </p>
                    )}

                    <p className="mt-2 text-[10px] leading-4 text-[#381932]/58">
                      Si tienes una alergia o intolerancia, consulta directamente con el local antes de pedir.
                    </p>
                  </section>
                </div>

                <ScrollContentHint
                  visible={canScrollViewer}
                  onActivate={scrollViewerForward}
                  label="Desliza para leer todo"
                  positionClassName="inset-x-0 bottom-[4.75rem]"
                />

                <div className="mt-auto shrink-0 border-t border-[#381932]/10 bg-[#FFF9F1] p-3 sm:p-4">
                  <AddToCartButton
                    venue={venue}
                    item={{
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      priceAmount: item.priceAmount,
                      currency: item.currency,
                      priceDisplayMode: item.priceDisplayMode,
                      priceDisplayText: item.priceDisplayText,
                      imageUrl: primaryImage,
                    }}
                    className="mt-0"
                    source="dish_detail"
                    label={labels?.addForPickup ?? "Añadir para recoger"}
                    buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full border border-[#C26157] bg-[#C26157] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(194,97,87,0.2)] transition hover:bg-[#A94F47]"
                    feedbackClassName="mt-3 text-sm leading-6 text-[#381932]/70"
                    disabled={!venue.pricesVisible}
                    disabledLabel="Aún no disponible para añadir"
                  />
                </div>
              </aside>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
