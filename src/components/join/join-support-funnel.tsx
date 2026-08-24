"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  Handshake,
  Info,
  Landmark,
  MapPin,
  Megaphone,
  MoreHorizontal,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { useState } from "react";

import { JoinForm } from "@/components/join/join-form";
import {
  JOIN_PLAN_INTEREST_OPTIONS,
  type JoinInterest,
  type JoinPlanInterest,
} from "@/features/join/join-interest";
import {
  defaultSiteFunnelSettings,
  isLaunchPriceActive,
  type PricingOfferKey,
  type SiteFunnelPricingConfig,
  type SiteFunnelPricingOfferConfig,
} from "@/features/funnel/site-funnel-settings";

const optionImages: Record<JoinPlanInterest, string> = {
  free_presence:
    "https://images.unsplash.com/photo-1561632669-7f55f7975606?q=80&w=1600&auto=format&fit=crop",
  improve_presence:
    "https://images.unsplash.com/photo-1584384689201-e0bcbe2c7f1d?q=80&w=1400&auto=format&fit=crop",
  more_visibility:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop",
  guided_growth:
    "https://images.unsplash.com/photo-1528459105426-b9548367069b?q=85&w=1600&auto=format&fit=crop",
};

const optionAlt: Record<JoinPlanInterest, string> = {
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
  pricing?: SiteFunnelPricingConfig;
};

const pricingByInterest: Partial<Record<JoinPlanInterest, PricingOfferKey>> = {
  improve_presence: "basic",
  more_visibility: "oro",
  guided_growth: "titanio",
};

const optionIconByInterest = {
  free_presence: Store,
  improve_presence: Camera,
  more_visibility: Megaphone,
  guided_growth: Handshake,
} as const;

const includedBenefitsByInterest: Record<JoinPlanInterest, number> = {
  free_presence: 3,
  improve_presence: 6,
  more_visibility: 9,
  guided_growth: 12,
};

type BillingCycle = "monthly" | "annual";

const serviceMenuItems = [
  {
    title: "Alta profesional",
    description: "Ficha, carta visual y primera selección preparadas contigo.",
    icon: Store,
    kind: "fixed",
    priceCents: 9_900,
    suffix: "pago único",
    interest: "improve_presence",
  },
  {
    title: "Chip destacado",
    description: "Una señal temporal para dar contexto y visibilidad a un plato.",
    icon: Sparkles,
    kind: "fixed",
    priceCents: 200,
    suffix: "por hora",
    interest: "more_visibility",
  },
  {
    title: "Sesión de fotos",
    description: "Una sesión breve para renovar la imagen de tus productos.",
    icon: Camera,
    kind: "fixed",
    priceCents: 4_000,
    suffix: "por sesión",
    interest: "improve_presence",
  },
  {
    title: "Eventos",
    description: "Presencia editorial para ferias, mercados y momentos locales.",
    icon: CalendarDays,
    kind: "consultive",
    priceLabel: "A medida",
    interest: "commercial_consultation",
  },
  {
    title: "Turismo",
    description: "Rutas y contenidos que conectan gastronomía, ciudad y visita.",
    icon: MapPin,
    kind: "consultive",
    priceLabel: "A medida",
    interest: "commercial_consultation",
  },
  {
    title: "Instituciones",
    description: "Propuestas para asociaciones, entidades y comercio local.",
    icon: Landmark,
    kind: "consultive",
    priceLabel: "Consultar",
    interest: "commercial_consultation",
  },
] as const satisfies ReadonlyArray<{
  title: string;
  description: string;
  icon: typeof Store;
  kind: "fixed" | "consultive";
  priceCents?: number;
  priceLabel?: string;
  suffix?: string;
  interest: JoinInterest;
}>;

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

type JoinOption = (typeof JOIN_PLAN_INTEREST_OPTIONS)[number];

function OfferCardPrice({
  offer,
  billingCycle,
}: {
  offer?: SiteFunnelPricingOfferConfig | null;
  billingCycle: BillingCycle;
}) {
  if (!offer) {
    return (
      <div className="flex flex-col items-start">
        <p className="flex items-baseline gap-1 text-[#741314]">
          <span className="text-4xl font-black leading-none tracking-[-0.06em]">0 €</span>
          <span className="text-xs font-bold">/ mes</span>
        </p>
        <span className="mt-1 text-[11px] font-semibold text-[#6f6f6f]">
          Siempre gratis
        </span>
      </div>
    );
  }

  const isActive = isLaunchPriceActive(offer);
  const displayPrice = isActive
    ? offer.discountedPriceCents
    : offer.originalPriceCents;
  const billedPrice =
    billingCycle === "annual"
      ? Math.round((displayPrice * 10) / 12)
      : displayPrice;
  const annualTotal = displayPrice * 10;

  return (
    <div className="flex shrink-0 flex-col items-start gap-1">
      {isActive ? (
        <span className="text-xs font-semibold text-[#777] line-through">
          {formatPrice(offer.originalPriceCents)} / mes
        </span>
      ) : null}
      <span className="text-4xl font-black leading-none tracking-[-0.06em] text-[#741314]">
        {formatPrice(billedPrice)}
      </span>
      <span className="text-left text-[10px] font-semibold leading-4 text-[#6f6f6f]">
        {billingCycle === "annual"
          ? `${formatPrice(annualTotal)} al año`
          : "al mes"}
        <br />
        IVA incluido
      </span>
    </div>
  );
}

function JoinOfferPost({
  index,
  option,
  offer,
  billingCycle,
  selected,
  onSelect,
}: {
  index: number;
  option: JoinOption;
  offer?: SiteFunnelPricingOfferConfig | null;
  billingCycle: BillingCycle;
  selected: boolean;
  onSelect: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardId = `join-offer-${option.value}`;
  const OptionIcon = optionIconByInterest[option.value];
  const visibleBenefits = [
    ...JOIN_PLAN_INTEREST_OPTIONS.slice(0, index).map((previousOption) => ({
      label: `Todo lo de ${previousOption.title}`,
      inherited: true,
    })),
    ...option.features.map((feature) => ({ label: feature, inherited: false })),
  ];

  return (
    <article className="relative h-[min(82svh,46rem)] min-h-[38rem] w-full max-w-[29rem] [perspective:1200px]">
      <div
        className="relative h-full w-full transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className={`absolute inset-0 grid overflow-hidden rounded-[1.65rem] border bg-white text-[#111111] shadow-[0_28px_70px_rgba(56,25,50,0.16)] [backface-visibility:hidden] ${
            selected ? "border-[#741314] ring-2 ring-[#741314]/20" : "border-black/8"
          }`}
          style={{ gridTemplateRows: "4.25rem minmax(0, 1fr) auto" }}
          aria-hidden={isFlipped}
        >
          <header className="flex items-center justify-between gap-3 border-b border-black/8 bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#741314]">
                <Image
                  src="/icons/pickyalo-app.svg"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-5 text-[#111111]">Pickyalo</p>
                <p className="truncate text-xs leading-4 text-[#6f6f6f]">
                  {option.eyebrow}
                </p>
              </div>
            </div>
            <button
              type="button"
              tabIndex={isFlipped ? -1 : 0}
              aria-label="Ver servicios incluidos"
              aria-expanded={isFlipped}
              aria-controls={`${cardId}-services`}
              onClick={() => setIsFlipped(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#4b4b4b] transition hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
            >
              <MoreHorizontal aria-hidden="true" className="h-6 w-6" />
            </button>
          </header>

          <div className="relative min-h-0 overflow-hidden bg-[#101010]">
            <Image
              src={optionImages[option.value]}
              alt={optionAlt[option.value]}
              fill
              sizes="(min-width: 1024px) 30rem, (min-width: 640px) 70vw, 100vw"
              className="object-cover"
            />
          </div>

          <section className="space-y-3 border-t border-black/8 bg-white px-4 pb-4 pt-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                tabIndex={isFlipped ? -1 : 0}
                aria-expanded={isFlipped}
                aria-controls={`${cardId}-services`}
                onClick={() => setIsFlipped(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 px-3.5 text-xs font-bold text-[#252525] transition hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
                aria-label="Ver servicios incluidos"
              >
                <Info aria-hidden="true" className="h-5 w-5" />
                Qué incluye
              </button>
              <button
                type="button"
                tabIndex={isFlipped ? -1 : 0}
                onClick={onSelect}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#741314] text-[#FDE3AD] shadow-[0_14px_30px_rgba(116,19,20,0.30)] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
                aria-label={option.cta}
              >
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {offer && isLaunchPriceActive(offer) && offer.label ? (
              <p className="line-clamp-2 w-fit rounded-full border border-[#741314]/20 bg-[#FFF7E8] px-2.5 py-1 text-[10px] font-black uppercase leading-4 text-[#741314]">
                {offer.label}
              </p>
            ) : null}

            <div className="space-y-1.5">
              <h3 className="line-clamp-2 min-w-0 text-lg font-semibold leading-5 tracking-[-0.04em] text-[#111111]">
                {option.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-5 text-[#5f5f5f]">
                {option.subtitle}
              </p>
              <div className="flex items-end justify-between gap-4 border-t border-black/8 pt-3">
                <OfferCardPrice offer={offer} billingCycle={billingCycle} />
                <span className="max-w-[7.5rem] text-right text-[11px] font-bold leading-4 text-[#741314]">
                  {includedBenefitsByInterest[option.value]} ventajas incluidas
                </span>
              </div>
            </div>
          </section>
        </div>

        <div
          id={`${cardId}-services`}
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-[1.65rem] border bg-[#FFF7E8] text-[#111111] shadow-[0_28px_70px_rgba(56,25,50,0.16)] [backface-visibility:hidden] ${
            selected ? "border-accent ring-2 ring-accent/20" : "border-border-strong"
          }`}
          style={{ transform: "rotateY(180deg)" }}
          aria-hidden={!isFlipped}
        >
          <header className="flex items-center justify-between gap-3 border-b border-[#741314]/15 bg-[#FFF7E8] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#741314]">
                <Image src="/icons/pickyalo-app.svg" alt="" fill sizes="40px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-5 text-[#381932]">Servicios incluidos</p>
                <p className="truncate text-xs leading-4 text-[#741314]/65">0{index + 1} · {option.title}</p>
              </div>
            </div>
            <button
              type="button"
              tabIndex={isFlipped ? 0 : -1}
              onClick={() => setIsFlipped(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#741314] transition hover:bg-[#741314]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
              aria-label="Volver a la fotografía"
            >
              <ArrowLeft aria-hidden="true" className="h-6 w-6" />
            </button>
          </header>

          <div className="flex flex-1 flex-col justify-center px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-[1rem] border border-[#741314]/18 bg-[#741314] text-[#FDE3AD] shadow-[0_12px_24px_rgba(116,19,20,0.14)]">
                <OptionIcon aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <span className="rounded-full border border-[#741314]/18 bg-[#FDE3AD] px-3 py-1.5 text-xs font-black text-[#741314]">
                {includedBenefitsByInterest[option.value]} ventajas
              </span>
            </div>
            <h3 className="mt-4 text-3xl font-black leading-tight text-[#381932] sm:text-4xl">
              {option.title}
            </h3>
            <div className="mt-4 border-y border-[#741314]/14 py-3">
              <OfferCardPrice offer={offer} billingCycle={billingCycle} />
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#741314]/70">
              {index === 0 ? "Incluye" : "Añade sobre el plan anterior"}
            </p>
            <ul className="mt-3 grid gap-2.5 text-sm font-semibold leading-5 text-[#381932]">
              {visibleBenefits.map((benefit) => (
                <li key={benefit.label} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                      benefit.inherited
                        ? "border border-[#741314]/25 bg-transparent text-[#741314]"
                        : "bg-[#741314] text-[#FFF7E8]"
                    }`}
                  >
                    <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className={benefit.inherited ? "text-[#741314]/72" : undefined}>
                    {benefit.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <footer className="border-t border-[#741314]/15 bg-[#FFF7E8] p-4">
            <button
              type="button"
              tabIndex={isFlipped ? 0 : -1}
              onClick={onSelect}
              className={`${primaryButtonClassName} w-full`}
            >
              {option.cta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </footer>
        </div>
      </div>
    </article>
  );
}

function PlanConnector({ index }: { index: number }) {
  if (index >= JOIN_PLAN_INTEREST_OPTIONS.length - 1) {
    return null;
  }

  return (
    <>
      <span
        className={`pointer-events-none absolute -right-5 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#741314]/18 bg-[#FFF7E8] text-[#741314] shadow-sm xl:grid ${
          index === 0 || index === 2 ? "md:grid" : ""
        }`}
        aria-hidden="true"
      >
        <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
      </span>
      {index === 1 ? (
        <span
          className="pointer-events-none absolute -bottom-11 left-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 place-items-center rounded-full border border-[#741314]/18 bg-[#FFF7E8] text-[#741314] shadow-sm md:grid xl:hidden"
          aria-hidden="true"
        >
          <ArrowDown className="h-4 w-4" strokeWidth={1.8} />
        </span>
      ) : null}
    </>
  );
}

function CeramicDivider() {
  return (
    <div
      className="relative my-16 h-20 overflow-hidden rounded-[1.25rem] border border-[#741314]/18 bg-[#741314] sm:h-24 lg:my-20"
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-around gap-3 px-2 opacity-95 sm:gap-8 sm:px-6">
        {Array.from({ length: 7 }, (_, index) => (
          <Image
            key={index}
            src="/home/zonas/talavera-elements/talavera_ornamento_azulejo_transparent.png"
            alt=""
            width={112}
            height={112}
            sizes="112px"
            className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
          />
        ))}
      </div>
    </div>
  );
}

function ServicePrice({
  item,
  pricing,
}: {
  item: (typeof serviceMenuItems)[number];
  pricing: SiteFunnelPricingConfig;
}) {
  if (item.kind === "consultive") {
    return (
      <span className="text-sm font-black uppercase text-[#741314]">
        {item.priceLabel}
      </span>
    );
  }

  const offer =
    item.title === "Alta profesional"
      ? pricing.professional_onboarding
      : null;
  const isActive = offer ? isLaunchPriceActive(offer) : false;
  const originalPriceCents = offer?.originalPriceCents ?? item.priceCents;
  const displayPriceCents = isActive
    ? offer?.discountedPriceCents ?? item.priceCents
    : item.priceCents;

  return (
    <div className="text-right">
      {isActive && originalPriceCents ? (
        <p className="text-xs font-semibold text-text-muted line-through">
          {formatPrice(originalPriceCents)}
        </p>
      ) : null}
      <p className="text-xl font-black leading-none text-[#741314]">
        {formatPrice(displayPriceCents)}
      </p>
      <p className="mt-1 text-[10px] font-semibold leading-4 text-text-muted">
        {item.suffix}
        <br />
        IVA incluido
      </p>
    </div>
  );
}

export function JoinSupportFunnel({
  heroImageUrl = "/cart/empty-cart-talavera.jpg",
  pricing = defaultSiteFunnelSettings.pricing,
}: JoinSupportFunnelProps) {
  const [interest, setInterest] = useState<JoinInterest | "">("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

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
            <div className="absolute inset-0 bg-gradient-to-t from-[#24110E]/88 via-[#24110E]/12 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-[#FFF7E8] [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] sm:p-8">
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

        <div className="mt-10 flex flex-col gap-4 border-y border-border-subtle py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-text-primary">Cómo prefieres verlo</p>
            <p className="mt-1 text-sm text-text-secondary">
              Compara el coste mensual o el equivalente con pago anual.
            </p>
          </div>
          <div
            className="inline-flex w-fit rounded-full border border-[#741314]/18 bg-[#FFF7E8] p-1"
            role="group"
            aria-label="Ciclo de facturación"
          >
            <button
              type="button"
              aria-pressed={billingCycle === "monthly"}
              onClick={() => setBillingCycle("monthly")}
              className={`min-h-11 rounded-full px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] ${
                billingCycle === "monthly"
                  ? "bg-[#741314] text-[#FDE3AD]"
                  : "text-[#741314] hover:bg-[#741314]/7"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              aria-pressed={billingCycle === "annual"}
              onClick={() => setBillingCycle("annual")}
              className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] ${
                billingCycle === "annual"
                  ? "bg-[#741314] text-[#FDE3AD]"
                  : "text-[#741314] hover:bg-[#741314]/7"
              }`}
            >
              Anual
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase ${
                  billingCycle === "annual"
                    ? "bg-[#FDE3AD] text-[#741314]"
                    : "bg-[#741314]/9 text-[#741314]"
                }`}
              >
                <Clock3 aria-hidden="true" className="h-3 w-3" />
                2 meses gratis
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid justify-items-center gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-4 xl:gap-x-6">
          {JOIN_PLAN_INTEREST_OPTIONS.map((option, index) => {
            const isSelected = interest === option.value;
            const pricingKey = pricingByInterest[option.value];
            const pricingOffer = pricingKey ? pricing[pricingKey] : null;

            return (
              <div key={option.value} className="relative flex w-full justify-center">
                <JoinOfferPost
                  index={index}
                  option={option}
                  offer={pricingOffer}
                  billingCycle={billingCycle}
                  selected={isSelected}
                  onSelect={() => selectInterest(option.value)}
                />
                <PlanConnector index={index} />
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => selectInterest("commercial_consultation")}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#741314] underline decoration-[#741314]/35 underline-offset-4 transition hover:decoration-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-4"
          >
            ¿Dudas sobre qué plan elegir? Habla con nosotros
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>

          <p className="mt-2 text-xs font-semibold text-text-muted">
            Los importes anuales se facturan como diez mensualidades. Todos los precios indicados incluyen IVA.
          </p>
        </div>

        <CeramicDivider />

        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14" aria-labelledby="join-services-title">
          <div>
            <p className="text-xs font-black uppercase text-accent">Carta de servicios</p>
            <h3 id="join-services-title" className="mt-4 max-w-[10ch] text-balance text-4xl font-black leading-tight text-text-primary sm:text-5xl">
              Ayuda concreta, cuando la necesitas.
            </h3>
            <p className="mt-5 max-w-[31rem] text-base leading-7 text-text-secondary">
              Servicios puntuales para empezar, mejorar una imagen o participar en una iniciativa local sin cambiar de plan.
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.25rem] border border-[#741314]/18 bg-[#FFF7E8]">
            {serviceMenuItems.map((item, index) => {
              const ServiceIcon = item.icon;
              const professionalOffer =
                item.title === "Alta profesional"
                  ? pricing.professional_onboarding
                  : null;
              const showLaunchLabel =
                professionalOffer &&
                isLaunchPriceActive(professionalOffer) &&
                professionalOffer.label;

              return (
                <article
                  key={item.title}
                  className={`grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 ${
                    index > 0 ? "border-t border-[#741314]/14" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#741314] text-[#FDE3AD]">
                      <ServiceIcon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-black text-[#381932]">{item.title}</h4>
                        {showLaunchLabel ? (
                          <span className="rounded-full border border-[#741314]/18 bg-[#FDE3AD] px-2.5 py-1 text-[10px] font-black uppercase text-[#741314]">
                            {professionalOffer.label}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 max-w-[42rem] text-sm leading-6 text-[#381932]/68">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 pl-[3.75rem] sm:justify-end sm:pl-0">
                    <ServicePrice item={item} pricing={pricing} />
                    <button
                      type="button"
                      onClick={() => selectInterest(item.interest)}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#741314]/20 text-[#741314] transition hover:bg-[#741314] hover:text-[#FDE3AD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
                      aria-label={`Consultar ${item.title}`}
                    >
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
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
