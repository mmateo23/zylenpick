import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";
import { getCities } from "@/features/cities/services/cities-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const revalidate = 3600;

export default async function CitiesPage() {
  const cities = await getCities();
  const isConfigured = isSupabaseConfigured();

  return (
    <SiteShell>
      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--brand)]">
          Zonas
        </p>
        <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.94] text-[color:var(--foreground)] sm:text-6xl">
          Elige dónde empieza tu próxima recogida.
        </h1>
        <p className="mt-6 text-lg leading-8 text-[color:var(--muted-strong)]">
          Una selección visual y directa para entrar en los locales de cada
          zona sin ruido innecesario.
        </p>
      </section>

      {!isConfigured ? (
        <section className="mt-10 rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[var(--soft-shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            Supabase no está configurado.
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Configura las variables de entorno y ejecuta las migraciones para
            cargar las zonas reales.
          </p>
        </section>
      ) : null}

      {isConfigured ? (
        <section className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/cities/${city.slug}`}
              className="editorial-card group overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--soft-shadow)] transition hover:-translate-y-1.5 hover:shadow-[var(--shadow)]"
            >
              <div
                className="min-h-[24rem] bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: city.heroImageUrl
                    ? `linear-gradient(180deg, rgba(23, 17, 14, 0.2), rgba(23, 17, 14, 0.58)), url(${city.heroImageUrl})`
                    : "linear-gradient(180deg, rgba(224, 171, 87, 0.32), rgba(213, 90, 50, 0.38))",
                }}
              />
              <div className="p-7">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                  {city.region ?? "Zona"}
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-[0.98] text-[color:var(--foreground)]">
                  {city.name}
                </h2>
                <p className="mt-5 text-sm leading-7 text-[color:var(--muted-strong)]">
                  Entrar en la selección local y explorar restaurantes.
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : null}
    </SiteShell>
  );
}
