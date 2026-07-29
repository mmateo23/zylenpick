import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WalkIcon } from "@/components/icons/walk-icon";
import { PlatoHashViewTracker } from "@/components/analytics/plato-hash-view-tracker";
import { VenueViewTracker } from "@/components/analytics/venue-view-tracker";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { VenueLocalStructuredData } from "@/components/seo/local-seo-structured-data";
import { MenuItemGalleryCard } from "@/components/venues/menu-item-gallery-card";
import { VenueLocalInformation } from "@/components/venues/venue-local-information";
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
      title: "Local cercano",
      description:
        "Consulta información del local, su selección visual, tiempos de recogida y productos disponibles.",
      path: `/zonas/${params.citySlug}/venues/${params.venueSlug}`,
    });
  }

  return getBaseMetadata({
    title: `${venue.name} en ${venue.city.name}: selección y recogida`,
    description: `Descubre la selección de comida, productos y platos de ${venue.name} en ${venue.city.name}. Consulta opciones y recoge en el local.`,
    path: `/zonas/${venue.city.slug}/venues/${venue.slug}`,
    image: venue.coverUrl ?? venue.logoUrl ?? "/logo/LogoNuevo.svg?v=1",
  });
}

export default async function VenuePage({ params }: VenuePageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="public-light-theme min-h-screen bg-page text-text-primary">
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
    pricesVisible: venue.pricesVisible,
  };
  return (
    <div className="public-light-theme min-h-screen bg-page text-text-primary">
      <SiteHeader />
      <CityPreferenceSync
        city={{ slug: venue.city.slug, name: venue.city.name }}
      />
      <VenueLocalStructuredData venue={venue} />
      <VenueViewTracker
        citySlug={venue.city.slug}
        cityName={venue.city.name}
        venueId={venue.id}
        venueSlug={venue.slug}
        venueName={venue.name}
      />
      <PlatoHashViewTracker
        citySlug={venue.city.slug}
        venueId={venue.id}
        venueSlug={venue.slug}
        venueName={venue.name}
        items={venue.menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          priceAmount: item.priceAmount,
          currency: item.currency,
          categoryName: item.categoryName,
        }))}
      />

      <main>
        <section className="relative -mt-[5.4rem] overflow-hidden bg-[#FDE3AD] pt-[5.4rem] text-[#24110E]">
          <div
            className="absolute inset-0 scale-[1.04] bg-cover bg-center"
            style={{
              backgroundImage: venue.coverUrl
                ? `url(${venue.coverUrl})`
                : "linear-gradient(135deg, rgba(116,19,20,0.10), #FDE3AD)",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(116,19,20,0.10),transparent_24%),linear-gradient(90deg,rgba(253,227,173,0.95)_0%,rgba(253,227,173,0.76)_36%,rgba(255,247,232,0.32)_68%,transparent_100%),linear-gradient(180deg,rgba(253,227,173,0.12)_0%,rgba(253,227,173,0.28)_50%,rgba(253,227,173,0.86)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(78svh-1rem)] w-full max-w-7xl flex-col justify-end px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12">
            <div className="max-w-4xl">
              <Link
                href={`/zonas/${venue.city.slug}`}
                className="inline-flex w-fit text-xs font-semibold uppercase tracking-[0.2em] text-[#741314]/72 transition hover:text-[#741314]"
              >
                Volver a {venue.city.name}
              </Link>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#741314]/16 bg-[#FFF7E8]/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#741314] backdrop-blur-xl">
                  {venue.city.name}
                </span>
                <span className="rounded-full border border-[#741314]/16 bg-[#FFF7E8]/82 px-4 py-2 text-xs font-semibold text-[#741314] backdrop-blur-xl">
                  {venue.pickupEtaMin
                    ? `${venue.pickupEtaMin} min recogida`
                    : "Recogida disponible"}
                </span>
                <span
                  className={`rounded-full border border-[#741314]/16 px-4 py-2 text-xs font-semibold backdrop-blur-xl ${
                    venue.isOpenNow
                      ? "bg-[#741314] text-[#FDE3AD]"
                      : "bg-[#FFF7E8]/82 text-[#741314]"
                  }`}
                >
                  {venue.isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-4">
                <h1 className="max-w-[13ch] text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
                  Selección de {venue.name}
                </h1>
                <VerifiedVenueBadge
                  isVerified={venue.isVerified}
                  subscriptionActive={venue.subscriptionActive}
                  withLabel
                />
              </div>

              <p className="mt-6 max-w-[50rem] text-base leading-7 text-[#24110E]/76 sm:text-lg sm:leading-8">
                {venue.description}
              </p>

              <p className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#741314]">
                <WalkIcon size={18} className="text-[#741314]" />
                Selección visual con {totalMenuItems} productos y platos destacados.
              </p>
              <p className="mt-4 max-w-[46rem] text-sm leading-6 text-[#24110E]/68">
                Descubre la selección de {venue.name}. Explora productos,
                platos, precios y opciones de recogida rápida en {venue.city.name} sin dar vueltas.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-page text-text-primary">
          <div className="mx-auto w-full max-w-[96rem] px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="mb-12">
              <VenueLocalInformation
                venueSlug={venue.slug}
                venueName={venue.name}
                cityName={venue.city.name}
                address={venue.address}
                phone={venue.phone}
                email={venue.email}
                website={venue.website}
                pickupNotes={venue.pickupNotes}
                pickupEtaMin={venue.pickupEtaMin}
                latitude={venue.latitude}
                longitude={venue.longitude}
                isOpenNow={venue.isOpenNow}
              />
            </div>

            <div className="space-y-12">
              {menuSections.map(([categoryName, items]) => (
                <section key={categoryName}>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent-strong">
                        Selección
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

            <div className="mt-12 grid gap-3 lg:grid-cols-2">
              <VenueCartSummary venueId={venue.id} />
              <VenueOpeningHours
                openingHours={venue.openingHours}
                isOpenNow={venue.isOpenNow}
              />
            </div>
          </div>
        </section>
      </main>
      <ZylenPickFooter />
    </div>
  );
}
