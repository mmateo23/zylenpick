import Link from "next/link";
import { notFound } from "next/navigation";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { MapIcon } from "@/components/icons/map-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { WalkIcon } from "@/components/icons/walk-icon";
import { SiteShell } from "@/components/layout/site-shell";
import { VenueArrivalCard } from "@/components/venues/venue-arrival-card";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { VenueCartSummary } from "@/features/cart/components/venue-cart-summary";
import { getVenueDetails } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatPrice } from "@/lib/utils/currency";

type VenuePageProps = {
  params: {
    citySlug: string;
    venueSlug: string;
  };
};

export default async function VenuePage({ params }: VenuePageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            Supabase no está configurado.
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Esta ruta necesita acceso a Supabase para mostrar el local y su
            menú.
          </p>
        </section>
      </SiteShell>
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

  const cartVenue = {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    citySlug: venue.city.slug,
    cityName: venue.city.name,
    address: venue.address,
    pickupEtaMin: venue.pickupEtaMin,
  };

  return (
    <SiteShell>
      <CityPreferenceSync
        city={{ slug: venue.city.slug, name: venue.city.name }}
      />
      <section
        className="editorial-card overflow-hidden rounded-[2.8rem] border border-white/28 px-8 py-10 text-white shadow-[var(--shadow)] sm:px-10 sm:py-12"
        style={{
          backgroundImage: venue.coverUrl
            ? `linear-gradient(180deg, rgba(18, 12, 10, 0.38), rgba(18, 12, 10, 0.86)), url(${venue.coverUrl})`
            : "linear-gradient(135deg, rgba(224, 171, 87, 0.48), rgba(213, 90, 50, 0.6))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Link
          href={`/cities/${venue.city.slug}`}
          className="inline-flex w-fit rounded-full border border-white/16 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur"
        >
          Volver a {venue.city.name}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/76 backdrop-blur">
            {venue.city.name}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-medium text-white/72 backdrop-blur">
            <ClockIcon size={16} />
            Recogida en {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "breve"}
          </span>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <div>
            <h1 className="max-w-[10ch] text-balance text-5xl font-semibold leading-[0.9] sm:text-6xl lg:text-7xl">
              {venue.name}
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg leading-8 text-white/82">
              {venue.description}
            </p>
          </div>

          <div className="rounded-[2.2rem] border border-white/16 bg-white/10 p-6 text-white backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/62">
              Recogida
            </p>
            <p className="mt-4 inline-flex items-center gap-3 text-4xl font-semibold">
              <WalkIcon size={24} className="text-[color:var(--accent)]" />
              {venue.pickupEtaMin ? `${venue.pickupEtaMin} min` : "Disponible"}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/76">
              Un local preparado para decidir rápido, guardar platos y pasar a
              recoger sin complicaciones.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-10">
          {Object.entries(groupedItems).map(([categoryName, items]) => (
            <section key={categoryName}>
              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
                  Carta
                </p>
                <h2 className="mt-3 text-4xl font-semibold text-[color:var(--foreground)]">
                  {categoryName}
                </h2>
              </div>

              <div className="grid gap-7 lg:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="editorial-card overflow-hidden rounded-[2.4rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--soft-shadow)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)]"
                  >
                    <div
                      className="min-h-[22rem] bg-cover bg-center"
                      style={{
                        backgroundImage: item.imageUrl
                          ? `linear-gradient(180deg, rgba(24, 18, 14, 0.16), rgba(24, 18, 14, 0.4)), url(${item.imageUrl})`
                          : "linear-gradient(180deg, rgba(224, 171, 87, 0.35), rgba(213, 90, 50, 0.35))",
                      }}
                    />
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
                      <AddToCartButton
                        venue={cartVenue}
                        item={{
                          id: item.id,
                          name: item.name,
                          description: item.description,
                          priceAmount: item.priceAmount,
                          currency: item.currency,
                          imageUrl: item.imageUrl,
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <VenueCartSummary venueId={venue.id} />
          <VenueArrivalCard
            venueSlug={venue.slug}
            venueName={venue.name}
            address={venue.address}
          />

          <aside className="glass-panel rounded-[2.3rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
              Información del local
            </p>
            <dl className="mt-6 space-y-6">
              <div>
                <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  <MapIcon size={18} className="text-[color:var(--brand)]" />
                  Dirección
                </dt>
                <dd className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">
                  {venue.address ?? "Dirección pendiente"}
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  <ClockIcon size={18} className="text-[color:var(--brand)]" />
                  Recogida
                </dt>
                <dd className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">
                  {venue.pickupNotes ?? "Indicaciones pendientes"}
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  <PhoneIcon size={18} className="text-[color:var(--brand)]" />
                  Correo
                </dt>
                <dd className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">
                  {venue.email ?? "Correo pendiente"}
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  <LocationPinIcon
                    size={18}
                    className="text-[color:var(--brand)]"
                  />
                  Zona
                </dt>
                <dd className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">
                  {venue.city.name}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
