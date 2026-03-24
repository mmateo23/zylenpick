import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { SiteShell } from "@/components/layout/site-shell";
import {
  getCityBySlug,
  getVenueDetails,
  getVenuesByCitySlug,
} from "@/features/venues/services/venues-service";
import { formatPrice } from "@/lib/utils/currency";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const revalidate = 1800;

type DemoCityDishesPageProps = {
  params: {
    citySlug: string;
  };
  searchParams?: {
    category?: string;
  };
};

export default async function DemoCityDishesPage({
  params,
  searchParams,
}: DemoCityDishesPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            Supabase no está configurado.
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Esta ruta necesita acceso a Supabase para mostrar platos reales.
          </p>
        </section>
      </SiteShell>
    );
  }

  const city = await getCityBySlug(params.citySlug);

  if (!city) {
    notFound();
  }

  const venues = await getVenuesByCitySlug(params.citySlug);
  const venueDetails = await Promise.all(
    venues.map((venue) => getVenueDetails(params.citySlug, venue.slug)),
  );

  const dishes = venueDetails
    .filter((venue): venue is NonNullable<typeof venue> => Boolean(venue))
    .flatMap((venue) =>
      venue.menuItems
        .filter((item) => Boolean(item.imageUrl))
        .map((item) => ({
          id: item.id,
          name: item.name,
          priceAmount: item.priceAmount,
          currency: item.currency,
          imageUrl: item.imageUrl as string,
          categoryName: item.categoryName,
          venue: {
            slug: venue.slug,
            name: venue.name,
          },
        })),
    );

  const categories = Array.from(
    new Set(
      dishes
        .map((dish) => dish.categoryName?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  );

  const selectedCategory =
    searchParams?.category && categories.includes(searchParams.category)
      ? searchParams.category
      : "Todas";

  const filteredDishes =
    selectedCategory === "Todas"
      ? dishes
      : dishes.filter((dish) => dish.categoryName === selectedCategory);

  return (
    <SiteShell>
      <CityPreferenceSync city={{ slug: city.slug, name: city.name }} />

      <section className="max-w-4xl pt-2 sm:pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--brand)]">
          Déjate llevar por los ojos en
        </p>
        <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.94] text-[color:var(--foreground)] sm:text-6xl">
          {city.name}
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-8 text-[color:var(--muted-strong)]">
          Una vista más visual para descubrir platos que apetece pedir.
        </p>
      </section>

      <div className="mt-8 flex justify-end sm:mt-10">
        <Link
          href={`/demo/cities/${city.slug}`}
          className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-[color:var(--surface-dark-soft)]"
        >
          Volver a la demo de ciudad
        </Link>
      </div>

      {dishes.length > 0 ? (
        <>
          <section className="mt-10">
            <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <div className="flex min-w-max gap-3">
                {["Todas", ...categories].map((category) => {
                  const isActive = selectedCategory === category;

                  return (
                    <Link
                      key={category}
                      href={
                        category === "Todas"
                          ? `/demo/cities/${city.slug}/platos`
                          : `/demo/cities/${city.slug}/platos?category=${encodeURIComponent(category)}`
                      }
                      className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-[color:var(--brand)] text-white shadow-[var(--card-shadow)]"
                          : "border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--muted-strong)]"
                      }`}
                    >
                      {category}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDishes.map((dish) => (
            <Link
              key={dish.id}
              href={`/cities/${city.slug}/venues/${dish.venue.slug}`}
              className="hover-lift-card group overflow-hidden rounded-[2rem] border border-white/10 bg-[color:var(--surface)] shadow-[var(--soft-shadow)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={dish.imageUrl}
                  alt={dish.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,7,0.06),rgba(5,8,7,0.28)_42%,rgba(5,8,7,0.82))]" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                  <p className="text-sm text-white/72">{dish.venue.name}</p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">
                    {dish.name}
                  </h2>
                  {dish.categoryName ? (
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/62">
                      {dish.categoryName}
                    </p>
                  ) : null}
                  <p className="mt-3 text-base font-medium text-white/92">
                    {formatPrice(dish.priceAmount, dish.currency)}
                  </p>
                </div>
              </div>
            </Link>
            ))}
          </section>
        </>
      ) : (
        <section className="mt-10 rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            Todavía no hay platos disponibles para mostrar aquí.
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Cuando los locales tengan imágenes activas en su carta, esta vista
            visual se llenará automáticamente.
          </p>
        </section>
      )}
    </SiteShell>
  );
}
