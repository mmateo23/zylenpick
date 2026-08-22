"use client";

import Image from "next/image";
import { ArrowRight, MapPin, ShoppingBag, Sparkles, Store } from "lucide-react";
import { useState } from "react";

import { JoinForm } from "@/components/join/join-form";
import {
  JOIN_INTEREST_OPTIONS,
  type JoinInterest,
} from "@/features/join/join-interest";

const optionImages: Record<JoinInterest, string> = {
  free_presence:
    "https://images.unsplash.com/photo-1561632669-7f55f7975606?q=80&w=1600&auto=format&fit=crop",
  improve_presence:
    "https://images.unsplash.com/photo-1584384689201-e0bcbe2c7f1d?q=80&w=1400&auto=format&fit=crop",
  more_visibility:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop",
  guided_growth:
    "https://images.unsplash.com/photo-1528459105426-b9548367069b?q=85&w=1600&auto=format&fit=crop",
};

const optionAlt: Record<JoinInterest, string> = {
  free_presence: "Escaparate de un local cercano",
  improve_presence: "Mesa preparada con producto local",
  more_visibility: "Plato presentado para una selección visual",
  guided_growth: "Equipo de un local preparando su propuesta",
};

const primaryButtonClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-cta bg-cta px-5 py-3 text-center text-sm font-bold text-cta-text transition hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2";

const secondaryButtonClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-strong px-5 py-3 text-center text-sm font-bold text-text-primary transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2";

type JoinSupportFunnelProps = {
  heroImageUrl?: string;
};

export function JoinSupportFunnel({
  heroImageUrl = "/cart/empty-cart-talavera.jpg",
}: JoinSupportFunnelProps) {
  const [interest, setInterest] = useState<JoinInterest | "">("");

  const selectInterest = (nextInterest: JoinInterest) => {
    setInterest(nextInterest);

    window.requestAnimationFrame(() => {
      document.getElementById("solicitud")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="min-w-0">
      <section className="grid min-h-[38rem] items-center gap-10 border-b border-border-subtle pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-20">
        <div className="max-w-[45rem]">
          <p className="text-xs font-black uppercase text-accent">
            Elige cómo quieres crecer
          </p>
          <h1 className="mt-5 max-w-[14ch] text-balance text-5xl font-black leading-[0.96] text-text-primary sm:text-6xl lg:text-[4rem]">
            Tu local pone la comida. Pickyalo hace que la descubran.
          </h1>
          <p className="mt-6 max-w-[42rem] text-base font-medium leading-7 text-text-secondary sm:text-lg sm:leading-8">
            Empieza apareciendo gratis o deja que te ayudemos a cuidar tu carta,
            destacar tus mejores platos y llegar a nuevas personas sin tener que
            aprender de publicidad o redes sociales.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => selectInterest("free_presence")}
              className={primaryButtonClassName}
            >
              Quiero aparecer en Pickyalo
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => selectInterest("more_visibility")}
              className={secondaryButtonClassName}
            >
              Quiero que me ayudéis a destacar
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[34rem]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-strong shadow-[var(--shadow-soft)]">
            <Image
              src={heroImageUrl}
              alt="Profesional de un local en su cocina con la identidad Pickyalo"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#24110E]/78 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <span className="inline-flex rounded-full border border-white/45 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                Selección local
              </span>
              <p className="mt-4 max-w-[15ch] text-3xl font-black leading-none">
                Lo que haces bien, puesto delante de quien busca.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-strong px-4 py-3 shadow-[var(--shadow-soft)] sm:-left-8">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
              <Store aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-accent">Pickyalo</p>
              <p className="text-sm font-bold text-text-primary">Tu escaparate, más cerca</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24" aria-labelledby="join-comparison-title">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase text-accent">Una diferencia sencilla</p>
          <h2 id="join-comparison-title" className="mt-4 text-balance text-4xl font-black leading-tight text-text-primary sm:text-5xl">
            Del escaparate de tu calle al escaparate de toda tu zona.
          </h2>
        </div>

        <div className="mt-10 grid border-y border-border-subtle lg:grid-cols-2">
          <article className="py-8 lg:border-r lg:border-border-subtle lg:py-12 lg:pr-12">
            <span className="text-sm font-black text-accent">01</span>
            <h3 className="mt-5 text-3xl font-black text-text-primary">Tu local hoy</h3>
            <p className="mt-4 max-w-[32rem] text-lg leading-8 text-text-secondary">
              Te encuentra quien pasa por delante, ya te conoce o te busca directamente.
            </p>
          </article>
          <article className="border-t border-border-subtle py-8 lg:border-t-0 lg:py-12 lg:pl-12">
            <span className="text-sm font-black text-accent">02</span>
            <h3 className="mt-5 text-3xl font-black text-text-primary">Con Pickyalo</h3>
            <p className="mt-4 max-w-[32rem] text-lg leading-8 text-text-secondary">
              Llevamos el escaparate de tus platos a personas de tu zona que ya están pensando qué comer.
            </p>
          </article>
        </div>

        <p className="mx-auto mt-10 max-w-[28ch] text-balance text-center text-3xl font-black leading-tight text-accent sm:text-4xl">
          No tienes que salir a buscar clientes. Tus platos salen a encontrarlos.
        </p>
      </section>

      <section id="ayuda" className="scroll-mt-28 border-t border-border-subtle py-16 lg:py-24" aria-labelledby="join-help-title">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase text-accent">Opciones de ayuda</p>
          <h2 id="join-help-title" className="mt-4 text-balance text-4xl font-black leading-tight text-text-primary sm:text-5xl">
            Empieza donde estás. Crecemos desde ahí.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-border-subtle border-y border-border-subtle">
          {JOIN_INTEREST_OPTIONS.map((option, index) => {
            const isSelected = interest === option.value;
            const imageFirst = index % 2 === 1;
            const isVisibilityOption = option.value === "more_visibility";

            return (
              <article
                key={option.value}
                className={`grid gap-8 py-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-16 ${
                  isVisibilityOption ? "bg-surface/45" : ""
                }`}
              >
                <div className={imageFirst ? "lg:order-1" : "lg:order-2"}>
                  <div className="relative aspect-[16/11] overflow-hidden rounded-lg bg-surface-strong">
                    <Image
                      src={optionImages[option.value]}
                      alt={optionAlt[option.value]}
                      fill
                      sizes="(min-width: 1024px) 48vw, 100vw"
                      className="object-cover transition duration-500 hover:scale-[1.025] motion-reduce:transform-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#24110E]/35 via-transparent to-transparent" />
                    {isVisibilityOption ? (
                      <span className="absolute bottom-4 left-4 rounded-full border border-white/50 bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                        Más ojos sobre lo que haces mejor
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-accent">0{index + 1}</span>
                    <span className="h-px w-10 bg-border-strong" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase text-text-muted">{option.eyebrow}</span>
                  </div>
                  <h3 className="mt-5 text-4xl font-black leading-tight text-text-primary sm:text-5xl">
                    {option.title}
                  </h3>
                  <p className="mt-4 max-w-[32rem] text-xl font-bold leading-8 text-text-secondary">
                    {option.subtitle}
                  </p>
                  <ul className="mt-6 grid gap-3 text-base font-medium text-text-secondary">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectInterest(option.value)}
                    className={`mt-8 ${isSelected ? primaryButtonClassName : secondaryButtonClassName}`}
                  >
                    {option.cta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid items-center gap-10 border-b border-border-subtle py-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:py-24" aria-labelledby="join-preview-title">
        <div>
          <p className="text-xs font-black uppercase text-accent">Demostración visual</p>
          <h2 id="join-preview-title" className="mt-4 text-balance text-4xl font-black leading-tight text-text-primary sm:text-5xl">
            Así puede aparecer tu local.
          </h2>
          <p className="mt-5 max-w-[34rem] text-lg leading-8 text-text-secondary">
            Una imagen clara, el nombre de tu local y una selección fácil de entender. Sin ruido alrededor.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full border border-accent-border bg-accent-soft px-3 py-2 text-xs font-bold text-accent">Para decidir en segundos</span>
            <span className="rounded-full border border-border-subtle bg-surface-strong px-3 py-2 text-xs font-bold text-text-secondary">Selección editorial</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[48rem]">
          <article className="grid overflow-hidden rounded-lg border border-border-subtle bg-surface-strong shadow-[var(--shadow-soft)] sm:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[22rem] sm:min-h-[30rem]">
              <Image
                src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop"
                alt="Plato de pasta mostrado como selección destacada"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full border border-white/45 bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                Plato destacado
              </span>
            </div>
            <div className="flex flex-col justify-between p-6 sm:p-7">
              <div>
                <p className="text-xs font-black uppercase text-accent">Tu local</p>
                <h3 className="mt-4 text-3xl font-black leading-tight text-text-primary">Una imagen que abre el apetito.</h3>
                <p className="mt-4 text-base leading-7 text-text-secondary">El producto primero. La información necesaria después. Todo listo para recoger.</p>
              </div>
              <div className="mt-8 grid gap-3 border-t border-border-subtle pt-5 text-sm font-bold text-text-primary">
                <span className="flex items-center gap-3"><MapPin aria-hidden="true" className="h-5 w-5 text-accent" /> Local cercano</span>
                <span className="flex items-center gap-3"><ShoppingBag aria-hidden="true" className="h-5 w-5 text-accent" /> Preparado para recoger</span>
                <span className="flex items-center gap-3"><Sparkles aria-hidden="true" className="h-5 w-5 text-accent" /> Selección cuidada</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="py-16 text-center lg:py-24">
        <p className="mx-auto max-w-[38ch] text-balance text-3xl font-black leading-tight text-text-primary sm:text-5xl">
          No necesitas aprender herramientas nuevas, publicar todos los días, preparar repartos ni gestionar otra aplicación complicada.
        </p>
        <p className="mx-auto mt-6 max-w-[38rem] text-xl font-bold leading-8 text-accent sm:text-2xl">
          Tú preparas la comida. Nosotros te ayudamos a enseñarla.
        </p>
      </section>

      <section id="solicitud" className="scroll-mt-28 border-t border-border-subtle py-16 lg:py-24">
        <JoinForm interest={interest} onInterestChange={setInterest} />
      </section>
    </div>
  );
}
