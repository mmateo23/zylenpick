import Link from "next/link";

import { Logo } from "@/components/branding/logo";

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
        className="spotlight-panel overflow-hidden rounded-[2.8rem] border border-white/10 px-6 py-8 shadow-[var(--shadow)] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(6, 9, 8, 0.16), rgba(6, 9, 8, 0.84)), url('https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1800&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="max-w-3xl">
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
            Pedir comida para recoger debería ser fácil.
          </h1>
          <p className="mt-6 max-w-[40rem] text-lg leading-8 text-white/78 sm:text-xl">
            ZylenPick nace para hacer más simple descubrir restaurantes locales,
            pedir sin fricción y recoger cerca de casa sin depender siempre del delivery.
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
            Pedir para recoger suele sentirse peor de lo que debería.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72">
            <p>
              Muchas plataformas están pensadas para delivery. La recogida queda
              como una opción secundaria, poco clara y con demasiada fricción.
            </p>
            <p>
              Encontrar restaurantes cercanos, entender cómo recoger y decidir
              rápido no siempre es sencillo, incluso cuando el local está a unos
              minutos andando.
            </p>
          </div>
        </div>
        <div
          className="editorial-card min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-white/10 shadow-[var(--soft-shadow)] sm:min-h-[30rem]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(6, 9, 8, 0.08), rgba(6, 9, 8, 0.62)), url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80')",
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
            Una forma más simple de recoger comida local.
          </h2>
          <div className="max-w-xl space-y-4 text-base leading-7 text-white/72">
            <p>
              ZylenPick quiere conectar a las personas con restaurantes cercanos
              que merecen ser descubiertos, con una experiencia pensada para
              pedir bien y recoger sin confusión.
            </p>
            <p>
              La idea es combinar cercanía, hostelería local y una experiencia
              digital cuidada para que caminar a por tu comida vuelva a sentirse
              natural.
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
            Tres pasos claros para una experiencia local mejor resuelta.
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {journeySteps.map((step) => (
            <article
              key={step.title}
              className="hover-lift-card overflow-hidden rounded-[2rem] border border-white/10 shadow-[var(--soft-shadow)]"
            >
              <div
                className="min-h-[18rem]"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(6, 9, 8, 0.06), rgba(6, 9, 8, 0.66)), url('${step.imageUrl}')`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
              <div className="-mt-24 min-h-[11rem] bg-[linear-gradient(180deg,rgba(6,9,8,0),rgba(6,9,8,0.62)_18%,rgba(6,9,8,0.92))] px-6 pb-6 pt-12">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--brand)]">
                  {step.title}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">{step.title}</p>
                <p className="mt-3 max-w-[24ch] text-sm leading-6 text-white/72">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
