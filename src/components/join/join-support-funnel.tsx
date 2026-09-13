"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Handshake,
  Landmark,
  MapPin,
  Megaphone,
  Plus,
  Sparkles,
  Store,
} from "lucide-react";
import { useState } from "react";

import styles from "./join-support-funnel.module.css";

import { JoinForm } from "@/components/join/join-form";
import { JoinPlansCarousel } from "@/components/join/join-plans-carousel";
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

const defaultOptionImages: Record<JoinPlanInterest, string> = {
  free_presence: "/home/zonas/talavera-poster-local.webp",
  improve_presence: "/cart/empty-cart-talavera.jpg",
  more_visibility:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop",
  guided_growth: "/home/project/project_post_pickyalo.png",
};

const optionAlt: Record<JoinPlanInterest, string> = {
  free_presence: "Talavera de la Reina como entorno local de Pickyalo",
  improve_presence: "Profesional de un local preparando su propuesta",
  more_visibility: "Plato presentado para una selección visual",
  guided_growth: "Profesional de hostelería acompañado por Pickyalo",
};

type JoinSupportFunnelProps = {
  heroImageUrl?: string;
  planImageUrls?: Partial<Record<JoinPlanInterest, string>>;
  showcaseImageUrl?: string;
  pricing?: SiteFunnelPricingConfig;
};

const pricingByInterest: Partial<Record<JoinPlanInterest, PricingOfferKey>> = {
  improve_presence: "basic",
  more_visibility: "oro",
  guided_growth: "titanio",
};

const planNameByInterest: Record<JoinPlanInterest, string> = {
  free_presence: "Free",
  improve_presence: "Suave",
  more_visibility: "Picante",
  guided_growth: "Fuego",
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
      <div className={styles.price}>
        <p><strong>0 €</strong><span>/ mes</span></p>
        <small>Siempre gratis</small>
      </div>
    );
  }

  const isActive = isLaunchPriceActive(offer);
  const monthlyPrice = isActive ? offer.discountedPriceCents : offer.originalPriceCents;
  const billedPrice = billingCycle === "annual" ? Math.round((monthlyPrice * 10) / 12) : monthlyPrice;

  return (
    <div className={styles.price}>
      {isActive ? <del>{formatPrice(offer.originalPriceCents)} / mes</del> : null}
      <p><strong>{formatPrice(billedPrice)}</strong><span>/ mes</span></p>
      <small>{billingCycle === "annual" ? `${formatPrice(monthlyPrice * 10)} al año · IVA incluido` : "IVA incluido"}</small>
    </div>
  );
}

function JoinOfferPost({
  index, option, offer, billingCycle, imageUrl, selected, onSelect,
}: {
  index: number;
  option: JoinOption;
  offer?: SiteFunnelPricingOfferConfig | null;
  billingCycle: BillingCycle;
  imageUrl: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const OptionIcon = optionIconByInterest[option.value];
  const recommended = option.value === "more_visibility";

  return (
    <article className={styles.plan} data-selected={selected} data-recommended={recommended} aria-labelledby={`plan-${option.value}`}>
      <header className={styles.planHeader}>
        <span><OptionIcon size={19} aria-hidden="true" />Plan {planNameByInterest[option.value]}</span>
        {recommended
          ? <span className={styles.recommended}><Sparkles size={14} aria-hidden="true" />Recomendado</span>
          : <span className={styles.planNumber}>0{index + 1}</span>}
      </header>
      <div className={styles.planPhoto}>
        <Image src={imageUrl} alt={optionAlt[option.value]} fill sizes="(min-width: 1100px) 240px, (min-width: 700px) 45vw, 92vw" className={styles.cover} />
        <span>{option.eyebrow}</span>
      </div>
      <div className={styles.planBody}>
        <h3 id={`plan-${option.value}`}>{option.title}</h3>
        <p className={styles.planSubtitle}>{option.subtitle}</p>
        <div className={styles.planPricing}>
          <OfferCardPrice offer={offer} billingCycle={billingCycle} />
          {offer && isLaunchPriceActive(offer) && offer.label
            ? <span className={styles.launchLabel}>{offer.label}</span>
            : null}
        </div>
        <div className={styles.benefitsIntro}>
          <span>{index === 0 ? "Incluye" : "Lo anterior, y además"}</span>
          <span>{includedBenefitsByInterest[option.value]} ventajas</span>
        </div>
        <ul className={styles.benefits}>
          {option.features.map((feature) => <li key={feature}><Check size={16} aria-hidden="true" /><span>{feature}</span></li>)}
        </ul>
        <button type="button" onClick={onSelect} className={styles.planCta}>
          {option.cta}<ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function ServicePrice({ item, pricing }: { item: (typeof serviceMenuItems)[number]; pricing: SiteFunnelPricingConfig }) {
  if (item.kind === "consultive") return <strong className={styles.consultPrice}>{item.priceLabel}</strong>;
  const offer = item.title === "Alta profesional" ? pricing.professional_onboarding : null;
  const isActive = offer ? isLaunchPriceActive(offer) : false;
  const originalPriceCents = offer?.originalPriceCents ?? item.priceCents;
  const displayPriceCents = isActive ? offer?.discountedPriceCents ?? item.priceCents : item.priceCents;

  return (
    <div className={styles.servicePrice}>
      {isActive && originalPriceCents ? <del>{formatPrice(originalPriceCents)}</del> : null}
      <strong>{formatPrice(displayPriceCents)}</strong>
      <small>{item.suffix}<br />IVA incluido</small>
    </div>
  );
}

export function JoinSupportFunnel({
  heroImageUrl = "/cart/empty-cart-talavera.jpg",
  planImageUrls,
  showcaseImageUrl = "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop",
  pricing = defaultSiteFunnelSettings.pricing,
}: JoinSupportFunnelProps) {
  const [interest, setInterest] = useState<JoinInterest | "">("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [formOpen, setFormOpen] = useState(false);

  const selectInterest = (nextInterest: JoinInterest) => {
    setInterest(nextInterest);
    setFormOpen(true);
    window.requestAnimationFrame(() => {
      document.getElementById("join-interest")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "center",
      });
      document.getElementById("join-interest")?.focus({ preventScroll: true });
    });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="join-title">
        <Image src={heroImageUrl} alt="Cocina y comercio local en Talavera" fill priority sizes="100vw" className={styles.heroPhoto} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Para negocios con algo bueno entre manos</p>
          <h1 id="join-title">Tu local.<em>En Pickyalo.</em></h1>
          <p className={styles.heroCopy}>Lo bueno que haces merece verse. Te ayudamos a enseñarlo, sin complicarte.</p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primary} onClick={() => selectInterest("free_presence")}>Quiero aparecer gratis<ArrowRight size={19} aria-hidden="true" /></button>
            <button type="button" className={styles.heroSecondary} onClick={() => selectInterest("more_visibility")}>Quiero destacar<ArrowRight size={19} aria-hidden="true" /></button>
          </div>
        </div>
        <div className={styles.heroFood} aria-hidden="true">
          <Image src="/home/hero/hero_dish_stack_transparent.png" alt="" fill sizes="(max-width: 700px) 150px, 360px" className={styles.contain} />
        </div>
        <a href="#como-funciona" className={styles.heroFoot}>De tu cocina, a su próxima parada<ArrowDown size={19} aria-hidden="true" /></a>
      </section>

      <nav className={styles.quickNav} aria-label="En esta página">
        <a href="#como-funciona"><span>01</span>Cómo te ayudamos</a>
        <a href="#ayuda"><span>02</span>Planes</a>
        <a href="#servicios"><span>03</span>Servicios</a>
        <a href="#solicitud"><span>04</span>Hablemos</a>
      </nav>

      <section id="como-funciona" className={styles.presentation} aria-labelledby="join-presentation-title">
        <div className={styles.showcase}>
          <div className={styles.medallion} aria-hidden="true"><Image src="/qr/ceramica-junto-al-tajo-relieve.png" alt="" fill sizes="(max-width: 700px) 280px, 450px" className={styles.contain} /></div>
          <figure className={styles.showcasePost}>
            <div className={styles.showcasePhoto}><Image src={showcaseImageUrl} alt="Presentación visual de una selección de platos" fill sizes="(max-width: 700px) 70vw, 380px" className={styles.cover} /></div>
            <figcaption><Image src="/icons/pickyalo-app.svg" alt="Pickyalo" width={32} height={32} /><span>Tu selección.<br /><strong>Con buena cara.</strong></span></figcaption>
          </figure>
          <div className={styles.croquettes} aria-hidden="true"><Image src="/home/assets/asset_croquetas_transparent.png" alt="" fill sizes="(max-width: 700px) 170px, 250px" className={styles.contain} /></div>
        </div>
        <div className={styles.presentationCopy}>
          <p className={styles.eyebrow}>01 / Un escaparate que sale a la calle</p>
          <h2 id="join-presentation-title">Tu cocina no cambia.<em>Su escaparate, sí.</em></h2>
          <p className={styles.bodyCopy}>Ya te conoce quien pasa por tu puerta. En Pickyalo, tus platos también se encuentran mientras alguien decide qué comer.</p>
          <ol className={styles.method}>
            <li><span>01</span><div><h3>Se ve lo que haces.</h3><p>Fotos que ponen el producto por delante.</p></div></li>
            <li><span>02</span><div><h3>Se entiende lo que ofreces.</h3><p>Una selección clara, sin cartas interminables.</p></div></li>
            <li><span>03</span><div><h3>Saben dónde encontrarte.</h3><p>Tu local, tu zona y cómo recogerlo.</p></div></li>
          </ol>
        </div>
      </section>

      <section id="ayuda" className={styles.plansSection} aria-labelledby="join-help-title">
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>02 / A tu ritmo</p>
              <h2 id="join-help-title">¿Cuánto quieres<em>dar que hablar?</em></h2>
              <p className={styles.bodyCopy}>Empieza gratis. Elige más ayuda cuando la necesites.</p>
            </div>
            <div className={styles.billing} role="group" aria-label="Ciclo de facturación">
              <button type="button" aria-pressed={billingCycle === "monthly"} onClick={() => setBillingCycle("monthly")}>Mensual</button>
              <button type="button" aria-pressed={billingCycle === "annual"} onClick={() => setBillingCycle("annual")}>Anual<span>2 meses gratis</span></button>
            </div>
          </div>
          <JoinPlansCarousel>
            {JOIN_PLAN_INTEREST_OPTIONS.map((option, index) => {
              const key = pricingByInterest[option.value];
              return <JoinOfferPost key={option.value} index={index} option={option} offer={key ? pricing[key] : null} billingCycle={billingCycle} imageUrl={planImageUrls?.[option.value] || defaultOptionImages[option.value]} selected={interest === option.value} onSelect={() => selectInterest(option.value)} />;
            })}
          </JoinPlansCarousel>
          <div className={styles.planHelp}>
            <button type="button" onClick={() => selectInterest("commercial_consultation")}>¿Dudas sobre qué plan elegir? <strong>Habla con nosotros</strong><ArrowRight size={18} aria-hidden="true" /></button>
            <p>{billingCycle === "annual" ? "El precio mensual equivale a 10 cuotas repartidas en 12 meses. Facturación anual." : "Precios finales con IVA incluido. Free sigue siendo gratis."}</p>
          </div>
        </div>
      </section>

      <div className={styles.ceramic} aria-hidden="true" />

      <section id="servicios" className={styles.servicesSection} aria-labelledby="join-services-title">
        <div className={styles.servicesHeading}>
          <p className={styles.eyebrow}>03 / Fuera de carta</p>
          <h2 id="join-services-title">Una ayuda<em>en su punto.</em></h2>
          <p className={styles.bodyCopy}>Una sesión de fotos, un evento o una idea para tu zona. También podemos trabajar algo concreto.</p>
          <div className={styles.landmark} aria-hidden="true"><Image src="/home/assets/drive_teatro_victoria.png" alt="" fill sizes="(max-width: 700px) 160px, 340px" className={styles.contain} /></div>
        </div>
        <div className={styles.serviceList}>
          {serviceMenuItems.map((item, index) => {
            const Icon = item.icon;
            return <article key={item.title} className={styles.service}>
              <span className={styles.serviceIcon}><Icon size={22} aria-hidden="true" /></span>
              <div className={styles.serviceCopy}><span className={styles.serviceIndex}>0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p></div>
              <ServicePrice item={item} pricing={pricing} />
              <button type="button" className={styles.serviceAction} onClick={() => selectInterest(item.interest)} aria-label={`Consultar ${item.title}`}><ArrowRight size={20} aria-hidden="true" /></button>
            </article>;
          })}
        </div>
      </section>

      <section id="solicitud" className={styles.contact} aria-labelledby="join-contact-title">
        <div className={styles.contactCopy}>
          <p className={styles.eyebrow}>04 / Hablamos de tu local</p>
          <h2 id="join-contact-title">Tú a lo tuyo.<em>Lo vemos contigo.</em></h2>
          <p className={styles.bodyCopy}>No necesitas aprender publicidad, publicar cada día ni gestionar otra aplicación complicada.</p>
          <p className={styles.contactPromise}><Handshake size={25} aria-hidden="true" /><span>Sin compromiso.<br /><strong>Y con una persona al otro lado.</strong></span></p>
        </div>
        <details className={styles.formWrap} open={formOpen} onToggle={(event) => setFormOpen(event.currentTarget.open)}>
          <summary className={styles.formToggle}><span>{formOpen ? "Tu solicitud" : "Cuéntanos tu local"}</span><Plus size={22} aria-hidden="true" /></summary>
          <JoinForm interest={interest} onInterestChange={setInterest} />
        </details>
      </section>
    </div>
  );
}
