import type { Metadata } from "next";
import { Clock3, MapPinned, Utensils } from "lucide-react";
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
import { VenueOpeningStatusBadge } from "@/components/venues/venue-opening-status-badge";
import { VerifiedVenueBadge } from "@/components/venues/verified-venue-badge";
import { VenueCartSummary } from "@/features/cart/components/venue-cart-summary";
import { getOpeningStatus } from "@/features/venues/opening-hours";
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
        "Descubre qué prepara este local, consulta cuándo abre y encuentra cómo llegar para recoger.",
      path: `/zonas/${params.citySlug}/venues/${params.venueSlug}`,
    });
  }

  return getBaseMetadata({
    title: `${venue.name} en ${venue.city.name}: qué probar y cómo recoger`,
    description: `Descubre qué prepara ${venue.name}, consulta su horario y encuentra cómo llegar para recoger en ${venue.city.name}.`,
    path: `/zonas/${venue.city.slug}/venues/${venue.slug}`,
    image: venue.coverUrl ?? venue.logoUrl ?? "/icons/pickyalo-app.svg?v=1",
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

  const openingStatus = getOpeningStatus(venue.openingHours);

  const menuCategoryCounts = venue.menuItems.reduce<Record<string, number>>(
    (accumulator, item) => {
      const key = item.categoryName ?? "Otros";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    },
    {},
  );
  const menuCategories = Object.entries(menuCategoryCounts);
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
        pricesVisible={venue.pricesVisible}
        items={venue.menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          priceAmount: item.priceAmount,
          currency: item.currency,
          priceDisplayMode: item.priceDisplayMode,
          priceDisplayText: item.priceDisplayText,
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

          <div className="relative z-10 mx-auto flex min-h-[34rem] w-full max-w-7xl flex-col justify-end px-5 pb-8 pt-24 sm:min-h-[38rem] sm:px-8 sm:pb-10 lg:min-h-[42rem] lg:px-12">
            <div className="max-w-4xl">
              <Link
                href={`/zonas/${venue.city.slug}`}
                className="inline-flex w-fit text-xs font-semibold uppercase tracking-[0.2em] text-[#741314]/72 transition hover:text-[#741314]"
              >
                Volver a {venue.city.name}
              </Link>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-[#741314]/16 bg-[#FFF7E8]/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#741314] backdrop-blur-xl">
                  {venue.city.name}
                </span>
                <span className="rounded-full border border-[#741314]/16 bg-[#FFF7E8]/82 px-4 py-2 text-xs font-semibold text-[#741314] backdrop-blur-xl">
                  {venue.pickupEtaMin
                    ? `Listo en unos ${venue.pickupEtaMin} min`
                    : "Para recoger"}
                </span>
                <VenueOpeningStatusBadge
                  openingHours={venue.openingHours}
                  initialStatus={openingStatus}
                  compact
                />
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3 sm:gap-4">
                <h1 className="max-w-[14ch] text-balance text-[clamp(2.55rem,6vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
                  {venue.name}
                </h1>
                <VerifiedVenueBadge
                  isVerified={venue.isVerified}
                  subscriptionActive={venue.subscriptionActive}
                  withLabel
                />
              </div>

              <p className="mt-5 max-w-[48rem] text-base leading-7 text-[#24110E]/78 sm:text-lg sm:leading-8">
                {venue.description}
              </p>

              <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#741314]">
                <WalkIcon size={18} className="text-[#741314]" />
                {totalMenuItems > 0
                  ? `${totalMenuItems} ${totalMenuItems === 1 ? "opción" : "opciones"} para elegir sin dar vueltas.`
                  : "Pronto podrás descubrir qué prepara este local."}
              </p>
              <p className="mt-3 hidden max-w-[46rem] text-sm leading-6 text-[#24110E]/68 sm:block">
                Mira qué prepara el local, comprueba cuándo abre y organiza tu recogida en {venue.city.name}.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-page text-text-primary">
          <div className="mx-auto w-full max-w-[96rem] px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
            <nav
              aria-label="Contenido del local"
              className="mb-6 flex flex-wrap gap-2 rounded-[1.1rem] border border-[#741314]/14 bg-[#FFF7E8] p-2 shadow-[var(--shadow-soft)] sm:mb-8 sm:w-fit"
            >
              <a
                href="#informacion"
                className="inline-flex min-h-12 flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-[0.85rem] bg-[#741314] px-2 text-[11px] font-bold leading-none text-[#FDE3AD] outline-none transition hover:bg-[#5F0F10] focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 sm:min-h-11 sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
              >
                <MapPinned aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" strokeWidth={2.25} />
                Antes de ir
              </a>
              <a
                href="#seleccion"
                className="inline-flex min-h-12 flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-[0.85rem] px-2 text-[11px] font-bold leading-none text-[#741314] outline-none transition hover:bg-[#741314]/8 focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 sm:min-h-11 sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
              >
                <Utensils aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" strokeWidth={2.25} />
                Qué elegir
              </a>
              <a
                href="#horarios"
                className="inline-flex min-h-12 flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-[0.85rem] px-2 text-[11px] font-bold leading-none text-[#741314] outline-none transition hover:bg-[#741314]/8 focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 sm:min-h-11 sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
              >
                <Clock3 aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" strokeWidth={2.25} />
                Horario
              </a>
            </nav>

            <div className="mb-8 scroll-mt-28 sm:mb-10">
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
                openingHours={venue.openingHours}
                openingStatus={openingStatus}
              />
            </div>

            <section id="seleccion" className="scroll-mt-28" aria-labelledby="venue-selection-title">
              <div className="mb-6 grid gap-5 border-b border-border-subtle pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent-strong">
                    Para recoger
                  </p>
                  <h2
                    id="venue-selection-title"
                    className="mt-3 text-[clamp(1.9rem,3.4vw,3.35rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-text-primary"
                  >
                    Elige lo que te apetece.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
                    Pocas opciones, bien explicadas, para decidir rápido.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
                  {menuCategories.map(([categoryName, count]) => (
                    <span
                      key={categoryName}
                      className="inline-flex items-center gap-2 rounded-full border border-[#741314]/20 bg-[#FFF7E8] px-3 py-2 text-xs font-semibold text-[#741314]"
                    >
                      {categoryName}
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#741314] px-1.5 py-0.5 text-[10px] font-bold text-[#FDE3AD]">
                        {count}
                      </span>
                    </span>
                  ))}
                  <span className="inline-flex items-center rounded-full border border-border-subtle bg-surface-muted px-3 py-2 text-xs font-semibold text-text-muted">
                    {totalMenuItems} {totalMenuItems === 1 ? "opción" : "opciones"}
                  </span>
                </div>
              </div>

              {venue.menuItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 lg:gap-4 xl:grid-cols-3">
                  {venue.menuItems.map((item, index) => (
                    <div key={item.id} className={index === 0 ? "col-span-2 sm:col-span-1" : "col-span-1"}>
                      <MenuItemGalleryCard
                        item={item}
                        venue={cartVenue}
                        anchorId={`plato-${item.id}`}
                        variant="venueCompact"
                        labels={{ viewDetail: "Ver", addForPickup: "Añadir" }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-[#741314]/14 bg-[#FFF7E8] p-6 text-[#381932] sm:p-8">
                  <p className="text-xl font-semibold">El escaparate de este local se está preparando.</p>
                  <p className="mt-2 text-sm leading-6 text-[#381932]/68">
                    Vuelve pronto para descubrir qué podrás recoger aquí.
                  </p>
                </div>
              )}
            </section>

            <div className="mt-12 grid gap-3 lg:grid-cols-2">
              <VenueCartSummary venueId={venue.id} />
              <VenueOpeningHours
                openingHours={venue.openingHours}
                openingStatus={openingStatus}
              />
            </div>
          </div>
        </section>
      </main>
      <ZylenPickFooter />
    </div>
  );
}
