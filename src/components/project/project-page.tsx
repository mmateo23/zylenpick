import Link from "next/link";

import { LightRays } from "@/components/project/light-rays";
import { StoryCardSwap } from "@/components/project/story-card-swap";
import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

type ProjectPageProps = {
  siteMedia: SiteMediaAssetMap;
};

const personProblems = [
  "Todo parece igual",
  "Pierdes tiempo mirando sin decidir",
  "No sabes si realmente te va a gustar",
  "Acabas pidiendo lo mismo de siempre",
];

const venueProblems = [
  "Tu comida no se ve como realmente es",
  "Dependes de plataformas complicadas",
  "Cuesta que la gente te descubra",
  "Pierdes pedidos aunque tengas buen producto",
];

const ideaPoints = [
  "Ves platos reales de locales cercanos",
  "Decides rápido con lo que te entra por los ojos",
  "Haces el pedido y lo recoges en el local",
];

const localBenefits = [
  "Más gente te descubre cerca de ti",
  "Recibes pedidos para recoger",
  "Tu carta se ve clara y apetece",
  "Te ayudamos a dejarlo todo listo",
];

const philosophyPoints = [
  "Comer debería ser fácil",
  "Decidir no debería llevar tiempo",
  "Y un buen local debería verse como se merece",
];

function PointList({ points }: { points: string[] }) {
  return (
    <div className="mt-6 grid gap-3">
      {points.map((point) => (
        <p
          key={point}
          className="rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)]/64 px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]"
        >
          {point}
        </p>
      ))}
    </div>
  );
}

export function ProjectPage({ siteMedia }: ProjectPageProps) {
  const journeySteps = [
    {
      title: "Mira platos cerca de ti",
      description: "Platos reales, de locales de tu zona.",
      imageUrl: siteMedia.project_step_discover.imageUrl,
    },
    {
      title: "Elige lo que te apetece",
      description: "Sin menús largos ni decisiones infinitas.",
      imageUrl: siteMedia.project_step_order.imageUrl,
    },
    {
      title: "Recógelo en el local",
      description: "Sin esperas, sin líos.",
      imageUrl: siteMedia.project_step_pickup.imageUrl,
    },
  ];

  return (
    <div className="space-y-8 lg:space-y-12">
      <section
        className="spotlight-panel relative overflow-hidden rounded-[2.8rem] border border-white/10 px-6 py-8 text-white shadow-[var(--shadow)] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6, 9, 8, 0.14), rgba(6, 9, 8, 0.42) 38%, rgba(6, 9, 8, 0.9)), url('${siteMedia.project_hero.imageUrl}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <LightRays className="opacity-70" />
        <div className="relative z-10 flex min-h-[34rem] flex-col justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/18 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/72 backdrop-blur-md">
            <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--brand)]" />
            El proyecto
          </div>

          <div className="max-w-5xl">
            <h1 className="max-w-[12ch] text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-6xl lg:text-[5.9rem]">
              Elegir qué comer no debería ser complicado
            </h1>
            <p className="mt-6 max-w-[47rem] text-base leading-8 text-white/80 sm:text-xl sm:leading-9">
              ZylenPick hace que veas platos reales, decidas rápido y vayas
              directamente al local a recoger. Sin apps complicadas. Sin perder
              tiempo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/platos"
                className="magnetic-button inline-flex justify-center rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,223,129,0.18)]"
              >
                Ver platos
              </Link>
              <Link
                href="/unete"
                className="magnetic-button inline-flex justify-center rounded-full border border-white/14 bg-black/18 px-6 py-3.5 text-sm font-semibold text-white/86 backdrop-blur-md transition hover:bg-black/26"
              >
                Quiero que mi local esté aquí
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
            Personas
          </p>
          <h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
            Elegir qué comer se ha vuelto un lío
          </h2>
          <PointList points={personProblems} />
        </article>

        <article className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
            Locales
          </p>
          <h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
            Destacar hoy en día no es fácil
          </h2>
          <PointList points={venueProblems} />
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div
          className="editorial-card min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-white/10 shadow-[var(--soft-shadow)] sm:min-h-[30rem]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(6, 9, 8, 0.08), rgba(6, 9, 8, 0.68)), url('${siteMedia.project_idea.imageUrl}')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />

        <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
            La idea
          </p>
          <h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
            ZylenPick es otra forma de decidir
          </h2>
          <PointList points={ideaPoints} />
          <p className="mt-6 text-2xl font-semibold leading-tight text-[color:var(--foreground)]">
            Simple. Directo. Sin rodeos.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Cómo funciona
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
            Así de fácil
          </h2>
        </div>
        <StoryCardSwap steps={journeySteps} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
            Para locales
          </p>
          <h2 className="mt-4 max-w-[13ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
            Si tienes un local, esto es para ti
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            Tu comida se ve mejor, la gente decide antes y vienen a recoger
            directamente a tu local.
          </p>
          <p className="mt-5 text-lg font-semibold leading-7 text-[color:var(--foreground)]">
            Sin complicarte. Sin tener que aprender nada nuevo.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {localBenefits.map((benefit) => (
            <article
              key={benefit}
              className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-5 shadow-[var(--soft-shadow)] backdrop-blur-xl"
            >
              <p className="text-lg font-semibold leading-tight text-[color:var(--foreground)]">
                {benefit}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="overflow-hidden rounded-[2.2rem] border border-white/10 px-6 py-8 text-white shadow-[var(--shadow)] sm:px-8 sm:py-10 lg:px-10"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(6, 9, 8, 0.92), rgba(6, 9, 8, 0.62)), url('${siteMedia.project_problem.imageUrl}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">
              Filosofía
            </p>
            <h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">
              ZylenPick nace para simplificar
            </h2>
          </div>

          <div>
            <div className="grid gap-3">
              {philosophyPoints.map((point) => (
                <p
                  key={point}
                  className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/78 backdrop-blur-md"
                >
                  {point}
                </p>
              ))}
            </div>
            <p className="mt-6 text-2xl font-semibold leading-tight">
              Menos fricción. Más claro. Más real.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
              Siguiente paso
            </p>
            <h2 className="mt-4 max-w-[13ch] text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-[color:var(--foreground)] sm:text-5xl">
              Empieza a usar ZylenPick hoy
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/platos"
              className="magnetic-button inline-flex justify-center rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white"
            >
              Ver platos
            </Link>
            <Link
              href="/unete"
              className="magnetic-button inline-flex justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)]/40"
            >
              Quiero que mi local esté aquí
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
