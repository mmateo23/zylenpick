import Link from "next/link";

import { getCities } from "@/features/cities/services/cities-service";
import {
  getAdminHighlightedVenuesByCityId,
  getAdminMenuItemsByCityId,
  toggleMenuItemFeaturedAction,
  toggleMenuItemHomeFeaturedAction,
  toggleMenuItemPickupMonthHighlightAction,
  toggleVenueFeaturedAction,
} from "@/features/admin/services/menu-items-admin-service";
import { formatPrice } from "@/lib/utils/currency";

type AdminHighlightsPageProps = {
  searchParams?: {
    city?: string;
    q?: string;
  };
};

export default async function AdminHighlightsPage({
  searchParams,
}: AdminHighlightsPageProps) {
  const cities = await getCities();
  const selectedCityId =
    searchParams?.city && cities.some((city) => city.id === searchParams.city)
      ? searchParams.city
      : cities[0]?.id;

  const selectedCity =
    cities.find((city) => city.id === selectedCityId) ?? null;
  const searchQuery = searchParams?.q?.trim() ?? "";

  const [venues, menuItems] = selectedCityId
    ? await Promise.all([
        getAdminHighlightedVenuesByCityId(selectedCityId),
        getAdminMenuItemsByCityId(selectedCityId),
      ])
    : [[], []];

  const normalizedSearchQuery = searchQuery.toLowerCase();
  const filteredVenues = normalizedSearchQuery
    ? venues.filter((venue) =>
        [venue.name, venue.slug]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearchQuery)),
      )
    : venues;
  const filteredMenuItems = normalizedSearchQuery
    ? menuItems.filter((item) =>
        [
          item.name,
          item.venueName ?? "",
          item.categoryName ?? "",
          item.cityName ?? "",
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearchQuery)),
      )
    : menuItems;

  const featuredVenues = filteredVenues.filter((venue) => venue.isFeatured);
  const featuredItems = filteredMenuItems.filter((item) => item.isFeatured);
  const homeItems = filteredMenuItems.filter((item) => item.isHomeFeatured);
  const pickupMonthItems = filteredMenuItems.filter(
    (item) => item.isPickupMonthHighlight,
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Destacados
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
            Organiza por ciudad que locales se promocionan, que platos tienen
            tratamiento visual propio y cuales deben empujar la home.
          </p>
        </div>

        {cities.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {cities.map((city) => {
              const isActive = city.id === selectedCityId;

              return (
                <Link
                  key={city.id}
                  href={`/panel/destacados?city=${city.id}`}
                  className={`magnetic-button inline-flex rounded-full px-5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[color:var(--brand)] text-white shadow-[var(--card-shadow)]"
                      : "border border-white/10 bg-white/5 text-[color:var(--foreground)]"
                  }`}
                >
                  {city.name}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>

      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-5 shadow-[var(--soft-shadow)]">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <input type="hidden" name="city" value={selectedCityId ?? ""} />

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Buscar local o plato
            </span>
            <input
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder="Ejemplo: burger, dados, sushi, pizza..."
              className="dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
            />
          </label>

          <button
            type="submit"
            className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
          >
            Buscar
          </button>

          <Link
            href={selectedCityId ? `/panel/destacados?city=${selectedCityId}` : "/panel/destacados"}
            className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Limpiar
          </Link>
        </form>

        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          {searchQuery
            ? `Mostrando ${filteredVenues.length} locales y ${filteredMenuItems.length} platos para “${searchQuery}”.`
            : "Busca por nombre de plato, local, slug o categoria para encontrar mas rapido lo que quieres destacar."}
        </p>
      </section>

      {selectedCity ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <section className="glass-panel rounded-[1.8rem] border border-[rgba(214,166,72,0.28)] p-6 shadow-[var(--soft-shadow)]">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#d6a648]">
              Locales
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
              Destacados del directorio
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
              {featuredVenues.length > 0
                ? `${featuredVenues.length} locales destacados en ${selectedCity.name}.`
                : "Todavia no hay locales destacados en esta ciudad."}
            </p>
          </section>

          <section className="glass-panel rounded-[1.8rem] border border-[rgba(214,166,72,0.28)] p-6 shadow-[var(--soft-shadow)]">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#d6a648]">
              Platos
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
              Destacados visuales
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
              {featuredItems.length > 0
                ? `${featuredItems.length} platos con borde dorado activo y ${pickupMonthItems.length} marcados como top del mes.`
                : pickupMonthItems.length > 0
                  ? `${pickupMonthItems.length} platos marcados como top del mes en esta ciudad.`
                  : "Todavia no hay platos destacados en esta ciudad."}
            </p>
          </section>

          <section className="glass-panel rounded-[1.8rem] border border-[rgba(31,138,112,0.28)] p-6 shadow-[var(--soft-shadow)]">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--accent)]">
              Home
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
              Seleccion para portada
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
              {homeItems.length > 0
                ? `${homeItems.length} platos alimentan ahora los destacados de la home.`
                : "Todavia no hay platos marcados para la home."}
            </p>
          </section>
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Locales destacados
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Que locales quieres empujar en {selectedCity?.name ?? "esta ciudad"}
          </h2>
        </div>

        <section className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]">
          {!selectedCity ? (
            <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
              No hay ciudades activas disponibles para gestionar destacados.
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
              No hemos encontrado locales con ese criterio en esta ciudad.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    <th className="px-5 py-4 font-medium">Local</th>
                    <th className="px-5 py-4 font-medium">Slug</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="px-5 py-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {filteredVenues.map((venue) => {
                    const toggleAction = toggleVenueFeaturedAction.bind(
                      null,
                      venue.id,
                      !venue.isFeatured,
                    );

                    return (
                      <tr
                        key={venue.id}
                        className="text-sm text-[color:var(--foreground)]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-[1rem] border border-white/10 bg-white/5">
                              {venue.coverUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={venue.coverUrl}
                                  alt={venue.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <p className="font-semibold">{venue.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                          /{venue.slug}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                              venue.isFeatured
                                ? "bg-[rgba(214,166,72,0.16)] text-[#d6a648]"
                                : "bg-white/8 text-white/58"
                            }`}
                          >
                            {venue.isFeatured ? "Destacado" : "Normal"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-3">
                            <form action={toggleAction}>
                              <button
                                type="submit"
                                className="text-sm font-semibold text-[#d6a648]"
                              >
                                {venue.isFeatured
                                  ? "Quitar destacado"
                                  : "Destacar local"}
                              </button>
                            </form>
                            <Link
                              href={`/panel/locales/${venue.id}`}
                              className="text-sm font-semibold text-[color:var(--brand)]"
                            >
                              Editar local
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Platos destacados
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Visuales y senales de producto
          </h2>
        </div>

        <section className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]">
          {!selectedCity ? (
            <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
              No hay ciudades activas disponibles para gestionar destacados.
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
              No hemos encontrado platos con ese criterio en esta ciudad.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    <th className="px-5 py-4 font-medium">Plato</th>
                    <th className="px-5 py-4 font-medium">Local</th>
                    <th className="px-5 py-4 font-medium">Precio</th>
                    <th className="px-5 py-4 font-medium">Destacado</th>
                    <th className="px-5 py-4 font-medium">Top del mes</th>
                    <th className="px-5 py-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {filteredMenuItems.map((item) => {
                    const toggleFeaturedAction = toggleMenuItemFeaturedAction.bind(
                      null,
                      item.id,
                      !item.isFeatured,
                    );
                    const togglePickupMonthAction =
                      toggleMenuItemPickupMonthHighlightAction.bind(
                        null,
                        item.id,
                        !item.isPickupMonthHighlight,
                      );

                    return (
                      <tr
                        key={item.id}
                        className="text-sm text-[color:var(--foreground)]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-[1rem] border border-white/10 bg-white/5">
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-xs text-[color:var(--muted-strong)]">
                                {item.categoryName ?? "Sin categoria"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                          {item.venueName ?? "Local"}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatPrice(item.priceAmount, item.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                              item.isFeatured
                                ? "bg-[rgba(214,166,72,0.16)] text-[#d6a648]"
                                : "bg-white/8 text-white/58"
                            }`}
                          >
                            {item.isFeatured ? "Activo" : "No"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                              item.isPickupMonthHighlight
                                ? "bg-[rgba(31,138,112,0.18)] text-[color:var(--accent)]"
                                : "bg-white/8 text-white/58"
                            }`}
                          >
                            {item.isPickupMonthHighlight ? "Activo" : "No"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-3">
                            <form action={toggleFeaturedAction}>
                              <button
                                type="submit"
                                className="text-sm font-semibold text-[#d6a648]"
                              >
                                {item.isFeatured
                                  ? "Quitar destacado"
                                  : "Marcar destacado"}
                              </button>
                            </form>
                            <form action={togglePickupMonthAction}>
                              <button
                                type="submit"
                                className="text-sm font-semibold text-[color:var(--accent)]"
                              >
                                {item.isPickupMonthHighlight
                                  ? "Quitar top del mes"
                                  : "Marcar top del mes"}
                              </button>
                            </form>
                            <Link
                              href={`/panel/locales/${item.venueId}/platos/${item.id}`}
                              className="text-sm font-semibold text-[color:var(--brand)]"
                            >
                              Editar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Home
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Seleccion especifica para portada
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
            Estos platos suben primero en la home. Si no hay suficientes, la home
            se completa con destacados generales y despues con el resto.
          </p>
        </div>

        <section className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]">
          {!selectedCity ? (
            <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
              No hay ciudades activas disponibles para gestionar la home.
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
              No hemos encontrado platos con ese criterio en esta ciudad.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    <th className="px-5 py-4 font-medium">Plato</th>
                    <th className="px-5 py-4 font-medium">Local</th>
                    <th className="px-5 py-4 font-medium">Precio</th>
                    <th className="px-5 py-4 font-medium">Home</th>
                    <th className="px-5 py-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {filteredMenuItems.map((item) => {
                    const toggleHomeAction = toggleMenuItemHomeFeaturedAction.bind(
                      null,
                      item.id,
                      !item.isHomeFeatured,
                    );

                    return (
                      <tr
                        key={`${item.id}-home`}
                        className="text-sm text-[color:var(--foreground)]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-[1rem] border border-white/10 bg-white/5">
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <p className="font-semibold">{item.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                          {item.venueName ?? "Local"}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatPrice(item.priceAmount, item.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                              item.isHomeFeatured
                                ? "bg-[rgba(31,138,112,0.18)] text-[color:var(--accent)]"
                                : "bg-white/8 text-white/58"
                            }`}
                          >
                            {item.isHomeFeatured ? "Activo" : "No"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-3">
                            <form action={toggleHomeAction}>
                              <button
                                type="submit"
                                className="text-sm font-semibold text-[color:var(--accent)]"
                              >
                                {item.isHomeFeatured
                                  ? "Quitar de home"
                                  : "Llevar a home"}
                              </button>
                            </form>
                            <Link
                              href={`/panel/locales/${item.venueId}/platos/${item.id}`}
                              className="text-sm font-semibold text-[color:var(--brand)]"
                            >
                              Editar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </section>
  );
}
