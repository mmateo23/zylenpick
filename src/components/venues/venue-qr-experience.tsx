import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Flame,
  BookOpen,
  MapPin,
  Clock3,
  Phone,
  Sparkles,
  Star,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { QrTrackedLink, VenueQrAnalytics } from "@/components/venues/venue-qr-analytics";
import { VenueQrWeek } from "@/components/venues/venue-qr-week";
import {
  QrProductTrigger,
  QrPromoTrigger,
  QrTrackedActionLink,
  QrVenueStoryTrigger,
  VenueQrInteractionProvider,
} from "@/components/venues/venue-qr-interactions";
import type { VenueQrSponsor } from "@/features/venues/qr-sponsor-config";
import { getVenueOpeningStatus } from "@/features/venues/opening-hours";
import type { VenueQrNearbyCard } from "@/features/venues/services/venue-qr-service";
import type {
  VenueDetails,
  VenueMenuItem,
  VenueQrFavoritesCopy,
} from "@/features/venues/types";

type VenueQrExperienceProps = {
  venue: VenueDetails;
  sponsor: VenueQrSponsor | null;
  nearby: VenueQrNearbyCard[];
};

function getSpecialPriority(item: VenueMenuItem) {
  if (item.isFeatured) return 0;
  if (item.isPickupMonthHighlight) return 1;
  if (item.isHomeFeatured) return 2;
  return 3;
}

function getSpecialLabel(item: VenueMenuItem) {
  if (item.isFeatured) return "Favorito de la casa";
  if (item.isPickupMonthHighlight) return "Muy pedido";
  return "Especialidad";
}

function getSpecialIcon(item: VenueMenuItem): LucideIcon {
  if (item.isFeatured) return Star;
  if (item.isPickupMonthHighlight) return Flame;
  if (item.isHomeFeatured) return UtensilsCrossed;
  return Sparkles;
}

function DishLabel({ item }: { item: VenueMenuItem }) {
  const Icon = getSpecialIcon(item);

  return (
    <span className="mt-1 flex items-center gap-1.5 text-xs font-medium leading-4 text-[#741314]">
      <Icon aria-hidden="true" className="h-3 w-3 shrink-0" strokeWidth={2} />
      <span>{getSpecialLabel(item)}</span>
    </span>
  );
}

function statusDotClass(state: ReturnType<typeof getVenueOpeningStatus>["state"]) {
  if (state === "open") return "bg-[#9BD0A9]";
  if (state === "opening_soon" || state === "closing_soon") {
    return "bg-[#E6B85C]";
  }
  return "bg-[#C99284]";
}

function VenueHero({
  venue,
  heroImageUrl,
  hasNearby,
}: {
  venue: VenueDetails;
  heroImageUrl: string | null;
  hasNearby: boolean;
}) {
  const openingStatus = getVenueOpeningStatus(venue.openingHours, venue.manualOpenStatus);
  const hasOpeningHours = typeof venue.manualOpenStatus === "boolean" || Object.values(venue.openingHours).some((day) => day.isOpen || day.firstOpen || day.firstClose);
  const specialty = venue.qrHeroTagline ?? venue.discoveryCategory ?? "La casa";
  const hasProducts = venue.menuItems.length > 0;

  return (
    <section aria-label={`Bienvenido a ${venue.name}`} className="border-b border-[#741314]/15 bg-[#FFF7E8] px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))] text-[#741314] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-12 items-center justify-between gap-4 border-b border-[#741314]/15 pb-3">
          <Link href="/" aria-label="Pickyalo, inicio" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">
            <Image src="/icons/pickyalo-favicon-32.png" alt="Pickyalo" width={36} height={36} className="rounded-lg" />
          </Link>
          <p className="text-right text-xs font-semibold uppercase leading-5 tracking-[0.12em]">{venue.city.name}</p>
        </div>

        <div className="grid items-center gap-5 py-6 lg:min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-8 lg:py-10">
          <div className="min-w-0 text-center lg:text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em]">Estás en</p>
            <h1 className="font-pickyalo-wordmark break-words text-balance text-4xl leading-[1.06] sm:text-5xl lg:text-5xl xl:text-6xl">{venue.name}</h1>
            <a href="#el-local" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium text-[#24110E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314] lg:justify-start">
              <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${hasOpeningHours ? statusDotClass(openingStatus.state) : "bg-[#E6B85C]"}`} />
              {hasOpeningHours ? openingStatus.label : "Horario por confirmar"}
              <span className="text-xs text-[#741314] underline underline-offset-4">Ver horario</span>
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-[15rem] sm:max-w-[20rem] lg:max-w-[22rem]">
            <div aria-hidden="true" className="absolute inset-3 translate-x-2 translate-y-2 rounded-3xl bg-[#741314]/15" />
            <article className="relative overflow-hidden rounded-3xl border border-[#741314]/15 bg-white text-[#24110E] shadow-[0_10px_24px_rgba(36,17,14,0.10)]">
            <QrVenueStoryTrigger className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#741314]">
              <span className="flex min-h-12 items-center gap-2 px-3 py-2">
                <Image src="/icons/pickyalo-favicon-32.png" alt="" width={28} height={28} className="shrink-0 rounded-full" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{venue.name}</span>
                  <span className="block text-xs text-[#741314]">Conoce la casa</span>
                </span>
                <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0" />
              </span>
              <span className="relative block aspect-[4/3] overflow-hidden bg-[#FDE3AD]">
                {heroImageUrl ? (
                  <Image src={heroImageUrl} alt={`Portada de ${venue.name}`} fill priority sizes="(max-width: 639px) 240px, (max-width: 1023px) 320px, 352px" className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.025]" />
                ) : (
                  <span className="font-pickyalo-wordmark flex h-full items-center justify-center px-6 text-center text-3xl text-[#741314]">{venue.name}</span>
                )}
              </span>
            </QrVenueStoryTrigger>
            <div className="px-3 pb-3">
              <nav aria-label="Descubre este local" className="flex items-start gap-2 border-b border-[#741314]/10 py-1 text-[#741314]">
                <QrVenueStoryTrigger className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold hover:bg-[#FFF7E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">
                  <BookOpen className="h-5 w-5" aria-hidden="true" /> La casa
                </QrVenueStoryTrigger>
                {hasProducts ? <a href="#favoritos" className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold hover:bg-[#FFF7E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">
                  <UtensilsCrossed className="h-5 w-5" aria-hidden="true" /> Platos
                </a> : null}
                <a href="#el-local" className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold hover:bg-[#FFF7E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]"><Clock3 className="h-5 w-5" aria-hidden="true" /> Horario</a>
                {hasNearby ? <a href="#cerca-de-aqui" className="ml-auto flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold hover:bg-[#FFF7E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">
                  <MapPin className="h-5 w-5" aria-hidden="true" /> Un paseo
                </a> : null}
              </nav>
              <p className="mt-2 text-sm font-semibold leading-5">{specialty}</p>
              {venue.description ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#24110E]">{venue.description}</p>
              ) : null}
            </div>
            </article>
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <p className="font-pickyalo-wordmark break-words text-balance text-2xl leading-tight sm:text-3xl lg:text-4xl xl:text-5xl">{specialty}</p>
            <p className="mx-auto mt-3 max-w-[30ch] text-sm leading-6 text-[#24110E] lg:mx-0">
              {venue.qrHostName ? `Pregunta a ${venue.qrHostName} qué pedir hoy.` : "Pregunta por los favoritos de la casa."}
            </p>
            {venue.address ? <p className="mx-auto mt-3 max-w-[30ch] text-xs leading-5 text-[#741314] lg:mx-0">{venue.address}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-[#741314]/15 pt-3 lg:justify-between">
          <QrVenueStoryTrigger className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-[#741314]/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">
            Conoce la casa <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </QrVenueStoryTrigger>
          <p className="hidden text-xs text-[#24110E] lg:block">Lo bueno está aquí.</p>
          {hasProducts ? <a href="#favoritos" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">Qué pedir aquí <ArrowDown aria-hidden="true" className="h-4 w-4" /></a> : null}
        </div>
      </div>
    </section>
  );
}

function DishTile({
  item,
  source,
  wide = false,
}: {
  item: VenueMenuItem;
  source: "featured" | "catalog";
  wide?: boolean;
}) {
  return (
    <QrProductTrigger
      item={item}
      source={source}
      ariaLabel={`Ver plato: ${item.name}`}
      className={`group min-w-0 overflow-hidden rounded-2xl border border-[#741314]/10 bg-white text-left shadow-[0_3px_12px_rgba(36,17,14,0.04)] outline-none transition-colors hover:border-[#741314]/40 focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFF7E8] ${
        wide
          ? "col-span-2 grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-stretch sm:col-span-1 sm:flex sm:flex-col"
          : "flex flex-col"
      }`}
    >
      <span
        className={`relative block w-full shrink-0 overflow-hidden bg-[#F6D99A]/40 ${
          wide ? "min-h-[196px] sm:aspect-[4/3] sm:min-h-0" : "aspect-square sm:aspect-[4/3]"
        }`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="(max-width: 639px) 46vw, 360px"
            className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.035]"
          />
        ) : (
          <span className="flex h-full items-center justify-center px-4 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#741314]/65">
            Foto pendiente
          </span>
        )}
      </span>
      <span className="flex w-full min-w-0 flex-1 flex-col p-3 sm:p-4">
        <span className="font-pickyalo-wordmark block break-words text-balance text-base leading-tight text-[#24110E] sm:text-xl">
          {item.name}
        </span>
        <DishLabel item={item} />
        {wide && item.description ? <span className="mt-3 line-clamp-3 text-sm leading-5 text-[#24110E] sm:line-clamp-2">{item.description}</span> : null}
        <span className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-3 text-xs font-semibold text-[#741314]">
          Ver plato
          <ArrowUpRight className="h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </span>
    </QrProductTrigger>
  );
}

function FeaturedGrid({
  items,
  copy,
  hostName,
}: {
  items: VenueMenuItem[];
  copy: VenueQrFavoritesCopy;
  hostName: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <section
      id="favoritos"
      aria-labelledby="qr-favorites-title"
      className="scroll-mt-4 px-4 py-6 sm:px-8 sm:py-10"
    >
      <div className="mx-auto max-w-5xl">
        <div className="border-t-2 border-[#741314] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#741314]">
            {copy.eyebrow}
          </p>
          <h2
            id="qr-favorites-title"
            className="font-pickyalo-wordmark mt-2 text-3xl leading-tight text-[#741314] sm:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-2 max-w-[38rem] text-base leading-6 text-[#24110E]">
            {copy.description}
          </p>
          {hostName ? (
            <p className="mt-2 text-sm font-medium text-[#741314]">
              ¿Dudas? Pregunta a {hostName}.
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-4">
          {items.map((item, index) => (
            <DishTile
              key={item.id}
              item={item}
              source="featured"
              wide={index === 0 && items.length % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorBanner({
  sponsor,
  venue,
}: {
  sponsor: VenueQrSponsor;
  venue: VenueDetails;
}) {
  const relatedItem =
    venue.menuItems.find((item) => item.id === sponsor.relatedMenuItemId) ?? null;
  const backgroundImageUrl =
    sponsor.productImageUrl ?? relatedItem?.imageUrl ?? null;

  return (
    <section className="px-4 pb-5 sm:px-8 sm:pb-8">
      <div className="relative mx-auto min-h-[210px] max-w-4xl overflow-hidden rounded-[20px] bg-[#741314] px-6 py-7 text-[#FFF7E8]">
        {backgroundImageUrl ? (
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 896px"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[#24110E]/[0.65]" aria-hidden="true" />
        <div className="relative z-10 flex min-h-[156px] max-w-[32rem] flex-col justify-end">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#FDE3AD]">
            Colaboración
          </p>
          <h2 className="font-pickyalo-wordmark mt-2 text-3xl leading-none">
            Para acompañar
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-[#FFF7E8]">
            {sponsor.description}
          </p>
          <QrPromoTrigger
            sponsor={sponsor}
            relatedItem={relatedItem}
            className="mt-3 inline-flex min-h-11 w-fit items-center gap-2 border-b border-[#FDE3AD]/55 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#FDE3AD]"
          >
            Ver promoción
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </QrPromoTrigger>
        </div>
      </div>
    </section>
  );
}

function RemainingMenu({ items }: { items: VenueMenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="productos"
      aria-labelledby="qr-more-title"
      className="px-4 pb-7 pt-0 sm:px-8 sm:pb-10"
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#741314]">
          Más de la carta
        </p>
        <h2
          id="qr-more-title"
          className="font-pickyalo-wordmark mt-2 max-w-[18ch] text-[27px] leading-[1.05] text-[#24110E] sm:text-4xl"
        >
          También te puede apetecer.
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-4">
          {items.map((item) => (
            <DishTile key={item.id} item={item} source="catalog" />
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1_000) {
    return `${Math.max(50, Math.round(distanceMeters / 50) * 50)} m`;
  }

  return `${new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 1,
  }).format(distanceMeters / 1_000)} km`;
}

function NearbyPlaces({
  cards,
  venue,
}: {
  cards: VenueQrNearbyCard[];
  venue: VenueDetails;
}) {
  if (cards.length === 0) return null;

  return (
    <section id="cerca-de-aqui" className="scroll-mt-4 px-4 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-medium text-[#FDE3AD]">
            Si luego te apetece dar una vuelta
          </p>
          <h2 className="font-pickyalo-wordmark mt-2 text-3xl leading-tight text-[#FFF7E8]">
            Después, un paseo.
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {cards.map((card) => (
            <QrTrackedLink
              key={`${card.kind}:${card.id}`}
              href={card.href}
              eventName="qr_nearby_clicked"
              properties={{
                venue_id: venue.id,
                venue_slug: venue.slug,
                city_slug: venue.city.slug,
                nearby_id: card.id,
                nearby_kind: card.kind,
              }}
              className="group min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-[#FDE3AD] focus-visible:ring-offset-4 focus-visible:ring-offset-[#5F0F10]"
            >
              {card.title.toLocaleLowerCase("es").includes("teatro victoria") ? (
                <span className="relative isolate flex h-[186px] items-center justify-center sm:h-[250px]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-7 top-10 rounded-[20px] border border-[#F6D99A] bg-[#FFF7E8] shadow-[4px_7px_0_#F6D99A,0_14px_22px_rgba(28,13,10,0.22)] sm:bottom-4 sm:top-14"
                  />
                  <Image
                    src="/home/assets/drive_teatro_victoria.png"
                    alt="Teatro Victoria de Talavera de la Reina"
                    width={1024}
                    height={1024}
                    sizes="(max-width: 639px) 46vw, 360px"
                    className="relative z-10 h-auto w-full -translate-y-2 object-contain drop-shadow-[0_13px_7px_rgba(28,13,10,0.3)] sm:-translate-y-1"
                  />
                </span>
              ) : card.id === "ceramica-junto-al-tajo:mural-homenaje-a-los-pescadores" ? (
                <span className="relative isolate flex h-[186px] items-center justify-center sm:h-[250px]">
                  <span aria-hidden="true" className="absolute inset-x-3 bottom-8 top-14 rounded-[20px] border border-[#F6D99A] bg-[#FFF7E8] shadow-[3px_5px_0_#F6D99A,0_12px_20px_rgba(28,13,10,0.18)] sm:bottom-4 sm:top-16" />
                  <Image
                    src="/qr/ceramica-junto-al-tajo-relieve.png"
                    alt="Ilustración del mural de cerámica junto al Tajo"
                    width={1536}
                    height={1024}
                    sizes="(max-width: 639px) 46vw, 360px"
                    className="relative z-10 h-auto w-full -translate-y-4 object-contain drop-shadow-[0_12px_6px_rgba(28,13,10,0.28)] sm:-translate-y-3"
                  />
                </span>
              ) : (
              <span className="relative block h-[186px] overflow-hidden rounded-[20px] bg-[#741314] sm:h-[250px]">
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 639px) 46vw, 360px"
                  className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.015]"
                />
              </span>
              )}
              <span className="mt-3 flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-baseline">
                <span className="font-pickyalo-wordmark min-w-0 text-balance text-base leading-tight text-[#FFF7E8]">
                  {card.title}
                </span>
                <span className="shrink-0 text-xs font-medium text-[#FDE3AD]">
                  {formatDistance(card.distanceMeters)}
                </span>
              </span>
              <span className="mt-1 block text-xs text-[#FDE3AD]">
                {card.eyebrow}
              </span>
            </QrTrackedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function VenueFooter({ venue }: { venue: VenueDetails }) {
  const normalVenueHref = `/zonas/${venue.city.slug}/venues/${venue.slug}`;

  return (
    <footer id="el-local" className="scroll-mt-4 rounded-t-[28px] bg-[#FFF7E8] px-4 py-8 text-[#24110E] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#741314]/20 pb-4">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#741314]">Para volver cuando te apetezca</p><h2 className="font-pickyalo-wordmark mt-2 text-3xl leading-tight text-[#741314]">Nos vemos por aquí.</h2></div>
          <Image src="/home/hero/pickyalo-sticker.png" alt="" width={1024} height={1535} sizes="96px" className="h-auto w-20 shrink-0 -rotate-6 sm:w-24" />
        </div>
        <div className="grid items-start gap-6 md:grid-cols-2 md:gap-10">
          <VenueQrWeek hours={venue.openingHours} manualOpenStatus={venue.manualOpenStatus} />
          <div className="min-w-0 border-t border-[#741314]/20 pt-5 md:border-t-0 md:pt-0">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#741314]">En buenas manos</p>
        <h3 className="font-pickyalo-wordmark mt-2 text-2xl leading-tight text-[#741314]">
          {venue.qrHostName
            ? `${venue.qrHostName} puede ayudarte.`
            : "Pregunta al personal."}
        </h3>

        <p className="mt-3 text-base leading-6">Si tienes dudas sobre un plato o quieres consultar tu próxima visita, habla con nosotros.</p>
        <p className="mt-4 flex items-start gap-2 text-sm leading-6"><MapPin size={18} className="mt-1 shrink-0 text-[#741314]" aria-hidden="true" />{venue.address ?? venue.city.name}</p>
        {venue.phone ? (
          <QrTrackedActionLink
            href={`tel:${venue.phone}`}
            eventName="qr_help_clicked"
            properties={{
              venue_id: venue.id,
              venue_slug: venue.slug,
              city_slug: venue.city.slug,
            }}
            className="mt-4 flex min-h-11 w-fit items-center gap-2 rounded-lg bg-[#741314] px-4 py-3 text-sm font-semibold text-[#FFF7E8] outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
          >
            <Phone size={18} aria-hidden="true" /> Llamar al local <span className="sr-only">{venue.phone}</span>
          </QrTrackedActionLink>
        ) : (
          <p className="mt-3 text-base font-medium text-[#741314]">
            {venue.qrHostName
              ? `Consulta el horario con ${venue.qrHostName}`
              : "Consulta el horario con el personal"}
          </p>
        )}
        <Link
          href={normalVenueHref}
          className="mt-3 flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-[#741314] underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
        >
          Ver ficha del local
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
        <QrVenueStoryTrigger className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#741314] outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"><BookOpen size={18} aria-hidden="true" /> La historia de esta casa</QrVenueStoryTrigger>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-[#741314]/15 pt-4 text-xs text-[#741314]"><Image src="/icons/pickyalo-favicon-32.png" alt="" width={24} height={24} className="rounded-md" /><span>Lo bueno de cerca. Pickyalo.</span></div>
      </div>
    </footer>
  );
}

export function VenueQrExperience({
  venue,
  sponsor,
  nearby,
}: VenueQrExperienceProps) {
  const prioritized = [...venue.menuItems].sort(
    (first, second) => getSpecialPriority(first) - getSpecialPriority(second),
  );
  const favorites = prioritized.slice(0, 3);
  const favoriteIds = new Set(favorites.map((item) => item.id));
  const remainingItems = venue.menuItems.filter(
    (item) => !favoriteIds.has(item.id),
  );
  const featuredItem = favorites[0] ?? null;
  const heroImageUrl =
    venue.qrHeroImageUrl ??
    venue.coverUrl ??
    featuredItem?.imageUrl ??
    venue.menuItems[0]?.imageUrl ??
    null;

  return (
    <VenueQrInteractionProvider venue={venue}>
      <div className="public-light-theme min-h-screen overflow-x-hidden bg-[#FFF7E8] text-[#24110E]">
        <VenueQrAnalytics
          venueId={venue.id}
          venueSlug={venue.slug}
          citySlug={venue.city.slug}
          sponsor={
            sponsor ? { id: sponsor.id, name: sponsor.brandName } : null
          }
        />
        <main>
          <VenueHero
            venue={venue}
            heroImageUrl={heroImageUrl}
            hasNearby={nearby.length > 0}
          />
          <FeaturedGrid
            items={favorites}
            copy={venue.qrFavorites}
            hostName={venue.qrHostName}
          />
          {sponsor ? <SponsorBanner sponsor={sponsor} venue={venue} /> : null}
          <RemainingMenu items={remainingItems} />
          <div className="rounded-t-[28px] bg-[#5F0F10] text-[#FFF7E8]">
            <NearbyPlaces cards={nearby} venue={venue} />
            <VenueFooter venue={venue} />
          </div>
        </main>
      </div>
    </VenueQrInteractionProvider>
  );
}
