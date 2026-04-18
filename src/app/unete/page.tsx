import { JoinForm } from "@/components/join/join-form";
import { JoinVisualShowcase } from "@/components/join/join-visual-showcase";
import { SiteShell } from "@/components/layout/site-shell";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const quickStats = [
  { label: "Alta", value: "Guiada" },
  { label: "Arranque", value: "Simple" },
  { label: "Enfoque", value: "Local" },
];

const profileTags = [
  "Restaurantes de barrio",
  "Cocinas con recogida",
  "Locales que quieren una presencia más cuidada",
];

export default async function JoinPage() {
  const configured = isSupabaseConfigured();
  const [siteMedia, showcase] = await Promise.all([
    getSiteMediaAssetMap(),
    configured
      ? getHomeShowcase()
      : Promise.resolve({ featuredItems: [], latestItems: [] }),
  ]);
  const showcaseItems = [...showcase.featuredItems, ...showcase.latestItems];

  return (
    <SiteShell>
      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section
            className="editorial-card overflow-hidden rounded-[2.5rem] border border-white/10 text-white shadow-[var(--shadow)]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(7, 10, 10, 0.08), rgba(8, 12, 11, 0.28) 36%, rgba(8, 12, 11, 0.88)), url('${siteMedia.join_hero.imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex min-h-[29rem] flex-col justify-between px-7 py-8 sm:min-h-[33rem] sm:px-8 sm:py-10 lg:px-10 lg:py-11">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/18 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/74 backdrop-blur-md">
                <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--brand)]" />
                Únete a ZylenPick
              </div>

              <div>
                <div className="mb-5 flex flex-wrap gap-2.5">
                  {profileTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-black/16 px-3.5 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="max-w-[10ch] text-balance text-5xl font-semibold leading-[0.9] sm:text-6xl lg:text-[4.8rem]">
                  Lleva tu local a una presencia más clara y visual.
                </h1>

                <p className="mt-5 max-w-[42ch] text-base leading-8 text-white/78 sm:text-lg">
                  Una propuesta pensada para negocios que quieren recibir pedidos
                  con una presencia moderna, cuidada y más alineada con su marca.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {quickStats.map((item) => (
                    <article
                      key={item.label}
                      className="rounded-[1.25rem] border border-white/10 bg-black/16 px-4 py-4 backdrop-blur-md"
                    >
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/48">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {item.value}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <JoinVisualShowcase items={showcaseItems} />
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 xl:gap-3">
            <div className="rounded-[1.9rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 px-5 py-4 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:px-6 xl:px-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                Solicitud de alta
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Cuéntanos lo esencial del local y del contacto para valorar el encaje.
              </p>
            </div>
            <div className="rounded-[1.9rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 px-5 py-4 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:px-6 xl:px-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                Revisión manual
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Preferimos una selección cuidada frente a un alta automática.
              </p>
            </div>
            <div className="rounded-[1.9rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 px-5 py-4 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:px-6 xl:px-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                Activación
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Si encaja, montamos la ficha visual y activamos el local contigo.
              </p>
            </div>
          </div>

          <JoinForm />
        </div>
      </section>
    </SiteShell>
  );
}
