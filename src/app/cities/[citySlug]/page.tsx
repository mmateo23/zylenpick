import Link from "next/link";
import { notFound } from "next/navigation";

import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { SiteShell } from "@/components/layout/site-shell";
import { ZoneVenueExplorer } from "@/components/venues/zone-venue-explorer";
import { isFeaturedVenue } from "@/features/venues/venue-meta";
import {
  getCityBySlug,
  getVenuesByCitySlug,
} from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type CityVenuesPageProps = {
  params: {
    citySlug: string;
  };
};

export default async function CityVenuesPage({
  params,
}: CityVenuesPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            Supabase no está configurado.
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Esta ruta necesita acceso a Supabase para mostrar locales reales.
          </p>
        </section>
      </SiteShell>
    );
  }

  const [city, venues] = await Promise.all([
    getCityBySlug(params.citySlug),
    getVenuesByCitySlug(params.citySlug),
  ]);

  if (!city) {
    notFound();
  }

  const featuredVenue = venues.find((venue) => isFeaturedVenue(venue.slug)) ?? null;

  return (
    <SiteShell>
      <CityPreferenceSync city={{ slug: city.slug, name: city.name }} />
      <section className="max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--brand)]">
          {city.region ?? "Zona"}
        </p>
        <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.94] text-[color:var(--foreground)] sm:text-6xl">
          {city.name}
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-8 text-[color:var(--muted-strong)]">
          Explora locales por categorías visuales y entra más rápido en lo que
          te apetece pedir.
        </p>
      </section>

      <div className="mt-10 flex justify-end">
        <Link
          href="/cities"
          className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-[color:var(--surface-dark-soft)]"
        >
          Cambiar zona
        </Link>
      </div>

      {venues.length > 0 ? (
        <ZoneVenueExplorer
          citySlug={city.slug}
          featuredVenue={featuredVenue}
          venues={venues}
        />
      ) : (
        <section className="mt-10 rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            Todavía no hay locales disponibles.
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Esta zona ya está preparada, pero todavía no tiene locales activos
            conectados.
          </p>
        </section>
      )}
    </SiteShell>
  );
}
