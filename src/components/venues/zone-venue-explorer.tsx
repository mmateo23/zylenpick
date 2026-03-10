"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import {
  getDistanceInKm,
  readUserLocation,
  type UserLocation,
} from "@/features/location/browser-location";
import type { VenueListItem } from "@/features/venues/types";
import {
  getVenueCategory,
  getVenueCoordinates,
} from "@/features/venues/venue-meta";
import { VerifiedVenueBadge } from "@/components/venues/verified-venue-badge";

type ZoneVenueExplorerProps = {
  citySlug: string;
  featuredVenue: VenueListItem | null;
  venues: VenueListItem[];
};

type VenueJourney = {
  distanceKm: number;
  distanceLabel: string;
  walkingMinutes: number;
};

const preferredCategoryOrder = [
  "Burgers",
  "Pizza",
  "Sushi",
  "Comida casera",
  "Postres",
  "Otros",
];

function formatDistanceLabel(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(50, Math.round(distanceKm * 1000))} m`;
  }

  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

function getVenueJourney(
  venueSlug: string,
  userLocation: UserLocation | null,
): VenueJourney | null {
  if (!userLocation) {
    return null;
  }

  const venueCoordinates = getVenueCoordinates(venueSlug);

  if (!venueCoordinates) {
    return null;
  }

  const distanceKm = getDistanceInKm(
    userLocation.latitude,
    userLocation.longitude,
    venueCoordinates.latitude,
    venueCoordinates.longitude,
  );

  return {
    distanceKm,
    distanceLabel: formatDistanceLabel(distanceKm),
    walkingMinutes: Math.max(1, Math.round((distanceKm / 4.8) * 60)),
  };
}

export function ZoneVenueExplorer({
  citySlug,
  featuredVenue,
  venues,
}: ZoneVenueExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    setUserLocation(readUserLocation());

    const syncLocation = () => {
      setUserLocation(readUserLocation());
    };

    window.addEventListener("storage", syncLocation);

    return () => {
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

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
    const matchingVenues =
      selectedCategory === "Todas"
        ? venues
        : venues.filter(
            (venue) => getVenueCategory(venue.slug) === selectedCategory,
          );

    if (!userLocation) {
      return matchingVenues;
    }

    return [...matchingVenues].sort((venueA, venueB) => {
      const journeyA = getVenueJourney(venueA.slug, userLocation);
      const journeyB = getVenueJourney(venueB.slug, userLocation);

      if (!journeyA && !journeyB) {
        return 0;
      }

      if (!journeyA) {
        return 1;
      }

      if (!journeyB) {
        return -1;
      }

      return journeyA.distanceKm - journeyB.distanceKm;
    });
  }, [selectedCategory, userLocation, venues]);

  const featuredJourney = useMemo(
    () =>
      featuredVenue ? getVenueJourney(featuredVenue.slug, userLocation) : null,
    [featuredVenue, userLocation],
  );

  return (
    <>
      {featuredVenue ? (
        <section className="mt-8">
          <article
            className="editorial-card spotlight-panel overflow-hidden rounded-[2.8rem] border border-white/10 px-8 py-10 text-white shadow-[var(--shadow)] sm:px-10 sm:py-12"
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
            <div className="mt-4">
              <VerifiedVenueBadge
                isVerified={featuredVenue.isVerified}
                subscriptionActive={featuredVenue.subscriptionActive}
                withLabel
              />
            </div>
            <p className="mt-5 max-w-[44ch] text-lg leading-8 text-white/80">
              {featuredVenue.description}
            </p>

            {featuredJourney ? (
              <div className="mt-6 space-y-2 text-sm text-white/80">
                <p className="inline-flex items-center gap-2">
                  <LocationPinIcon size={18} className="text-[color:var(--accent)]" />
                  A {featuredJourney.walkingMinutes} min andando ·{" "}
                  {featuredJourney.distanceLabel}
                </p>
                <p className="inline-flex items-center gap-2">
                  <ClockIcon size={18} className="text-[color:var(--accent)]" />
                  Recogida en{" "}
                  {featuredVenue.pickupEtaMin
                    ? `${featuredVenue.pickupEtaMin} min`
                    : "breve"}
                </p>
              </div>
            ) : null}

            <Link
              href={`/cities/${citySlug}/venues/${featuredVenue.slug}`}
              className="magnetic-button mt-8 inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)]"
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
                  className={`magnetic-button rounded-full px-4 py-2.5 text-sm font-medium transition ${
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
          {filteredVenues.map((venue) => {
            const journey = getVenueJourney(venue.slug, userLocation);

            return (
              <Link
                key={venue.id}
                href={`/cities/${citySlug}/venues/${venue.slug}`}
                className="editorial-card hover-lift-card group overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--soft-shadow)]"
              >
                <div
                  className="min-h-[24rem] bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                  style={{
                    backgroundImage: venue.coverUrl
                      ? `linear-gradient(180deg, rgba(23, 17, 14, 0.22), rgba(23, 17, 14, 0.58)), url(${venue.coverUrl})`
                      : "linear-gradient(180deg, rgba(31, 138, 112, 0.32), rgba(15, 22, 20, 0.52))",
                  }}
                />
                <div className="p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                        {getVenueCategory(venue.slug)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <h2 className="text-4xl font-semibold leading-[0.98] text-[color:var(--foreground)]">
                          {venue.name}
                        </h2>
                        <VerifiedVenueBadge
                          isVerified={venue.isVerified}
                          subscriptionActive={venue.subscriptionActive}
                        />
                      </div>
                      <p className="mt-5 text-sm leading-7 text-[color:var(--muted-strong)]">
                        {venue.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-[color:var(--surface-strong)] px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground)] shadow-[var(--card-shadow)]">
                      {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "Recogida"}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                      <p className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
                        <LocationPinIcon
                          size={18}
                          className="text-[color:var(--brand)]"
                        />
                        {venue.address ?? "Dirección pendiente"}
                      </p>

                      {journey ? (
                        <p className="text-sm text-[color:var(--muted-strong)]">
                          A {journey.walkingMinutes} min andando · {journey.distanceLabel}
                        </p>
                      ) : null}
                    </div>

                    <div className="inline-flex items-center gap-4">
                      <span className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
                        <ClockIcon
                          size={18}
                          className="text-[color:var(--brand)]"
                        />
                        Recogida en{" "}
                        {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "breve"}
                      </span>
                      <span className="text-sm font-semibold text-[color:var(--brand-strong)]">
                        Ver menú
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
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
