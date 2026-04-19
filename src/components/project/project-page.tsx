import Link from "next/link";

import { Logo } from "@/components/branding/logo";
import { LightRays } from "@/components/project/light-rays";
import { StoryCardSwap } from "@/components/project/story-card-swap";
import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

const valuePoints = [
  {
    positive: "Más locales visibles",
    negative: "Menos perderse entre apps iguales",
  },
  {
    positive: "Más fácil decidir",
    negative: "Menos mirar pantallas sin elegir",
  },
  {
    positive: "Más recogida cercana",
    negative: "Menos esperas innecesarias",
  },
  {
    positive: "Más apoyo al barrio",
    negative: "Menos depender solo del delivery",
  },
];

type ProjectPageProps = {
  siteMedia: SiteMediaAssetMap;
};

export function ProjectPage({ siteMedia }: ProjectPageProps) {
  const journeySteps = [
    {
      title: "Descubre",
      description:
        "Mira locales reales cerca de ti y entiende rápido qué puedes recoger.",
      imageUrl: siteMedia.project_step_discover.imageUrl,
    },
    {
      title: "Elige",
      description:
        "Decide el plato sin leer reseñas eternas ni dar vueltas.",
      imageUrl: siteMedia.project_step_order.imageUrl,
    },
    {
      title: "Recoge",
      description:
        "El local lo prepara y tú pasas a recogerlo cuando esté listo.",
      imageUrl: siteMedia.project_step_pickup.imageUrl,
    },
  ];

  return (
    <div className="space-y-12 lg:space-y-20">
      <section
        className="spotlight-panel relative overflow-hidden rounded-[2.8rem] border border-white/10 px-6 py-8 shadow-[var(--shadow)] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6, 9, 8, 0.34), rgba(6, 9, 8, 0.88)), url('${siteMedia.project_hero.imageUrl}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <LightRays className="opacity-80" />
        <div className="relative z-10 max-w-3xl">
          <Logo
            mode="full"
            priority
            iconClassName="h-12 w-auto sm:h-14"
            textClassName="text-3xl text-white sm:text-4xl"
          />
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-white/54">
            El proyecto
          </p>
          <h1 className="mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            <span className="block">ZylenPick nace para elegir mejor.</span>
            <span className="mt-5 block text-[color:var(--brand)]">Comida local.</span>
            <span className="block">Sin tanto lío.</span>
          </h1>
          <p className="mt-6 max-w-[28rem] text-lg font-medium tracking-[0.01em] text-white/76 sm:text-xl">
            Platos reales, locales cercanos y pedidos para recoger sin complicaciones.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
          href="/zonas"
              className="magnetic-button inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white"
            >
              Ver locales
            </Link>
            <Link
              href="/unete"
              className="magnetic-button inline-flex items-center justify-center rounded-full border border-white/14 bg-[rgba(9,12,11,0.42)] px-6 py-3 text-sm font-semibold text-white/88 backdrop-blur"
            >
              Unirme a ZylenPick
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Por que ZylenPick
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
            Una forma más humana de decidir qué comer y apoyar a locales reales.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {valuePoints.map((point) => (
            <article
              key={point.positive}
              className="glass-panel rounded-[1.7rem] border border-white/10 px-5 py-5 shadow-[var(--card-shadow)]"
            >
              <p className="text-2xl font-semibold leading-tight text-white">
                {point.positive}
              </p>
              <p className="mt-3 text-base leading-7 text-white/56">
                {point.negative}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--brand)]">
            El problema
          </p>
          <h2 className="max-w-[11ch] text-balance text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
            Hoy cuesta demasiado elegir algo sencillo cerca de ti.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72 text-justify sm:text-left">
            <p>
              Muchas apps están pensadas para comparar, leer y esperar. Pero a
              veces solo quieres ver platos claros, elegir rápido y pasar a
              recoger.
            </p>
            <p>
              A la vez, muchos locales buenos no tienen una forma simple y
              cuidada de aparecer ante la gente de su zona sin meterse en más
              tecnología de la necesaria.
            </p>
          </div>
        </div>
        <div
          className="editorial-card min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-white/10 shadow-[var(--soft-shadow)] sm:min-h-[30rem]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(6, 9, 8, 0.08), rgba(6, 9, 8, 0.62)), url('${siteMedia.project_problem.imageUrl}')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div
          className="editorial-card order-2 min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-white/10 shadow-[var(--soft-shadow)] sm:min-h-[30rem] lg:order-1"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(6, 9, 8, 0.1), rgba(6, 9, 8, 0.64)), url('${siteMedia.project_idea.imageUrl}')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="order-1 space-y-5 lg:order-2">
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--brand)]">
            La idea
          </p>
          <h2 className="max-w-[12ch] text-balance text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
            Una herramienta simple para personas y locales.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72 text-justify sm:text-left">
            <p>
              Para quien tiene hambre, ZylenPick reduce la decisión a lo
              importante: foto, plato, local, precio y recogida.
            </p>
            <p>
              Para el local, abre una puerta más visible y más sencilla para
              recibir pedidos sin depender de una experiencia fría o complicada.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Como funciona
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
            Tres pasos claros para decidir rápido y recoger sin vueltas.
          </h2>
        </div>
        <StoryCardSwap steps={journeySteps} />
      </section>
    </div>
  );
}
