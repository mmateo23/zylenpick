"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Info, Store } from "lucide-react";

import { CloseIcon } from "@/components/icons/close-icon";
import { FeaturedBadgeIcon } from "@/components/icons/featured-badge-icon";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  AllergenPictogram,
  allergenLabels,
} from "@/components/venues/allergen-pictogram";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import type { CartVenue } from "@/features/cart/types";
import {
  getMenuItemDisplayImage,
  getMenuItemSecondaryImage,
} from "@/features/venues/menu-item-media";
import type { VenueMenuItem } from "@/features/venues/types";
import { capturePlatoVisto } from "@/lib/analytics/posthog-events";
import { trackEvent } from "@/lib/analytics/track-event";
import { formatPrice } from "@/lib/utils/currency";

type MenuItemGalleryCardProps = {
  item: VenueMenuItem;
  venue: CartVenue;
  anchorId?: string;
  labels?: {
    viewDetail: string;
    addForPickup: string;
  };
};

export function MenuItemGalleryCard({
  item,
  venue,
  anchorId,
  labels,
}: MenuItemGalleryCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasCapturedViewRef = useRef(false);

  const images = useMemo(() => {
    const gallery = [
      getMenuItemDisplayImage(item.name, item.imageUrl),
      item.secondaryImageUrl ?? getMenuItemSecondaryImage(item.name),
    ].filter(Boolean) as string[];

    return Array.from(new Set(gallery));
  }, [item.imageUrl, item.name, item.secondaryImageUrl]);

  const primaryImage = images[0] ?? null;
  const selectedImage = images[selectedImageIndex] ?? primaryImage;

  useEffect(() => {
    if (!isViewerOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsViewerOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
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
        item_price: item.priceAmount / 100,
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
      item_price: item.priceAmount / 100,
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
        className={`group relative scroll-mt-28 overflow-hidden rounded-[0.9rem] border bg-surface-strong text-left shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[var(--shadow-soft)] sm:rounded-[1.05rem] ${highlightClassName}`}
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
          type="button"
          onClick={handleOpenViewer}
          className="gold-spotlight-content relative block min-h-[18rem] w-full text-left sm:min-h-[20rem]"
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

          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-3 sm:p-4">
            {item.isFeatured ? (
              <span
                title="Destacado"
                aria-label="Destacado"
                className="featured-badge-animated inline-flex h-9 w-9 items-center justify-center rounded-full border border-warning/40 bg-[color-mix(in_srgb,var(--overlay-card-to)_22%,transparent)] text-warning backdrop-blur-xl"
              >
                <FeaturedBadgeIcon size={22} />
              </span>
            ) : null}
            {item.isPickupMonthHighlight ? (
              <span className="inline-flex rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                Más recogido del mes
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="line-clamp-2 text-[1.45rem] font-semibold leading-[0.96] tracking-[-0.045em] text-text-inverse sm:text-[1.7rem]">
              {item.name}
            </h3>
            {item.description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/85 drop-shadow-[0_3px_10px_rgba(0,0,0,0.72)]">
                {item.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 shadow-[0_6px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                {venue.pricesVisible
                  ? formatPrice(item.priceAmount, item.currency)
                  : "Precio pendiente"}
              </span>
              <span className="rounded-full border border-white/25 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                {labels?.viewDetail ?? "Ver detalle"}
              </span>
            </div>
          </div>
        </button>

        <div className="gold-spotlight-content border-t border-border-subtle bg-surface-strong px-4 py-3 sm:px-5">
          <div className="mb-3 flex items-start gap-2 text-xs leading-5 text-text-muted">
            <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            {item.allergens.length > 0 ? (
              <div className="min-w-0">
                <p className="font-semibold text-text">Puede contener o presentar trazas de:</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.allergens.map((allergen) => (
                    <AllergenPictogram key={allergen} allergen={allergen} compact />
                  ))}
                </div>
              </div>
            ) : (
              <p>
                <span className="font-semibold text-text">Alérgenos pendientes. </span>
                Consulta al local antes de pedir.
              </p>
            )}
          </div>
          <AddToCartButton
            venue={venue}
            item={{
              id: item.id,
              name: item.name,
              description: item.description,
              priceAmount: item.priceAmount,
              currency: item.currency,
              imageUrl: primaryImage,
            }}
            className="mt-0"
            source="dish_card"
            label={labels?.addForPickup ?? "Añadir para recoger"}
            buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full border border-accent-border bg-accent-soft px-5 py-2.5 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft"
            feedbackClassName="mt-3 text-sm leading-6 text-text-muted"
            disabled={!venue.pricesVisible}
            disabledLabel="Disponible pronto"
          />
        </div>
      </article>

      {isViewerOpen ? (
        <div
          className="fixed inset-0 z-50 bg-[#381932]/55 p-2 backdrop-blur-[2px] sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`product-dialog-title-${item.id}`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsViewerOpen(false);
          }}
        >
          <div className="flex h-full min-h-0 items-center justify-center">
            <section className="grid h-[calc(100svh-1rem)] w-full max-w-6xl grid-rows-[minmax(12rem,32svh)_minmax(0,1fr)] overflow-hidden rounded-[1.25rem] border border-[#381932]/10 bg-[#FFF9F1] text-[#381932] shadow-[0_28px_90px_rgba(56,25,50,0.28)] sm:h-[calc(100svh-3rem)] sm:grid-rows-[minmax(17rem,44svh)_minmax(0,1fr)] sm:rounded-[1.6rem] lg:h-[min(48rem,calc(100svh-3rem))] lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:grid-rows-none">
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
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className="magnetic-button absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[#FFF9F1]/90 text-[#381932] shadow-[0_8px_24px_rgba(56,25,50,0.18)] backdrop-blur-md transition hover:bg-white sm:right-4 sm:top-4"
                  aria-label="Cerrar visor"
                >
                  <CloseIcon size={26} />
                </button>
                {images.length > 1 ? (
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto p-3 sm:p-4 lg:hidden">
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

              <aside className="flex min-h-0 flex-col overflow-y-auto overscroll-contain bg-[#FFF9F1]">
                <div className="space-y-5 p-5 pb-24 sm:p-7 sm:pb-28">
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
                      className="mt-4 text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-[#381932] lg:text-4xl"
                    >
                      {item.name}
                    </h4>
                    <p className="mt-4 text-2xl font-bold text-[#C26157]">
                      {venue.pricesVisible
                        ? formatPrice(item.priceAmount, item.currency)
                        : "Precio pendiente"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#381932]/62">
                      Para recoger en {venue.cityName}.
                    </p>
                  </div>

                  {item.description ? (
                    <p className="text-base leading-7 text-[#381932]/78">
                      {item.description}
                    </p>
                  ) : null}

                  <section
                    className={`rounded-[1rem] border p-4 ${
                      item.allergens.length > 0
                        ? "border-[#C26157]/22 bg-[#FFE9EC]/65"
                        : "border-[#381932]/12 bg-white"
                    }`}
                    aria-labelledby={`allergens-title-${item.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#381932] text-[#FED47D]">
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
                          Información sobre alérgenos
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-[#381932]/64">
                          {item.allergens.length > 0
                            ? "Aviso preventivo declarado por el establecimiento."
                            : "El establecimiento aún no ha confirmado esta información."}
                        </p>
                      </div>
                    </div>

                    {item.allergens.length > 0 ? (
                      <>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#381932]/62">
                          Puede contener o presentar trazas de
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.allergens.map((allergen) => (
                            <AllergenPictogram key={allergen} allergen={allergen} />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="mt-3 rounded-[0.75rem] bg-[#FFE9EC] px-3 py-2.5 text-xs font-semibold leading-5 text-[#381932]">
                        No interpretes la ausencia de datos como ausencia de alérgenos. Consulta al local antes de pedir.
                      </p>
                    )}

                    <p className="mt-3 text-[11px] leading-5 text-[#381932]/58">
                      Si tienes una alergia o intolerancia, confirma la información con el establecimiento antes de completar el pedido.
                    </p>
                  </section>

                  {images.length > 1 ? (
                    <div className="hidden gap-3 overflow-x-auto pb-1 lg:flex">
                      {images.map((image, index) => {
                        const isActive = index === selectedImageIndex;

                        return (
                          <button
                            key={`${item.id}-${index}`}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border transition ${
                              isActive
                                ? "border-[#C26157] shadow-[0_6px_20px_rgba(56,25,50,0.12)]"
                                : "border-[#381932]/12"
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

                <div className="sticky bottom-0 mt-auto border-t border-[#381932]/10 bg-[#FFF9F1]/96 p-4 backdrop-blur-md sm:p-5">
                  <p className="mb-3 text-center text-xs font-semibold text-[#381932]/72">
                    {item.allergens.length > 0
                      ? `Puede contener o presentar trazas de: ${item.allergens
                          .map((allergen) => allergenLabels[allergen])
                          .join(", ")}.`
                      : "Alérgenos sin confirmar · Consulta al local"}
                  </p>
                  <AddToCartButton
                    venue={venue}
                    item={{
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      priceAmount: item.priceAmount,
                      currency: item.currency,
                      imageUrl: primaryImage,
                    }}
                    className="mt-0"
                    source="dish_detail"
                    label={labels?.addForPickup ?? "Añadir para recoger"}
                    buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full border border-[#C26157] bg-[#C26157] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(194,97,87,0.2)] transition hover:bg-[#A94F47]"
                    feedbackClassName="mt-3 text-sm leading-6 text-[#381932]/70"
                    disabled={!venue.pricesVisible}
                    disabledLabel="Disponible pronto"
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
