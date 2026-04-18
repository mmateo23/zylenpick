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
    ? "border-[rgba(31,138,112,0.28)] group-hover:border-[rgba(31,138,112,0.48)]"
    : item.isFeatured
      ? "gold-spotlight-card border-[rgba(214,166,72,0.3)] group-hover:border-[rgba(214,166,72,0.5)]"
      : "border-black/10 group-hover:border-black/20";

  return (
    <>
      <article
        id={anchorId}
        className={`group relative scroll-mt-28 overflow-hidden rounded-[0.9rem] border bg-white text-left shadow-[0_12px_30px_rgba(31,36,28,0.08)] transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[0_18px_44px_rgba(31,36,28,0.12)] sm:rounded-[1.05rem] ${highlightClassName}`}
      >
        {item.isFeatured ? (
          <BorderBeam
            size={260}
            duration={7}
            borderWidth={2}
            className="from-transparent via-[#d6a648] to-transparent opacity-55"
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
                : "linear-gradient(180deg, rgba(31, 138, 112, 0.22), rgba(15, 22, 20, 0.38))",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,11,0.02),rgba(6,10,11,0.08)_42%,rgba(6,10,11,0.78)_100%)]" />

          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-3 sm:p-4">
            {item.isFeatured ? (
              <span
                title="Destacado"
                aria-label="Destacado"
                className="featured-badge-animated inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,166,72,0.38)] bg-black/20 text-[#f3d58d] backdrop-blur-xl"
              >
                <FeaturedBadgeIcon size={17} />
              </span>
            ) : null}
            {item.isPickupMonthHighlight ? (
              <span className="inline-flex rounded-full border border-[rgba(31,138,112,0.3)] bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)] backdrop-blur-xl">
                Más recogido del mes
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="line-clamp-2 text-[1.45rem] font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-[1.7rem]">
              {item.name}
            </h3>
            {item.description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
                {item.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
                {formatPrice(item.priceAmount, item.currency)}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-xl">
                Ver plato
              </span>
            </div>
          </div>
        </button>

        <div className="gold-spotlight-content border-t border-black/10 bg-white px-4 py-3 sm:px-5">
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
            buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full border border-[#1f8a70]/20 bg-[#1f8a70]/10 px-5 py-2.5 text-sm font-semibold text-[#11624f] transition hover:bg-[#1f8a70]/20"
            feedbackClassName="mt-3 text-sm leading-6 text-black/50"
          />
        </div>
      </article>

      {isViewerOpen ? (
        <div className="fixed inset-0 z-50 bg-[rgba(4,8,7,0.84)] backdrop-blur-sm">
          <div className="flex h-full min-h-0 flex-col p-3 sm:p-6">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/[0.06] px-4 py-3 text-white shadow-[var(--soft-shadow)] backdrop-blur-2xl sm:px-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                  Plato
                </p>
                <h3 className="mt-1 text-xl font-semibold sm:text-2xl">
                  {item.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewerOpen(false)}
                className="magnetic-button inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                aria-label="Cerrar visor"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="mx-auto mt-3 grid min-h-0 w-full max-w-6xl flex-1 gap-3 lg:grid-cols-[minmax(0,1.2fr)_24rem]">
              <section className="min-h-[45vh] overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.04] shadow-[var(--shadow)] backdrop-blur-xl">
                <div
                  className="h-full min-h-[45vh] bg-cover bg-center"
                  style={{
                    backgroundImage: selectedImage
                      ? `linear-gradient(180deg, rgba(10, 12, 11, 0.04), rgba(10, 12, 11, 0.2)), url(${selectedImage})`
                      : "linear-gradient(180deg, rgba(31, 138, 112, 0.32), rgba(15, 22, 20, 0.46))",
                  }}
                />
              </section>

              <aside className="overflow-y-auto rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--brand)]">
                  Vista del plato
                </p>
                <h4 className="mt-4 text-4xl font-semibold leading-[0.96] text-white">
                  {item.name}
                </h4>
                {item.description ? (
                  <p className="mt-4 text-base leading-8 text-white/60">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-6 text-2xl font-semibold text-white">
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
                              ? "border-[color:var(--brand)] shadow-[var(--card-shadow)]"
                              : "border-white/10"
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
                    buttonClassName="magnetic-button inline-flex w-full justify-center rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
                    feedbackClassName="mt-3 text-sm leading-6 text-white/60"
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
