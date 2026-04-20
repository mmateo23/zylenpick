import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { MapIcon } from "@/components/icons/map-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { WalkIcon } from "@/components/icons/walk-icon";
import { VenueViewTracker } from "@/components/analytics/venue-view-tracker";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { MenuItemGalleryCard } from "@/components/venues/menu-item-gallery-card";
import { VenueArrivalCard } from "@/components/venues/venue-arrival-card";
import { VenueOpeningHours } from "@/components/venues/venue-opening-hours";
import { VerifiedVenueBadge } from "@/components/venues/verified-venue-badge";
import { VenueCartSummary } from "@/features/cart/components/venue-cart-summary";
import { getVenueDetails } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";

export const revalidate = 1800;

type VenuePageProps = {
  params: {
    citySlug: string;
    venueSlug: string;
  };
};

export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const venue = await getVenueDetails(params.citySlug, params.venueSlug);
  if (!venue) {
    return getBaseMetadata({
      title: "Local de comida local",
      description:
        "Consulta información del local, tiempos de recogida y platos disponibles.",
      path: `/zonas/${params.citySlug}/venues/${params.venueSlug}`,
    });
  }

  return getBaseMetadata({
    title: `Qué pedir en ${venue.name} | ZylenPick`,
    description: `Descubre qué pedir en ${venue.name}, ${venue.city.name}. Consulta platos, precios y opciones de recogida rápida.`,
    path: `/zonas/${venue.city.slug}/venues/${venue.slug}`,
    image: venue.coverUrl ?? venue.logoUrl ?? "/logo/ZylenPick_LOGO.png?v=1",
  });
}

export default async function VenuePage({ params }: VenuePageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-page text-text-primary">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
          <section className="rounded-[1.8rem] border border-dashed border-accent/45 bg-surface-muted p-8 shadow-[var(--soft-shadow)] ring-1 ring-accent-soft backdrop-blur-xl">
            <p className="text-lg font-semibold text-text-primary">
              Supabase no está configurado.
            </p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Esta ruta necesita acceso a Supabase para mostrar el local y su
              menú.
            </p>
          </section>
        </main>
      </div>
    );
  }

  const venue = await getVenueDetails(params.citySlug, params.venueSlug);

  if (!venue) {
    notFound();
  }

  const groupedItems = venue.menuItems.reduce<
    Record<string, typeof venue.menuItems>
  >((accumulator, item) => {
    const key = item.categoryName ?? "Menú";
    accumulator[key] ??= [];
    accumulator[key].push(item);
    return accumulator;
  }, {});
  const menuSections = Object.entries(groupedItems);
  const totalMenuItems = venue.menuItems.length;

  const cartVenue = {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    citySlug: venue.city.slug,
    cityName: venue.city.name,
    address: venue.address,
    coverUrl: venue.coverUrl,
    email: venue.email,
    phone: venue.phone,
    pickupEtaMin: venue.pickupEtaMin,
  };
  const mapsHref = venue.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        venue.address,
      )}`
    : null;
  const websiteHref = venue.website
    ? venue.website.startsWith("http")
      ? venue.website
      : `https://${venue.website}`
    : null;

  return (
    <div className="min-h-screen bg-page text-text-primary">
      <SiteHeader />
      <CityPreferenceSync
        city={{ slug: venue.city.slug, name: venue.city.name }}
      />
      <VenueViewTracker
        citySlug={venue.city.slug}
        cityName={venue.city.name}
        venueSlug={venue.slug}
        venueName={venue.name}
      />

      <main>
        <section className="relative -mt-[5.4rem] overflow-hidden bg-[var(--overlay-hero-to)] pt-[5.4rem] text-text-inverse">
          <div
            className="absolute inset-0 scale-[1.04] bg-cover bg-center"
            style={{
              backgroundImage: venue.coverUrl
                ? `url(${venue.coverUrl})`
                : "linear-gradient(135deg, var(--brand-accent-soft), var(--overlay-hero-to))",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--brand-accent-soft),transparent_24%),linear-gradient(90deg,rgba(5,8,22,0.88)_0%,rgba(5,8,22,0.74)_36%,rgba(5,8,22,0.22)_68%,transparent_100%),linear-gradient(180deg,rgba(5,8,22,0.08)_0%,rgba(5,8,22,0.34)_50%,rgba(5,8,22,0.9)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(78svh-1rem)] w-full max-w-7xl flex-col justify-end px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12">
            <div className="max-w-4xl">
              <Link
                href={`/zonas/${venue.city.slug}`}
                className="inline-flex w-fit text-xs font-semibold uppercase tracking-[0.2em] text-text-inverse/60 transition hover:text-text-inverse"
              >
                Volver a {venue.city.name}
              </Link>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.045] px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-text-inverse/75 backdrop-blur-xl">
                  {venue.city.name}
                </span>
                <span className="rounded-full border border-text-inverse/10 bg-text-inverse/[0.045] px-4 py-2 text-xs font-medium text-text-inverse/75 backdrop-blur-xl">
                  {venue.pickupEtaMin
                    ? `${venue.pickupEtaMin} min recogida`
                    : "Recogida disponible"}
                </span>
                <span
                  className={`rounded-full border border-text-inverse/10 px-4 py-2 text-xs font-medium backdrop-blur-xl ${
                    venue.isOpenNow
                      ? "bg-accent-soft text-text-inverse"
                      : "bg-text-inverse/[0.045] text-text-inverse/75"
                  }`}
                >
                  {venue.isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-4">
                <h1 className="max-w-[13ch] text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
                  Qué pedir en {venue.name}
                </h1>
                <VerifiedVenueBadge
                  isVerified={venue.isVerified}
                  subscriptionActive={venue.subscriptionActive}
                  withLabel
                />
              </div>

              <p className="mt-6 max-w-[50rem] text-base leading-7 text-text-inverse/75 sm:text-lg sm:leading-8">
                {venue.description}
              </p>

              <p className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-text-inverse/60">
                <WalkIcon size={18} className="text-accent-bright" />
                Carta visual con {totalMenuItems} platos seleccionados.
              </p>
              <p className="mt-4 max-w-[46rem] text-sm leading-6 text-text-inverse/62">
                Descubre qué pedir en {venue.name}. Explora platos, precios y
                opciones de recogida rápida en {venue.city.name} sin dar vueltas.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-page text-text-primary">
          <div className="mx-auto w-full max-w-[96rem] px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="space-y-12">
              {menuSections.map(([categoryName, items]) => (
                <section key={categoryName}>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent-strong">
                        Carta
                      </p>
                      <h2 className="mt-3 max-w-[13ch] text-[clamp(1.9rem,3.4vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-text-primary">
                        {categoryName}
                      </h2>
                    </div>
                    <span className="rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-xs font-semibold text-text-muted">
                      {items.length} platos
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3">
                    {items.map((item) => (
                      <MenuItemGalleryCard
                        key={item.id}
                        item={item}
                        venue={cartVenue}
                        anchorId={`plato-${item.id}`}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 grid gap-3 lg:grid-cols-4">
              <VenueCartSummary venueId={venue.id} />
              <VenueArrivalCard
                venueSlug={venue.slug}
                venueName={venue.name}
                address={venue.address}
                latitude={venue.latitude}
                longitude={venue.longitude}
              />
              <VenueOpeningHours
                openingHours={venue.openingHours}
                isOpenNow={venue.isOpenNow}
              />

              <aside className="rounded-[1.2rem] border border-accent/45 bg-surface p-5 shadow-[var(--shadow-soft)] ring-1 ring-accent-soft">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">
                  Información del local
                </p>
                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                      <MapIcon size={17} className="text-icon-highlight" />
                      Dirección
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-text-secondary">
                      {mapsHref ? (
                        <a
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {venue.address}
                        </a>
                      ) : (
                        "Dirección pendiente"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                      <ClockIcon size={17} className="text-icon-highlight" />
                      Recogida
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-text-secondary">
                      {venue.pickupNotes ?? "Indicaciones pendientes"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                      <PhoneIcon size={17} className="text-icon-highlight" />
                      Teléfono
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-text-secondary">
                      {venue.phone ? (
                        <a href={`tel:${venue.phone}`}>{venue.phone}</a>
                      ) : (
                        "Teléfono pendiente"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                      <MapIcon size={17} className="text-icon-highlight" />
                      Email
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-text-secondary">
                      {venue.email ? (
                        <a href={`mailto:${venue.email}`}>{venue.email}</a>
                      ) : (
                        "Email pendiente"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                      <MapIcon size={17} className="text-icon-highlight" />
                      Enlaces
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-text-secondary">
                      {websiteHref ? (
                        <a
                          href={websiteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {venue.website}
                        </a>
                      ) : (
                        "Enlaces pendientes"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                      <LocationPinIcon
                        size={17}
                        className="text-icon-highlight"
                      />
                      Zona
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-text-secondary">
                      {venue.city.name}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <ZylenPickFooter />
    </div>
  );
}
