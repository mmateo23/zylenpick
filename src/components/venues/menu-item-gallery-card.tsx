"use client";

import { useMemo, useState } from "react";

import { CloseIcon } from "@/components/icons/close-icon";
import { FeaturedBadgeIcon } from "@/components/icons/featured-badge-icon";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import type { CartVenue } from "@/features/cart/types";
import { getMenuItemSecondaryImage } from "@/features/venues/menu-item-media";
import type {
  MenuItemAllergen,
  VenueMenuItem,
} from "@/features/venues/types";
import { trackEvent } from "@/lib/analytics/track-event";
import { formatPrice } from "@/lib/utils/currency";

const allergenLabels: Record<MenuItemAllergen, string> = {
  gluten: "Gluten",
  crustaceos: "Crustaceos",
  huevo: "Huevo",
  pescado: "Pescado",
  cacahuetes: "Cacahuetes",
  soja: "Soja",
  leche: "Leche",
  frutos_de_cascara: "Frutos de cascara",
  apio: "Apio",
  mostaza: "Mostaza",
  sesamo: "Sesamo",
  sulfitos: "Sulfitos",
  altramuces: "Altramuces",
  moluscos: "Moluscos",
};

type MenuItemGalleryCardProps = {
  item: VenueMenuItem;
  venue: CartVenue;
  anchorId?: string;
};

export function MenuItemGalleryCard({
  item,
  venue,
  anchorId,
}: MenuItemGalleryCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = useMemo(() => {
    const gallery = [
      item.imageUrl,
      item.secondaryImageUrl ?? getMenuItemSecondaryImage(item.name),
    ].filter(Boolean) as string[];

    return Array.from(new Set(gallery));
  }, [item.imageUrl, item.name, item.secondaryImageUrl]);

  const primaryImage = images[0] ?? null;
  const selectedImage = images[selectedImageIndex] ?? primaryImage;

  const handleOpenViewer = () => {
    setSelectedImageIndex(0);
    setIsViewerOpen(true);
    trackEvent("view_dish", {
      city_slug: venue.citySlug,
      city_name: venue.cityName,
      venue_slug: venue.slug,
      venue_name: venue.name,
      item_id: item.id,
      item_name: item.name,
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
                <FeaturedBadgeIcon size={17} />
              </span>
            ) : null}
            {item.isPickupMonthHighlight ? (
              <span className="inline-flex rounded-full border border-accent-border bg-[color-mix(in_srgb,var(--overlay-card-to)_22%,transparent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-bright backdrop-blur-xl">
                Más recogido del mes
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="line-clamp-2 text-[1.45rem] font-semibold leading-[0.96] tracking-[-0.045em] text-text-inverse sm:text-[1.7rem]">
              {item.name}
            </h3>
            {item.description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-inverse/70">
                {item.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-inverse/80 backdrop-blur-xl">
                {formatPrice(item.priceAmount, item.currency)}
              </span>
              <span className="rounded-full border border-text-inverse/10 bg-[color-mix(in_srgb,var(--overlay-card-to)_22%,transparent)] px-3.5 py-1.5 text-xs font-semibold text-text-inverse/90 backdrop-blur-xl">
                Ver plato
              </span>
            </div>
          </div>
        </button>

        <div className="gold-spotlight-content border-t border-border-subtle bg-surface-strong px-4 py-3 sm:px-5">
          <AddToCartButton
            venue={venue}
            item={{
              id: item.id,
              name: item.name,
              description: item.description,
              priceAmount: item.priceAmount,
              currency: item.currency,
              imageUrl: item.imageUrl,
            }}
            className="mt-0"
            source="dish_card"
            buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full border border-accent-border bg-accent-soft px-5 py-2.5 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft"
            feedbackClassName="mt-3 text-sm leading-6 text-text-muted"
          />
        </div>
      </article>

      {isViewerOpen ? (
        <div className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--overlay-hero-to)_84%,transparent)] backdrop-blur-sm">
          <div className="flex h-full min-h-0 items-center justify-center p-2 sm:p-6">
            <section className="grid max-h-[calc(100svh-1rem)] w-full max-w-6xl overflow-hidden rounded-[1.25rem] border border-text-inverse/16 bg-[color-mix(in_srgb,var(--overlay-hero-to)_94%,transparent)] text-text-inverse shadow-[var(--shadow)] backdrop-blur-2xl sm:max-h-[calc(100svh-3rem)] sm:rounded-[1.6rem] lg:grid-cols-[minmax(0,1.12fr)_25rem]">
              <div className="relative min-h-[17rem] overflow-hidden sm:min-h-[24rem] lg:min-h-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: selectedImage
                      ? `url(${selectedImage})`
                      : "linear-gradient(180deg, var(--brand-accent-soft), var(--overlay-hero-from))",
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,7,0.04)_0%,rgba(4,8,7,0.02)_42%,rgba(4,8,7,0.34)_100%)]" />
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className="magnetic-button absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-text-inverse/16 bg-[color-mix(in_srgb,var(--overlay-card-to)_42%,transparent)] text-text-inverse backdrop-blur-xl sm:right-4 sm:top-4"
                  aria-label="Cerrar visor"
                >
                  <CloseIcon size={18} />
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
                              ? "border-accent shadow-[var(--card-shadow)]"
                              : "border-text-inverse/18"
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

              <aside className="flex min-h-0 flex-col overflow-y-auto bg-[color-mix(in_srgb,var(--overlay-hero-to)_72%,var(--text-inverse)_8%)]">
                <div className="space-y-5 p-5 sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                        Plato
                      </p>
                      {item.categoryName ? (
                        <span className="rounded-full border border-text-inverse/16 bg-text-inverse/[0.08] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-text-inverse/78">
                          {item.categoryName}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="mt-3 text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-text-inverse lg:text-4xl">
                      {item.name}
                    </h4>
                    <p className="mt-4 text-2xl font-semibold text-text-inverse">
                      {formatPrice(item.priceAmount, item.currency)}
                    </p>
                  </div>

                  {item.description ? (
                    <p className="text-base leading-7 text-text-inverse/82">
                      {item.description}
                    </p>
                  ) : null}

                  <div className="grid gap-2 rounded-[1rem] border border-text-inverse/16 bg-[color-mix(in_srgb,var(--overlay-card-to)_28%,transparent)] p-3 text-sm text-text-inverse/76">
                    <div className="flex items-center justify-between gap-4">
                      <span>Precio</span>
                      <span className="font-semibold text-text-inverse">
                        {formatPrice(item.priceAmount, item.currency)}
                      </span>
                    </div>
                    {item.categoryName ? (
                      <div className="flex items-center justify-between gap-4">
                        <span>Categoria</span>
                        <span className="text-right font-semibold text-text-inverse">
                          {item.categoryName}
                        </span>
                      </div>
                    ) : null}
                    {item.isPickupMonthHighlight ? (
                      <div className="flex items-center justify-between gap-4">
                        <span>Destacado</span>
                        <span className="text-right font-semibold text-accent-bright">
                          Mas recogido del mes
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {item.allergens.length > 0 ? (
                    <div className="rounded-[1rem] border border-text-inverse/14 bg-text-inverse/[0.06] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-inverse/74">
                        Alergenos
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.allergens.map((allergen) => (
                          <span
                            key={allergen}
                            className="inline-flex items-center gap-2 rounded-full border border-text-inverse/16 bg-[color-mix(in_srgb,var(--text-inverse)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-text-inverse/90"
                          >
                            <span
                              aria-hidden="true"
                              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-[10px] font-bold leading-none text-accent-bright"
                            >
                              i
                            </span>
                            {allergenLabels[allergen]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

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
                                ? "border-accent shadow-[var(--card-shadow)]"
                                : "border-text-inverse/18"
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

                <div className="sticky bottom-0 mt-auto border-t border-text-inverse/16 bg-[color-mix(in_srgb,var(--overlay-hero-to)_96%,transparent)] p-4 backdrop-blur-2xl sm:p-5">
                  <AddToCartButton
                    venue={venue}
                    item={{
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      priceAmount: item.priceAmount,
                      currency: item.currency,
                      imageUrl: item.imageUrl,
                    }}
                    className="mt-0"
                    source="dish_detail"
                    buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full border border-accent-border bg-cta px-5 py-3.5 text-sm font-semibold text-cta-text shadow-[var(--card-shadow)] transition hover:bg-cta-hover"
                    feedbackClassName="mt-3 text-sm leading-6 text-text-inverse/76"
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
