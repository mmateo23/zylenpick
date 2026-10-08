import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import styles from "@/components/events/events.module.css";
import { EventsEmptyTracker } from "@/components/events/events-empty-tracker";
import {
  formatEventDateRange,
  getEventTemporalState,
  getMadridDate,
  getUpcomingEvents,
} from "@/features/events/events";
import { getBaseMetadata } from "@/lib/seo";

export const metadata: Metadata = getBaseMetadata({
  title: "Eventos y planes en Talavera",
  description:
    "Una agenda seleccionada de acontecimientos locales para saber qué ocurre, cuándo y cómo participar.",
  path: "/eventos",
});

export default function EventsPage() {
  const today = getMadridDate();
  const events = getUpcomingEvents(today);

  return (
    <div className={`public-light-theme pickyalo-public-canvas ${styles.page}`}>
      <SiteHeader />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>La agenda de Pickyalo</p>
              <h1>Sal y forma parte.</h1>
              <p className={styles.heroIntro}>
                Encuentra acontecimientos locales con la información práctica para
                decidir: fecha, lugar, acceso y programación confirmada.
              </p>
            </div>
            <div className={styles.counter} aria-hidden="true">
              {events[0]?.homeImageUrl ? (
                <Image
                  src={events[0].homeImageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 759px) 100vw, 480px"
                  className={styles.counterMedia}
                />
              ) : null}
              <div className={styles.counterInner}>
                <small>Próxima cita</small>
                <strong>{events[0] ? formatEventDateRange(events[0]).replace(/ de 2026$/, "") : "Muy pronto"}</strong>
                <span>{events[0] ? `${events[0].city.name.replace(" de la Reina", "")} · ${events[0].tags[0]?.toLowerCase() ?? "agenda local"}` : "Talavera · agenda local"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="events-title">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <div><p className={styles.eyebrow}>Para apuntar</p><h2 id="events-title">Lo próximo</h2></div>
              <p>Solo mostramos citas futuras o en curso. Los datos pendientes se indican claramente.</p>
            </div>
            {events.length ? (
              <div className={styles.grid}>
                {events.map((event) => {
                  const starts = new Date(`${event.startsOn}T12:00:00+02:00`);
                  const state = getEventTemporalState(event, today);
                  return (
                    <article className={`pickyalo-media-card ${styles.card}`} key={event.slug}>
                      <Link href={`/eventos/${event.slug}`}>
                        <span className={styles.cardMedia}>
                          {event.imageUrl ? <Image src={event.imageUrl} alt={event.imageAlt ?? ""} fill sizes="(max-width:759px) 100vw, 560px" /> : null}
                          <span className={`pickyalo-media-gradient ${styles.mediaShade}`} />
                          <span className={styles.dateBlock}><strong>{starts.getDate()}</strong><span>{new Intl.DateTimeFormat("es-ES", { month: "short" }).format(starts)}</span></span>
                          <span className={styles.cardKind}>{state === "ongoing" ? "Está pasando" : event.eyebrow}</span>
                        </span>
                        <span className={styles.cardBody}>
                          <h3>{event.title}</h3>
                          <p>{event.summary}</p>
                          <span className={styles.meta}>
                            <span><CalendarDays size={14} />{formatEventDateRange(event)}</span>
                            <span><MapPin size={14} />{event.locationLabel}</span>
                          </span>
                          <span className={styles.cta}>Ver el evento <ArrowRight size={18} /></span>
                        </span>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                <EventsEmptyTracker citySlug="talavera-de-la-reina" />
                <CalendarDays size={34} aria-hidden="true" />
                <h2>La próxima selección está en camino.</h2>
                <p>No publicamos eventos pasados como próximos. Vuelve pronto para ver nuevas citas.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <ZylenPickFooter theme="light" />
    </div>
  );
}
