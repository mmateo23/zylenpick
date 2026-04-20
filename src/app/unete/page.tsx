import Link from "next/link";

import { JoinForm } from "@/components/join/join-form";
import { JoinVisualShowcase } from "@/components/join/join-visual-showcase";
import { SiteShell } from "@/components/layout/site-shell";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const heroTags = [
  "Locales reales",
  "Pedidos para recoger",
  "Sin líos técnicos",
];

const benefits = [
  {
    title: "Más gente te descubre en tu zona",
    text: "Tus platos aparecen donde la gente ya está decidiendo qué comer cerca.",
  },
  {
    title: "Recibes pedidos para recoger",
    text: "El cliente elige, confirma y pasa por tu local cuando el pedido esté listo.",
  },
  {
    title: "Tu carta se ve clara y apetece",
    text: "Platos con foto, precio y nombre del local para decidir sin vueltas.",
  },
  {
    title: "Te ayudamos a montarlo",
    text: "No tienes que preparar una web nueva ni aprender una herramienta complicada.",
  },
];

const steps = [
  {
    title: "Nos dejas tus datos",
    text: "Solo lo básico del local para saber dónde estás y cómo contactarte.",
  },
  {
    title: "Preparamos tu ficha",
    text: "Revisamos contigo la carta, las fotos y la forma de recogida.",
  },
  {
    title: "Empiezas a recibir pedidos",
    text: "Tu local queda listo para que la gente descubra tus platos y recoja.",
  },
];

const confidenceNotes = [
  "No necesitas saber de tecnología",
  "No tienes que subir todo tú",
  "Te ayudamos personalmente",
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
      <div className="space-y-8">
        <section
          className="editorial-card overflow-hidden rounded-[2.5rem] border border-white/10 text-white shadow-[var(--shadow)]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7, 10, 10, 0.1), rgba(8, 12, 11, 0.34) 38%, rgba(8, 12, 11, 0.9)), url('${siteMedia.join_hero.imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex min-h-[34rem] flex-col justify-between px-7 py-8 sm:min-h-[38rem] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/18 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/74 backdrop-blur-md">
              <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--brand)]" />
              Únete a ZylenPick
            </div>

            <div className="max-w-5xl">
              <div className="mb-5 flex flex-wrap gap-2.5">
                {heroTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-black/16 px-3.5 py-1.5 text-[11px] font-medium text-white/72 backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="max-w-[13ch] text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-6xl lg:text-[5.8rem]">
                Haz que más gente de tu zona vea tus platos y recoja en tu local
              </h1>

              <p className="mt-6 max-w-[43rem] text-base leading-8 text-white/80 sm:text-xl sm:leading-9">
                Sin apps complicadas. Sin líos técnicos. Te ayudamos a dejarlo
                listo.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="#solicitud"
                  className="magnetic-button inline-flex justify-center rounded-full border border-[color:var(--brand)]/24 bg-[linear-gradient(135deg,rgba(124,255,184,0.1),rgba(0,223,129,0.92))] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,223,129,0.18)]"
                >
                  Quiero aparecer en ZylenPick
                </Link>
                <Link
                  href="#como-se-vera"
                  className="magnetic-button inline-flex justify-center rounded-full border border-white/12 bg-black/18 px-6 py-3.5 text-sm font-semibold text-white/82 backdrop-blur-md transition hover:bg-black/26"
                >
                  Ver cómo se verá
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-[1.7rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-5 shadow-[var(--soft-shadow)] backdrop-blur-xl"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                Ventaja
              </p>
              <h2 className="mt-4 text-xl font-semibold leading-tight text-[color:var(--foreground)]">
                {benefit.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                {benefit.text}
              </p>
            </article>
          ))}
        </section>

        <section id="como-se-vera" className="scroll-mt-28">
          <JoinVisualShowcase items={showcaseItems} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
              Cómo funciona
            </p>
            <h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
              Tres pasos y listo.
            </h2>
            <p className="mt-4 max-w-[42ch] text-sm leading-7 text-[color:var(--muted)]">
              La idea es que puedas aparecer en ZylenPick sin convertir esto en
              otro trabajo más.
            </p>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="flex gap-4 rounded-[1.7rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-5 shadow-[var(--soft-shadow)] backdrop-blur-xl"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand)]/22 bg-[color:var(--brand)]/10 text-sm font-semibold text-[color:var(--brand)]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                    {step.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
                Sin miedo a la tecnología
              </p>
              <h2 className="mt-4 max-w-[13ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
                Tú cocinas. Nosotros te ayudamos con la parte visual.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {confidenceNotes.map((note) => (
                <div
                  key={note}
                  className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)]/72 p-4"
                >
                  <p className="text-sm font-semibold leading-6 text-[color:var(--foreground)]">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="solicitud" className="scroll-mt-28">
          <JoinForm />
        </section>
      </div>
    </SiteShell>
  );
}
