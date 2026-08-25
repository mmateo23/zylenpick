import Link from "next/link";

import { AdminSiteMediaEditor } from "@/components/admin/admin-site-media-editor";
import {
  getAdminMediaCities,
  getAdminMediaCityById,
  getAdminSiteMediaAssets,
  getAdminVenueMediaByCityId,
  updateCityHeroMediaAction,
  updateVenueMediaAction,
} from "@/features/admin/services/media-admin-service";
import {
  siteMediaPageDefinitions,
  type SiteMediaPageKey,
} from "@/features/site-media/site-media";

type AdminImagesPageProps = {
  searchParams?: {
    city?: string;
    page?: string;
  };
};

type AdminMediaPageKey = SiteMediaPageKey | "zones";

const mediaPageOptions = [
  ...siteMediaPageDefinitions,
  { key: "zones", label: "Zonas y locales", route: "/zonas" },
] as const;

export default async function AdminImagesPage({
  searchParams,
}: AdminImagesPageProps) {
  const [cities, siteAssets] = await Promise.all([
    getAdminMediaCities(),
    getAdminSiteMediaAssets(),
  ]);
  const selectedPage: AdminMediaPageKey = mediaPageOptions.some(
    (page) => page.key === searchParams?.page,
  )
    ? (searchParams?.page as AdminMediaPageKey)
    : "home";
  const selectedPageDefinition = mediaPageOptions.find(
    (page) => page.key === selectedPage,
  )!;
  const selectedAssets =
    selectedPage === "zones"
      ? []
      : siteAssets.filter((asset) => asset.page === selectedPage);

  const selectedCityId =
    searchParams?.city && cities.some((city) => city.id === searchParams.city)
      ? searchParams.city
      : cities[0]?.id;

  const selectedCity = selectedPage === "zones" && selectedCityId
    ? await getAdminMediaCityById(selectedCityId)
    : null;
  const venues = selectedPage === "zones" && selectedCityId
    ? await getAdminVenueMediaByCityId(selectedCityId)
    : [];

  return (
    <section className="space-y-8">
      <header className="rounded-[1.5rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#741314]">
          Contenido visual
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#381932] sm:text-4xl">
          Biblioteca por páginas
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#381932]/68 sm:text-base">
          Entra en una página, identifica el bloque por su vista previa y cambia
          solo esa imagen. Las fotos de platos se editan desde Locales → Selección.
        </p>
      </header>

      <nav
        aria-label="Páginas con contenido visual editable"
        className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-[#741314]/12 bg-white p-2 sm:grid-cols-3 xl:grid-cols-7"
      >
        {mediaPageOptions.map((page) => {
          const active = page.key === selectedPage;
          const count =
            page.key === "zones"
              ? cities.length
              : siteAssets.filter((asset) => asset.page === page.key).length;

          return (
            <Link
              key={page.key}
              href={`/panel/imagenes?page=${page.key}`}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 items-center justify-between gap-2 rounded-[1rem] px-3.5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] ${
                active
                  ? "bg-[#741314] text-[#FFF7E8]"
                  : "text-[#381932] hover:bg-[#741314]/[0.06]"
              }`}
            >
              <span>{page.label}</span>
              <span
                className={`grid min-h-7 min-w-7 place-items-center rounded-full px-2 text-xs ${
                  active ? "bg-[#FFF7E8] text-[#741314]" : "bg-[#FFF7E8] text-[#381932]"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {selectedPage !== "zones" ? (
        <section className="space-y-5" aria-labelledby="selected-media-page-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#741314]">
                Página pública
              </p>
              <h2
                id="selected-media-page-title"
                className="mt-2 text-2xl font-black tracking-[-0.025em] text-[#381932]"
              >
                {selectedPageDefinition.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#381932]/65">
                {selectedAssets.length} {selectedAssets.length === 1 ? "imagen editable" : "imágenes editables"}.
                Cada subida se optimiza y publica automáticamente.
              </p>
            </div>
            <Link
              href={selectedPageDefinition.route}
              target="_blank"
              className="inline-flex min-h-11 items-center rounded-full border border-[#741314]/18 bg-white px-5 text-sm font-black text-[#741314] hover:border-[#741314]"
            >
              Abrir {selectedPageDefinition.label}
            </Link>
          </div>

          <div className="space-y-4">
            {selectedAssets.map((asset) => (
              <AdminSiteMediaEditor
                key={asset.key}
                asset={asset}
                route={selectedPageDefinition.route}
              />
            ))}
          </div>
        </section>
      ) : null}

      {selectedPage === "zones" ? (
      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Ciudades
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Hero de ciudad y portadas de locales
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
            Selecciona una ciudad para cambiar su imagen o vídeo principal y
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
                  href={`/panel/imagenes?page=zones&city=${city.id}`}
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
              No hay ciudades activas disponibles para editar imágenes.
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
                    Este contenido se usa en el selector de ciudades y en la
                    navegación pública de zonas. Si hay vídeo, tendrá prioridad
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
                      Esta ciudad todavía no tiene contenido principal.
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
                    Esta ciudad todavía no tiene locales asociados.
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
                            Guardar imágenes del local
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
      ) : null}
    </section>
  );
}
