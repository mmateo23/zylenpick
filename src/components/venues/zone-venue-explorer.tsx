"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import type { VenueListItem } from "@/features/venues/types";
import { getVenueCategory } from "@/features/venues/venue-meta";

type ZoneVenueExplorerProps = {
  citySlug: string;
  featuredVenue: VenueListItem | null;
  venues: VenueListItem[];
};

const preferredCategoryOrder = [
  "Burgers",
  "Pizza",
  "Sushi",
  "Comida casera",
  "Postres",
  "Otros",
];

export function ZoneVenueExplorer({
  citySlug,
  featuredVenue,
  venues,
}: ZoneVenueExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  const categories = useMemo(() => {
    const availableCategories = Array.from(
      new Set(venues.map((venue) => getVenueCategory(venue.slug))),
    );

    return [
      "Todas",
      ...preferredCategoryOrder.filter((category) =>
        availableCategories.includes(category),
      ),
    ];
  }, [venues]);

  const filteredVenues = useMemo(() => {
    if (selectedCategory === "Todas") {
      return venues;
    }

    return venues.filter(
      (venue) => getVenueCategory(venue.slug) === selectedCategory,
    );
  }, [selectedCategory, venues]);

  return (
    <>
      {featuredVenue ? (
        <section className="mt-8">
          <article
            className="editorial-card overflow-hidden rounded-[2.8rem] border border-white/10 px-8 py-10 text-white shadow-[var(--shadow)] sm:px-10 sm:py-12"
            style={{
              backgroundImage: featuredVenue.coverUrl
                ? `linear-gradient(180deg, rgba(12, 14, 13, 0.28), rgba(12, 14, 13, 0.84)), url(${featuredVenue.coverUrl})`
                : "linear-gradient(135deg, rgba(31, 138, 112, 0.5), rgba(11, 16, 15, 0.84))",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/68">
              Restaurante destacado
            </p>
            <h2 className="mt-5 max-w-[12ch] text-balance text-5xl font-semibold leading-[0.92] sm:text-6xl">
              {featuredVenue.name}
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg leading-8 text-white/80">
              {featuredVenue.description}
            </p>
            <Link
              href={`/cities/${citySlug}/venues/${featuredVenue.slug}`}
              className="mt-8 inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
            >
              Ver menú
            </Link>
          </article>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-3">
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[color:var(--brand)] text-white shadow-[var(--card-shadow)]"
                      : "border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--muted-strong)]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {filteredVenues.length > 0 ? (
        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          {filteredVenues.map((venue) => (
            <Link
              key={venue.id}
              href={`/cities/${citySlug}/venues/${venue.slug}`}
              className="editorial-card group overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--soft-shadow)] transition hover:-translate-y-1.5 hover:shadow-[var(--shadow)]"
            >
              <div
                className="min-h-[24rem] bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: venue.coverUrl
                    ? `linear-gradient(180deg, rgba(23, 17, 14, 0.22), rgba(23, 17, 14, 0.58)), url(${venue.coverUrl})`
                    : "linear-gradient(180deg, rgba(224, 171, 87, 0.32), rgba(213, 90, 50, 0.38))",
                }}
              />
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                      {getVenueCategory(venue.slug)}
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold leading-[0.98] text-[color:var(--foreground)]">
                      {venue.name}
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-[color:var(--muted-strong)]">
                      {venue.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-[color:var(--surface-strong)] px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground)] shadow-[var(--card-shadow)]">
                    {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "Recogida"}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
                    <LocationPinIcon
                      size={18}
                      className="text-[color:var(--brand)]"
                    />
                    {venue.address ?? "Dirección pendiente"}
                  </p>
                  <div className="inline-flex items-center gap-4">
                    <span className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
                      <ClockIcon
                        size={18}
                        className="text-[color:var(--brand)]"
                      />
                      {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "Recogida"}
                    </span>
                    <span className="text-sm font-semibold text-[color:var(--brand-strong)]">
                      Ver menú
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            No hay locales para esta categoría.
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Prueba con otra categoría para seguir explorando la zona.
          </p>
        </section>
      )}
    </>
  );
}
