import Link from "next/link";

import {
  getAdminMediaCities,
  getAdminMediaCityById,
  getAdminSiteMediaAssets,
  getAdminVenueMediaByCityId,
  updateCityHeroMediaAction,
  updateSiteMediaAssetAction,
  updateVenueMediaAction,
} from "@/features/admin/services/media-admin-service";

type AdminImagesPageProps = {
  searchParams?: {
    city?: string;
  };
};

export default async function AdminImagesPage({
  searchParams,
}: AdminImagesPageProps) {
  const [cities, siteAssets] = await Promise.all([
    getAdminMediaCities(),
    getAdminSiteMediaAssets(),
  ]);

  const selectedCityId =
    searchParams?.city && cities.some((city) => city.id === searchParams.city)
      ? searchParams.city
      : cities[0]?.id;

  const selectedCity = selectedCityId
    ? await getAdminMediaCityById(selectedCityId)
    : null;
  const venues = selectedCityId
    ? await getAdminVenueMediaByCityId(selectedCityId)
    : [];

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Imagenes
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
            Gestiona desde una sola pantalla las imagenes globales del sitio, el
            hero de cada ciudad y las portadas de los locales.
          </p>
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Sitio
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Imagenes globales
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
            Aqui puedes cambiar las imagenes principales de la home, la pagina
            de unete y las secciones visuales de El proyecto.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {siteAssets.map((asset) => (
            <article
              key={asset.key}
              className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]"
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_13rem]">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                    {asset.key}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-[color:var(--foreground)]">
                    {asset.label}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
                    {asset.description}
                  </p>

                  <form
                    action={updateSiteMediaAssetAction.bind(null, asset.key)}
                    className="mt-5 space-y-4"
                  >
                    <label className="block">
                      <span className="text-sm font-medium text-[color:var(--foreground)]">
                        URL de imagen
                      </span>
                      <input
                        name="imageUrl"
                        type="url"
                        defaultValue={asset.imageUrl}
                        placeholder="https://..."
                        className="dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
                      />
                    </label>

                    <button
                      type="submit"
                      className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
                    >
                      Guardar imagen
                    </button>
                  </form>
                </div>

                <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[color:var(--surface-strong)]">
                  {asset.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.imageUrl}
                      alt={`Vista previa de ${asset.label}`}
                      className="h-full min-h-[16rem] w-full object-cover"
                    />
                  ) : (
                    <div className="flex min-h-[16rem] items-center justify-center px-4 text-center text-sm leading-6 text-[color:var(--muted-strong)]">
                      Sin imagen configurada
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Ciudades
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Hero de ciudad y portadas de locales
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
            Selecciona una ciudad para cambiar su imagen o video principal y
            desplegar solo los locales de esa zona.
          </p>
        </div>

        {cities.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {cities.map((city) => {
              const isActive = city.id === selectedCityId;

              return (
                <Link
                  key={city.id}
                  href={`/panel/imagenes?city=${city.id}`}
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

        {!selectedCity ? (
          <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
            <p className="text-sm text-[color:var(--muted-strong)]">
              No hay ciudades activas disponibles para editar imagenes.
            </p>
          </section>
        ) : (
          <>
            <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                    Ciudad
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                    Hero de {selectedCity.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
                    Este media se usa en el selector de ciudades y en la
                    navegacion publica de zonas. Si hay video, tendra prioridad
                    sobre la imagen.
                  </p>

                  <form
                    action={updateCityHeroMediaAction.bind(null, selectedCity.id)}
                    className="mt-6 space-y-4"
                  >
                    <label className="block">
                      <span className="text-sm font-medium text-[color:var(--foreground)]">
                        URL de imagen principal
                      </span>
                      <input
                        name="heroImageUrl"
                        type="url"
                        defaultValue={selectedCity.heroImageUrl ?? ""}
                        placeholder="https://..."
                        className="dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-[color:var(--foreground)]">
                        URL de video principal
                      </span>
                      <input
                        name="heroVideoUrl"
                        type="url"
                        defaultValue={selectedCity.heroVideoUrl ?? ""}
                        placeholder="https://..."
                        className="dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
                      />
                    </label>

                    <button
                      type="submit"
                      className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
                    >
                      Guardar media de ciudad
                    </button>
                  </form>
                </div>

                <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[color:var(--surface-strong)]">
                  {selectedCity.heroVideoUrl ? (
                    <video
                      src={selectedCity.heroVideoUrl}
                      className="h-full min-h-[18rem] w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : selectedCity.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedCity.heroImageUrl}
                      alt={`Vista previa de ${selectedCity.name}`}
                      className="h-full min-h-[18rem] w-full object-cover"
                    />
                  ) : (
                    <div className="flex min-h-[18rem] items-center justify-center px-6 text-center text-sm leading-6 text-[color:var(--muted-strong)]">
                      Esta ciudad todavia no tiene media principal.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                  Locales
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                  Portadas y logos de {selectedCity.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
                  Cada local aparece en un desplegable propio para que no tengas
                  todas las portadas abiertas a la vez.
                </p>
              </div>

              {venues.length === 0 ? (
                <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
                  <p className="text-sm text-[color:var(--muted-strong)]">
                    Esta ciudad todavia no tiene locales asociados.
                  </p>
                </section>
              ) : (
                <div className="space-y-4">
                  {venues.map((venue, index) => (
                    <details
                      key={venue.id}
                      className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]"
                      open={index === 0}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 marker:hidden">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                            Local
                          </p>
                          <h4 className="mt-2 truncate text-xl font-semibold text-[color:var(--foreground)]">
                            {venue.name}
                          </h4>
                          <p className="mt-2 text-sm text-[color:var(--muted-strong)]">
                            /{venue.slug}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/panel/locales/${venue.id}`}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                          >
                            Ir al local
                          </Link>
                          <span className="rounded-full border border-white/10 bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]">
                            Desplegar
                          </span>
                        </div>
                      </summary>

                      <div className="border-t border-white/8 px-6 py-6">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_8rem]">
                          <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[color:var(--surface-strong)]">
                            {venue.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={venue.coverUrl}
                                alt={`Portada de ${venue.name}`}
                                className="h-40 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-40 items-center justify-center px-4 text-center text-sm leading-6 text-[color:var(--muted-strong)]">
                                Sin portada
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[color:var(--surface-strong)]">
                            {venue.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={venue.logoUrl}
                                alt={`Logo de ${venue.name}`}
                                className="h-40 w-full object-contain p-4"
                              />
                            ) : (
                              <div className="flex h-40 items-center justify-center px-4 text-center text-sm leading-6 text-[color:var(--muted-strong)]">
                                Sin logo
                              </div>
                            )}
                          </div>
                        </div>

                        <form
                          action={updateVenueMediaAction.bind(null, venue.id)}
                          className="mt-6 space-y-4"
                        >
                          <label className="block">
                            <span className="text-sm font-medium text-[color:var(--foreground)]">
                              URL de portada
                            </span>
                            <input
                              name="coverUrl"
                              type="url"
                              defaultValue={venue.coverUrl ?? ""}
                              placeholder="https://..."
                              className="dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
                            />
                          </label>

                          <label className="block">
                            <span className="text-sm font-medium text-[color:var(--foreground)]">
                              URL de logo
                            </span>
                            <input
                              name="logoUrl"
                              type="url"
                              defaultValue={venue.logoUrl ?? ""}
                              placeholder="https://..."
                              className="dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
                            />
                          </label>

                          <button
                            type="submit"
                            className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
                          >
                            Guardar imagenes del local
                          </button>
                        </form>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </section>
  );
}
