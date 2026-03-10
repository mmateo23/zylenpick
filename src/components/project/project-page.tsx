import Link from "next/link";

import { Logo } from "@/components/branding/logo";
import { LightRays } from "@/components/project/light-rays";
import { StoryCardSwap } from "@/components/project/story-card-swap";

const journeySteps = [
  {
    title: "Descubre",
    description: "Explora restaurantes cerca de ti y encuentra opciones reales de tu zona.",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Pide",
    description: "Haz tu pedido en segundos con una experiencia clara y bien resuelta.",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Recoge",
    description: "Pasa a por tu comida cuando esté lista y vuelve a caminar por tu ciudad.",
    imageUrl:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
  },
];

export function ProjectPage() {
  return (
    <div className="space-y-12 lg:space-y-20">
      <section
        className="spotlight-panel relative overflow-hidden rounded-[2.8rem] border border-white/10 px-6 py-8 shadow-[var(--shadow)] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(6, 9, 8, 0.34), rgba(6, 9, 8, 0.88)), url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80')",
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
          <h1 className="mt-5 max-w-[11ch] text-balance text-5xl font-semibold leading-[0.92] text-white sm:text-6xl lg:text-7xl">
            Podrías pedir delivery. Pero a veces apetece algo mejor.
          </h1>
          <p className="mt-6 max-w-[40rem] text-lg leading-8 text-white/78 sm:text-xl">
            Hay momentos para quedarse en el sofá y otros para salir a por algo
            que realmente merece la pena. ZylenPick quiere estar en ese segundo
            momento: comida local, cerca, bien elegida y fácil de recoger.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cities"
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

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--brand)]">
            El problema
          </p>
          <h2 className="max-w-[11ch] text-balance text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
            Pedir para recoger debería sentirse tan natural como caminar por tu barrio.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72">
            <p>
              Muchas plataformas están diseñadas alrededor del delivery. La
              recogida queda como una opción secundaria, confusa y poco cuidada.
            </p>
            <p>
              Y sin embargo, cuando un restaurante está cerca y de verdad te
              apetece, salir a por ello puede ser parte de una experiencia más
              real, más directa y mejor resuelta.
            </p>
          </div>
        </div>
        <div
          className="editorial-card min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-white/10 shadow-[var(--soft-shadow)] sm:min-h-[30rem]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(6, 9, 8, 0.08), rgba(6, 9, 8, 0.62)), url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80')",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div
          className="editorial-card order-2 min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-white/10 shadow-[var(--soft-shadow)] sm:min-h-[30rem] lg:order-1"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(6, 9, 8, 0.1), rgba(6, 9, 8, 0.64)), url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="order-1 space-y-5 lg:order-2">
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--brand)]">
            La idea
          </p>
          <h2 className="max-w-[12ch] text-balance text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
            Una forma más simple de descubrir comida local y recogerla bien.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72">
            <p>
              ZylenPick quiere ayudarte a encontrar restaurantes cercanos,
              elegir algo que realmente quieres y resolver la recogida con una
              experiencia clara, ligera y bien diseñada.
            </p>
            <p>
              Está pensada para gente activa, para ciudad real, para decisiones
              conscientes y para esa mezcla de cercanía, movimiento y hostelería
              local que muchas veces se pierde en las apps tradicionales.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Cómo funciona
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
            Tres pasos claros para convertir una decisión cotidiana en una experiencia mejor.
          </h2>
        </div>
        <StoryCardSwap steps={journeySteps} />
      </section>
    </div>
  );
}
