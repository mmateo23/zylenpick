import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { MapIcon } from "@/components/icons/map-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { WalkIcon } from "@/components/icons/walk-icon";
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
    title: `${venue.name} en ${venue.city.name}`,
    description: `${venue.name} en ${venue.city.name}. Consulta carta, tiempos de recogida, dirección y platos disponibles para pedir localmente.`,
    path: `/zonas/${venue.city.slug}/venues/${venue.slug}`,
    image: venue.coverUrl ?? venue.logoUrl ?? "/logo/ZylenPick_LOGO.png?v=1",
  });
}

export default async function VenuePage({ params }: VenuePageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
          <section className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.04] p-8 shadow-[var(--soft-shadow)] backdrop-blur-xl">
            <p className="text-lg font-semibold text-white">
              Supabase no está configurado.
            </p>
            <p className="mt-3 text-sm leading-6 text-white/60">
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

  const groupedItems = venue.menuItems.reduce<Record<string, typeof venue.menuItems>>(
    (accumulator, item) => {
      const key = item.categoryName ?? "Menú";
      accumulator[key] ??= [];
      accumulator[key].push(item);
      return accumulator;
    },
    {},
  );
  const menuSections = Object.entries(groupedItems);
  const totalMenuItems = venue.menuItems.length;

  const cartVenue = {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    citySlug: venue.city.slug,
    cityName: venue.city.name,
    address: venue.address,
    email: venue.email,
    phone: venue.phone,
    pickupEtaMin: venue.pickupEtaMin,
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <SiteHeader />
      <CityPreferenceSync city={{ slug: venue.city.slug, name: venue.city.name }} />

      <main>
        <section className="relative -mt-[5.4rem] overflow-hidden bg-[#050816] pt-[5.4rem]">
          <div
            className="absolute inset-0 scale-[1.04] bg-cover bg-center"
            style={{
              backgroundImage: venue.coverUrl
                ? `url(${venue.coverUrl})`
                : "linear-gradient(135deg, rgba(31, 138, 112, 0.74), rgba(15, 22, 20, 0.92))",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,223,129,0.12),transparent_26%),linear-gradient(90deg,rgba(5,8,7,0.9)_0%,rgba(5,8,7,0.62)_46%,rgba(5,8,7,0.2)_100%),linear-gradient(180deg,rgba(5,8,7,0.1)_0%,rgba(5,8,7,0.86)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(78svh-1rem)] w-full max-w-7xl flex-col justify-end px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12">
            <div className="max-w-4xl">
              <Link
                href={`/zonas/${venue.city.slug}`}
                className="inline-flex w-fit text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
              >
                Volver a {venue.city.name}
              </Link>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/75 backdrop-blur-xl">
                  {venue.city.name}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium text-white/75 backdrop-blur-xl">
                  {venue.pickupEtaMin
                    ? `${venue.pickupEtaMin} min recogida`
                    : "Recogida disponible"}
                </span>
                <span
                  className={`rounded-full border border-white/10 px-4 py-2 text-xs font-medium backdrop-blur-xl ${
                    venue.isOpenNow
                      ? "bg-[color:var(--brand)]/20 text-white"
                      : "bg-white/[0.045] text-white/75"
                  }`}
                >
                  {venue.isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-4">
                <h1 className="max-w-[13ch] text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
                  {venue.name}
                </h1>
                <VerifiedVenueBadge
                  isVerified={venue.isVerified}
                  subscriptionActive={venue.subscriptionActive}
                  withLabel
                />
              </div>

              <p className="mt-6 max-w-[50rem] text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                {venue.description}
              </p>

              <p className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white/60">
                <WalkIcon size={18} className="text-[color:var(--accent)]" />
                Carta visual con {totalMenuItems} platos seleccionados.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#f4f0e8] text-[#10130f]">
          <div className="mx-auto w-full max-w-[96rem] px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="space-y-12">
              {menuSections.map(([categoryName, items]) => (
                <section key={categoryName}>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#1f8a70]">
                        Carta
                      </p>
                      <h2 className="mt-3 max-w-[13ch] text-[clamp(1.9rem,3.4vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-[#10130f]">
                        {categoryName}
                      </h2>
                    </div>
                    <span className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-semibold text-black/50">
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
              />
              <VenueOpeningHours
                openingHours={venue.openingHours}
                isOpenNow={venue.isOpenNow}
              />

              <aside className="rounded-[1.2rem] border border-black/10 bg-white/70 p-5 shadow-[0_16px_44px_rgba(31,36,28,0.08)]">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/40">
                  Información del local
                </p>
                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-black/40">
                      <MapIcon size={17} className="text-[#1f8a70]" />
                      Dirección
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-black/70">
                      {venue.address ?? "Dirección pendiente"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-black/40">
                      <ClockIcon size={17} className="text-[#1f8a70]" />
                      Recogida
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-black/70">
                      {venue.pickupNotes ?? "Indicaciones pendientes"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-black/40">
                      <PhoneIcon size={17} className="text-[#1f8a70]" />
                      Teléfono
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-black/70">
                      {venue.phone ?? "Teléfono pendiente"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-black/40">
                      <LocationPinIcon size={17} className="text-[#1f8a70]" />
                      Zona
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-black/70">
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
