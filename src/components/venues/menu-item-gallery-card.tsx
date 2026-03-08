"use client";

import { useMemo, useState } from "react";

import { CloseIcon } from "@/components/icons/close-icon";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import type { CartVenue } from "@/features/cart/types";
import { getMenuItemSecondaryImage } from "@/features/venues/menu-item-media";
import type { VenueMenuItem } from "@/features/venues/types";
import { formatPrice } from "@/lib/utils/currency";

type MenuItemGalleryCardProps = {
  item: VenueMenuItem;
  venue: CartVenue;
};

export function MenuItemGalleryCard({
  item,
  venue,
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

  return (
    <>
      <article className="editorial-card hover-lift-card overflow-hidden rounded-[2.4rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--soft-shadow)]">
        <button
          type="button"
          onClick={handleOpenViewer}
          className="block w-full text-left"
          aria-label={`Ver ${item.name}`}
        >
          <div
            className="min-h-[22rem] bg-cover bg-center transition duration-500 hover:scale-[1.02]"
            style={{
              backgroundImage: primaryImage
                ? `linear-gradient(180deg, rgba(10, 12, 11, 0.12), rgba(10, 12, 11, 0.42)), url(${primaryImage})`
                : "linear-gradient(180deg, rgba(31, 138, 112, 0.32), rgba(15, 22, 20, 0.46))",
            }}
          />
        </button>

        <div className="p-7">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-4xl font-semibold leading-[0.98] text-[color:var(--foreground)]">
              {item.name}
            </h3>
            <span className="whitespace-nowrap rounded-full bg-[color:var(--surface-strong)] px-3.5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)]">
              {formatPrice(item.priceAmount, item.currency)}
            </span>
          </div>

          <p className="mt-5 text-sm leading-7 text-[color:var(--muted-strong)]">
            {item.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleOpenViewer}
              className="magnetic-button inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)]"
            >
              Ver plato
            </button>

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
            />
          </div>
        </div>
      </article>

      {isViewerOpen ? (
        <div className="fixed inset-0 z-50 bg-[rgba(4,8,7,0.84)] backdrop-blur-sm">
          <div className="flex h-full min-h-0 flex-col p-3 sm:p-6">
            <div className="glass-panel mx-auto flex w-full max-w-6xl items-center justify-between rounded-[1.6rem] border border-white/10 px-4 py-3 text-white sm:px-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/54">
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
              <section className="glass-panel min-h-[45vh] overflow-hidden rounded-[2rem] border border-white/10 shadow-[var(--shadow)]">
                <div
                  className="h-full min-h-[45vh] bg-cover bg-center"
                  style={{
                    backgroundImage: selectedImage
                      ? `linear-gradient(180deg, rgba(10, 12, 11, 0.04), rgba(10, 12, 11, 0.2)), url(${selectedImage})`
                      : "linear-gradient(180deg, rgba(31, 138, 112, 0.32), rgba(15, 22, 20, 0.46))",
                  }}
                />
              </section>

              <aside className="glass-panel overflow-y-auto rounded-[2rem] border border-white/10 p-6 shadow-[var(--soft-shadow)]">
                <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--brand)]">
                  Vista del plato
                </p>
                <h4 className="mt-4 text-4xl font-semibold leading-[0.96] text-[color:var(--foreground)]">
                  {item.name}
                </h4>
                <p className="mt-4 text-base leading-8 text-[color:var(--muted-strong)]">
                  {item.description}
                </p>
                <p className="mt-6 text-2xl font-semibold text-[color:var(--foreground)]">
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
                          className={`h-20 w-20 shrink-0 overflow-hidden rounded-[1.2rem] border transition ${
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
