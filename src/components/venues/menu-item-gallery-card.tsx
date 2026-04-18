"use client";

import { useMemo, useState } from "react";

import { CloseIcon } from "@/components/icons/close-icon";
import { FeaturedBadgeIcon } from "@/components/icons/featured-badge-icon";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import type { CartVenue } from "@/features/cart/types";
import { getMenuItemSecondaryImage } from "@/features/venues/menu-item-media";
import type { VenueMenuItem } from "@/features/venues/types";
import { formatPrice } from "@/lib/utils/currency";

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
            buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full border border-accent-border bg-accent-soft px-5 py-2.5 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft"
            feedbackClassName="mt-3 text-sm leading-6 text-text-muted"
          />
        </div>
      </article>

      {isViewerOpen ? (
        <div className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--overlay-hero-to)_84%,transparent)] backdrop-blur-sm">
          <div className="flex h-full min-h-0 flex-col p-3 sm:p-6">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[1.35rem] border border-text-inverse/10 bg-text-inverse/[0.06] px-4 py-3 text-text-inverse shadow-[var(--soft-shadow)] backdrop-blur-2xl sm:px-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-inverse/50">
                  Plato
                </p>
                <h3 className="mt-1 text-xl font-semibold sm:text-2xl">
                  {item.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewerOpen(false)}
                className="magnetic-button inline-flex h-11 w-11 items-center justify-center rounded-full border border-text-inverse/10 bg-text-inverse/5 text-text-inverse"
                aria-label="Cerrar visor"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="mx-auto mt-3 grid min-h-0 w-full max-w-6xl flex-1 gap-3 lg:grid-cols-[minmax(0,1.2fr)_24rem]">
              <section className="min-h-[45vh] overflow-hidden rounded-[1.35rem] border border-text-inverse/10 bg-text-inverse/[0.04] shadow-[var(--shadow)] backdrop-blur-xl">
                <div
                  className="h-full min-h-[45vh] bg-cover bg-center"
                  style={{
                    backgroundImage: selectedImage
                      ? `linear-gradient(180deg, var(--overlay-card-from), var(--overlay-card-mid)), url(${selectedImage})`
                      : "linear-gradient(180deg, var(--brand-accent-soft), var(--overlay-hero-from))",
                  }}
                />
              </section>

              <aside className="overflow-y-auto rounded-[1.35rem] border border-text-inverse/10 bg-text-inverse/[0.04] p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-accent">
                  Vista del plato
                </p>
                <h4 className="mt-4 text-4xl font-semibold leading-[0.96] text-text-inverse">
                  {item.name}
                </h4>
                {item.description ? (
                  <p className="mt-4 text-base leading-8 text-text-inverse/60">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-6 text-2xl font-semibold text-text-inverse">
                  {formatPrice(item.priceAmount, item.currency)}
                </p>

                {images.length > 1 ? (
                  <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
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
                              : "border-text-inverse/10"
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

                <div className="mt-8">
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
                    buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full bg-cta px-5 py-3 text-sm font-semibold text-cta-text shadow-[var(--card-shadow)] transition hover:bg-cta-hover"
                    feedbackClassName="mt-3 text-sm leading-6 text-text-inverse/60"
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
