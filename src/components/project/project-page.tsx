import Link from "next/link";

import { Logo } from "@/components/branding/logo";
import { LightRays } from "@/components/project/light-rays";
import { StoryCardSwap } from "@/components/project/story-card-swap";
import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

const valuePoints = [
  {
    positive: "Mas comida local",
    negative: "Menos delivery innecesario",
  },
  {
    positive: "Mas cerca",
    negative: "Menos espera",
  },
  {
    positive: "Mas ciudad",
    negative: "Menos algoritmo",
  },
  {
    positive: "Mas recogida real",
    negative: "Menos friccion",
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
        "Explora restaurantes cerca de ti y encuentra opciones reales de tu zona.",
      imageUrl: siteMedia.project_step_discover.imageUrl,
    },
    {
      title: "Pide",
      description:
        "Haz tu pedido en segundos con una experiencia clara y bien resuelta.",
      imageUrl: siteMedia.project_step_order.imageUrl,
    },
    {
      title: "Recoge",
      description:
        "Pasa a por tu comida cuando este lista y vuelve a caminar por tu ciudad.",
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
            <span className="block">Podrias pedir delivery.</span>
            <span className="mt-5 block">Pero a veces</span>
            <span className="block text-[color:var(--brand)]">APETECE</span>
            <span className="block">algo mejor.</span>
          </h1>
          <p className="mt-6 max-w-[28rem] text-lg font-medium tracking-[0.01em] text-white/76 sm:text-xl">
            Comida local. Cerca. Lista para recoger.
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
            Una forma mas clara de elegir lo que realmente te apetece.
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
            Pedir para recoger deberia sentirse tan natural como caminar por tu barrio.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72 text-justify sm:text-left">
            <p>
              Muchas plataformas estan disenadas alrededor del delivery. La
              recogida queda como una opcion secundaria, confusa y poco cuidada.
            </p>
            <p>
              Y sin embargo, cuando un restaurante esta cerca y de verdad te
              apetece, salir a por ello puede ser parte de una experiencia mas
              real, mas directa y mejor resuelta.
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
            Una forma mas simple de descubrir comida local y recogerla bien.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72 text-justify sm:text-left">
            <p>
              ZylenPick quiere ayudarte a encontrar restaurantes cercanos,
              elegir algo que realmente quieres y resolver la recogida con una
              experiencia clara, ligera y bien disenada.
            </p>
            <p>
              Esta pensada para gente activa, para ciudad real, para decisiones
              conscientes y para esa mezcla de cercania, movimiento y hosteleria
              local que muchas veces se pierde en las apps tradicionales.
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
            Tres pasos claros para convertir una decision cotidiana en una experiencia mejor.
          </h2>
        </div>
        <StoryCardSwap steps={journeySteps} />
      </section>
    </div>
  );
}
