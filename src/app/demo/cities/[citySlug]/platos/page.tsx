import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FeaturedBadgeIcon } from "@/components/icons/featured-badge-icon";
import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { SiteShell } from "@/components/layout/site-shell";
import { BorderBeam } from "@/components/magicui/border-beam";
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
    view?: string;
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
          isFeatured: item.isFeatured,
          isPickupMonthHighlight: item.isPickupMonthHighlight,
          venue: {
            slug: venue.slug,
            name: venue.name,
            address: venue.address,
            pickupEtaMin: venue.pickupEtaMin,
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
  const selectedView = searchParams?.view === "mosaic" ? "mosaic" : "cards";

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
          href={`/zonas/${city.slug}`}
          className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] transition hover:bg-[color:var(--surface-dark-soft)]"
        >
          Volver a la demo de ciudad
        </Link>
      </div>

      {dishes.length > 0 ? (
        <>
          <section className="mt-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                <div className="flex min-w-max gap-3">
                  {["Todas", ...categories].map((category) => {
                    const isActive = selectedCategory === category;
                    const categoryQuery =
                      category === "Todas"
                        ? `view=${selectedView}`
                        : `category=${encodeURIComponent(category)}&view=${selectedView}`;

                    return (
                      <Link
                        key={category}
                        href={`/platos?${categoryQuery}`}
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

              <div className="flex justify-end">
                <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1 shadow-[var(--card-shadow)]">
                  <Link
                    href={
                      selectedCategory === "Todas"
                        ? `/platos?view=cards`
                        : `/platos?category=${encodeURIComponent(selectedCategory)}&view=cards`
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedView === "cards"
                        ? "bg-[color:var(--brand)] text-white"
                        : "text-[color:var(--muted-strong)]"
                    }`}
                  >
                    Cards
                  </Link>
                  <Link
                    href={
                      selectedCategory === "Todas"
                        ? `/platos?view=mosaic`
                        : `/platos?category=${encodeURIComponent(selectedCategory)}&view=mosaic`
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedView === "mosaic"
                        ? "bg-[color:var(--brand)] text-white"
                        : "text-[color:var(--muted-strong)]"
                    }`}
                  >
                    Mosaico
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`mt-8 grid ${
              selectedView === "mosaic"
                ? "grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                : "grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {filteredDishes.map((dish, index) => (
              (() => {
                const highlightClassName = dish.isPickupMonthHighlight
                  ? "border-[rgba(31,138,112,0.5)] shadow-[0_0_0_1px_rgba(31,138,112,0.24),0_18px_44px_rgba(31,138,112,0.18)] transition-[box-shadow,border-color,transform] duration-300 group-hover:border-[rgba(31,138,112,0.76)] group-hover:shadow-[0_0_0_1px_rgba(31,138,112,0.3),0_0_32px_rgba(31,138,112,0.24),0_22px_56px_rgba(31,138,112,0.26)]"
                  : dish.isFeatured
                    ? "border-[rgba(214,166,72,0.48)] shadow-[0_0_0_1px_rgba(214,166,72,0.22),0_18px_44px_rgba(214,166,72,0.16)] transition-[box-shadow,border-color,transform] duration-300 group-hover:border-[rgba(214,166,72,0.74)] group-hover:shadow-[0_0_0_1px_rgba(214,166,72,0.3),0_0_28px_rgba(214,166,72,0.2),0_22px_56px_rgba(214,166,72,0.24)]"
                    : "border-[color:var(--border)] shadow-[var(--soft-shadow)] transition-[box-shadow,border-color,transform] duration-300";

                return (
              <Link
                key={dish.id}
                      href={`/zonas/${city.slug}/venues/${dish.venue.slug}#plato-${dish.id}`}
                className={`group overflow-hidden border bg-[color:var(--surface)] transition hover:-translate-y-1.5 hover:shadow-[var(--shadow)] ${highlightClassName} ${
                  selectedView === "mosaic"
                    ? `rounded-[1.35rem] ${index % 2 === 1 ? "translate-y-4 sm:translate-y-0" : ""}`
                    : "rounded-[2rem]"
                }`}
              >
                {dish.isFeatured ? (
                  <BorderBeam
                    size={selectedView === "mosaic" ? 180 : 300}
                    duration={selectedView === "mosaic" ? 6 : 7}
                    borderWidth={2}
                    className="from-transparent via-[#f3d58d] to-transparent opacity-95"
                  />
                ) : null}
                <div
                  className={`relative overflow-hidden bg-[color:var(--surface-dark)] ${
                    selectedView === "mosaic" ? "aspect-square" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
                    sizes={
                      selectedView === "mosaic"
                        ? "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                        : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    }
                  />
                  {selectedView === "mosaic" ? (
                    <>
                      <div className="absolute inset-[0.6rem] rounded-[1rem] border border-white/14" />
                      {dish.isFeatured ? (
                        <div className="pointer-events-none absolute -left-8 top-8 h-20 w-20 rounded-full bg-[rgba(214,166,72,0.18)] opacity-70 blur-2xl transition duration-300 group-hover:opacity-100 group-hover:blur-3xl" />
                      ) : null}
                      {dish.isPickupMonthHighlight ? (
                        <div className="pointer-events-none absolute -right-10 top-8 h-24 w-24 rounded-full bg-[rgba(31,138,112,0.18)] blur-2xl transition duration-300 group-hover:bg-[rgba(31,138,112,0.28)] group-hover:blur-3xl" />
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(5,8,7,0),rgba(5,8,7,0.46))]" />
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_26%,transparent_72%,rgba(255,255,255,0.04))] opacity-80 transition duration-500 group-hover:opacity-100" />
                      <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[rgba(12,16,15,0.52)] p-2 opacity-80 shadow-[0_10px_20px_rgba(4,8,7,0.22)] backdrop-blur-[6px] transition duration-500 group-hover:scale-110 group-hover:opacity-100">
                        <Image
                          src="/logo/ZylenPick_LOGO.svg"
                          alt="ZylenPick"
                          width={24}
                          height={24}
                          className="h-full w-full object-contain opacity-95"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {dish.isFeatured ? (
                        <div className="pointer-events-none absolute -left-8 top-8 h-20 w-20 rounded-full bg-[rgba(214,166,72,0.18)] opacity-70 blur-2xl transition duration-300 group-hover:opacity-100 group-hover:blur-3xl" />
                      ) : null}
                      {dish.isPickupMonthHighlight ? (
                        <div className="pointer-events-none absolute -right-10 top-8 h-24 w-24 rounded-full bg-[rgba(31,138,112,0.18)] blur-2xl transition duration-300 group-hover:bg-[rgba(31,138,112,0.28)] group-hover:blur-3xl" />
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(5,8,7,0),rgba(5,8,7,0.16)_38%,rgba(5,8,7,0.52))] transition duration-500 group-hover:h-36" />
                    </>
                  )}
                  <div
                    className={`absolute left-4 top-4 z-10 flex flex-wrap gap-2 ${
                      selectedView === "mosaic" ? "left-3 top-3" : ""
                    }`}
                  >
                    {dish.isFeatured ? (
                      <span
                        title="Destacado"
                        aria-label="Destacado"
                        className={`featured-badge-animated rounded-full border border-[rgba(214,166,72,0.48)] bg-[rgba(18,14,8,0.72)] font-semibold uppercase tracking-[0.16em] text-[#f3d58d] shadow-[0_8px_20px_rgba(8,6,4,0.28)] backdrop-blur-md ${
                          selectedView === "mosaic"
                            ? "inline-flex h-10 w-10 items-center justify-center text-[10px]"
                            : "inline-flex h-11 w-11 items-center justify-center text-[11px]"
                        }`}
                      >
                        <FeaturedBadgeIcon size={selectedView === "mosaic" ? 17 : 20} />
                      </span>
                    ) : null}
                    {dish.isPickupMonthHighlight ? (
                      <span
                        className={`rounded-full border border-[rgba(31,138,112,0.34)] bg-[rgba(31,138,112,0.16)] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)] backdrop-blur ${
                          selectedView === "mosaic"
                            ? "px-2.5 py-1 text-[10px]"
                            : "px-3 py-1 text-[11px]"
                        }`}
                      >
                        Top del mes
                      </span>
                    ) : null}
                    {dish.categoryName ? (
                      <span
                        className={`rounded-full bg-white/88 font-semibold uppercase tracking-[0.16em] text-[#221815] backdrop-blur ${
                          selectedView === "mosaic"
                            ? "px-2.5 py-1 text-[10px]"
                            : "px-3 py-1 text-[11px]"
                        }`}
                      >
                        {dish.categoryName}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full bg-[color:var(--foreground)]/78 font-semibold uppercase tracking-[0.16em] text-white backdrop-blur ${
                        selectedView === "mosaic"
                          ? "px-2.5 py-1 text-[10px]"
                          : "px-3 py-1 text-[11px]"
                      }`}
                    >
                      {dish.venue.pickupEtaMin
                        ? `${dish.venue.pickupEtaMin} min`
                        : "Recogida"}
                    </span>
                  </div>
                </div>

                <div
                  className={`space-y-4 ${
                    selectedView === "mosaic" ? "space-y-2 p-3.5" : "p-5"
                  }`}
                >
                  {selectedView === "mosaic" ? (
                    <div className="space-y-1.5">
                      <h2 className="line-clamp-2 text-base font-semibold leading-tight text-[color:var(--foreground)]">
                        {dish.name}
                      </h2>
                      <p className="text-sm font-semibold text-[color:var(--brand-strong)]">
                        {formatPrice(dish.priceAmount, dish.currency)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[color:var(--muted-strong)]">
                            {dish.venue.name}
                          </p>
                          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[color:var(--foreground)]">
                            {dish.name}
                          </h2>
                        </div>
                        <p className="shrink-0 text-base font-semibold text-[color:var(--brand-strong)]">
                          {formatPrice(dish.priceAmount, dish.currency)}
                        </p>
                      </div>

                      <div className="overflow-hidden">
                        <div className="max-h-0 translate-y-3 opacity-0 transition-all duration-500 ease-out group-hover:max-h-24 group-hover:translate-y-0 group-hover:opacity-100">
                          <p className="text-sm leading-6 text-[color:var(--muted-strong)]">
                            {dish.venue.address ??
                              "Descubre el local y consulta su carta completa."}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                            <span className="text-[color:var(--muted)]">
                              {dish.venue.pickupEtaMin
                                ? `Recogida en ${dish.venue.pickupEtaMin} min`
                                : "Pedido para recoger"}
                            </span>
                            <span className="font-semibold text-[color:var(--brand)]">
                              Ver local
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Link>
                );
              })()
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
