import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, ExternalLink, MapPin, Ticket, Users } from "lucide-react";

import styles from "@/components/events/events.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { formatEventDateRange, getEventBySlug, getEventTemporalState, publicEvents } from "@/features/events/events";
import { getBaseMetadata, getSiteUrl } from "@/lib/seo";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return publicEvents.map((event) => ({ slug: event.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const event = getEventBySlug(params.slug);
  if (!event) return { title: "Evento no encontrado | Pickyalo" };
  return getBaseMetadata({
    title: event.title,
    description: event.summary,
    path: `/eventos/${event.slug}`,
    image: event.imageUrl,
  });
}

export default function EventDetailPage({ params }: Props) {
  const event = getEventBySlug(params.slug);
  if (!event) notFound();
  const temporalState = getEventTemporalState(event);
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.startsOn,
    endDate: event.endsOn,
    eventStatus: temporalState === "past"
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.locationLabel,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city.name,
        addressRegion: "Castilla-La Mancha",
        addressCountry: "ES",
      },
    },
    organizer: { "@type": "Organization", name: event.organizer, url: event.websiteUrl },
    image: event.imageUrl ? new URL(event.imageUrl, siteUrl).toString() : undefined,
    url: new URL(`/eventos/${event.slug}`, siteUrl).toString(),
    sameAs: event.websiteUrl,
  };

  return (
    <div className={`public-light-theme pickyalo-public-canvas ${styles.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main>
        <section className={styles.detailHero}>
          {event.imageUrl ? <div className={styles.detailImage}><Image src={event.imageUrl} alt={event.imageAlt ?? ""} fill priority sizes="100vw" /></div> : null}
          <div className={`${styles.wrap} ${styles.detailHeroInner}`}>
            <Link href="/eventos" className={styles.back}><ArrowLeft size={17} />Todos los eventos</Link>
            <p className={styles.eyebrow}>{event.eyebrow}</p>
            <h1>{event.title}</h1>
            <p className={styles.detailSummary}>{event.summary}</p>
            <div className={styles.heroFacts}>
              <span>{temporalState === "ongoing" ? "Está pasando" : temporalState === "past" ? "Evento celebrado" : "Próximamente"}</span>
              <span><CalendarDays size={16} />{formatEventDateRange(event)}</span>
              <span><MapPin size={16} />{event.locationLabel}</span>
            </div>
          </div>
        </section>

        <div className={`${styles.wrap} ${styles.content}`}>
          <div>
            <section className={styles.panel} aria-labelledby="about-event">
              <p className={styles.eyebrow}>Qué vas a encontrar</p>
              <h2 id="about-event">La información esencial.</h2>
              <p>{event.description}</p>
              <div className={styles.tags}>{event.tags.map((tag) => <span className={styles.tag} key={tag}>{tag}</span>)}</div>
            </section>

            <section className={styles.panel} aria-labelledby="event-programme">
              <p className={styles.eyebrow}>Programa esencial</p>
              <h2 id="event-programme">Así será la jornada.</h2>
              <div className={styles.schedule}>
                {event.schedule.map((item, index) => <article className={styles.scheduleItem} key={`${item.date}-${index}`}>
                  <time dateTime={item.date}>{item.label}{item.time ? ` · ${item.time}` : ""}</time>
                  <div><h3>{item.title}</h3>{item.description ? <p>{item.description}</p> : null}{item.location ? <p>{item.location}</p> : null}</div>
                </article>)}
              </div>
            </section>

            <section className={styles.panel} aria-labelledby="event-highlights">
              <p className={styles.eyebrow}>En esta edición</p>
              <h2 id="event-highlights">Lo más destacado.</h2>
              <ul className={styles.highlights}>{event.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </section>
          </div>

          <aside className={`${styles.panel} ${styles.side}`} aria-label="Información práctica">
            <p className={styles.eyebrow}>Antes de ir</p>
            <div className={styles.facts}>
              <div className={styles.fact}><CalendarDays size={21} /><div><strong>Cuándo</strong><span>{formatEventDateRange(event)}</span></div></div>
              <div className={styles.fact}><MapPin size={21} /><div><strong>Dónde</strong><span>{event.locationLabel}{event.venueNote ? ` · ${event.venueNote}` : ""}</span></div></div>
              <div className={styles.fact}><Ticket size={21} /><div><strong>Acceso</strong><span>{event.accessLabel}{event.accessNote ? ` · ${event.accessNote}` : ""}</span></div></div>
              <div className={styles.fact}><Users size={21} /><div><strong>Organiza</strong><span>{event.organizer}</span></div></div>
            </div>
            <div className={styles.actions}>
              <a href={event.websiteUrl} target="_blank" rel="noreferrer" className={styles.primary}>Web oficial <ArrowUpRight size={17} /></a>
              <a href={event.sourceUrl} target="_blank" rel="noreferrer" className={styles.secondary}>Ver información confirmada <ExternalLink size={16} /></a>
            </div>
            <p className={styles.source}>Fuente: <a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.sourceLabel}</a>. Revisado el {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(`${event.verifiedOn}T12:00:00+02:00`))}. Los detalles no publicados se consultan en la fuente oficial.</p>
          </aside>
        </div>
      </main>
      <ZylenPickFooter theme="light" />
    </div>
  );
}
