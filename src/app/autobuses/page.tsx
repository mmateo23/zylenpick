import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MapPinned, Navigation } from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { TransitRoutePlanner } from "@/components/transit/transit-route-planner";
import transitData from "../../../public/urbanos-talavera.json";
import {
  getTransitLinePalette,
  type UrbanosTalaveraDataset,
} from "@/features/transit/urbanos-talavera";
import { getBaseMetadata } from "@/lib/seo";

import styles from "./autobuses.module.css";

export const metadata: Metadata = getBaseMetadata({
  title: "Autobuses urbanos de Talavera: líneas, paradas y horarios",
  description:
    "Consulta las líneas de autobús urbano de Talavera y abre el mapa para ver el sentido, las próximas salidas y las siguientes paradas.",
  path: "/autobuses",
});

const dataset = transitData as UrbanosTalaveraDataset;

function cleanStopName(value: string) {
  return value.replaceAll("C. C.", "C.C.").replaceAll("Bº", "Barrio");
}

export default function AutobusesPage() {
  const lines = Object.entries(dataset.lineas).map(([number, line]) => {
    const firstSection = line.secciones[0];
    const origin = firstSection?.paradas[0]?.nombre ?? "";
    const destination = firstSection?.paradas.at(-1)?.nombre ?? "";
    return { number, name: line.nombre, origin, destination };
  });
  const updatedAt = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(`${dataset.extraido}T12:00:00+02:00`));

  return (
    <SiteShell wideContent className={styles.page}>
      <div className={styles.main}>
        <section className={styles.hero} aria-labelledby="bus-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>MOVERSE POR TALAVERA</p>
            <h1 id="bus-title">
              Tu autobús,
              <br />
              <em>sin dar vueltas.</em>
            </h1>
            <p>
              Localiza una parada y consulta qué líneas pasan, hacia dónde van
              y cuáles son sus próximas salidas.
            </p>
            <Link className={styles.primaryAction} href="/mapa">
              Ver paradas en el mapa
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.routePoster} aria-label="Líneas urbanas disponibles">
            <div className={styles.posterTop}>
              <span className={styles.posterBus} aria-hidden="true">
                <Image
                  src="/images/transit/pickyalo-bus-asset-cutout.png"
                  alt=""
                  fill
                  sizes="(max-width: 719px) 250px, 320px"
                  priority
                />
              </span>
              <span>Urbanos</span>
              <strong>Talavera</strong>
            </div>
            <div className={styles.routeLine} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className={styles.posterLines}>
              {lines.map(({ number }) => {
                const palette = getTransitLinePalette(number);
                return (
                  <span
                    key={number}
                    style={{
                      backgroundColor: palette.background,
                      color: palette.foreground,
                      boxShadow: `0 5px 0 ${palette.shadow}`,
                    }}
                  >
                    {number}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        <TransitRoutePlanner dataset={dataset} />

        <section className={styles.how} aria-labelledby="how-title">
          <div>
            <p className={styles.eyebrow}>CÓMO CONSULTARLO</p>
            <h2 id="how-title">Una parada. La información que necesitas.</h2>
          </div>
          <ol>
            <li>
              <MapPinned aria-hidden="true" />
              <span><strong>Busca el icono del bus.</strong> Los cuadrados de color indican las líneas que pasan por allí.</span>
            </li>
            <li>
              <Navigation aria-hidden="true" />
              <span><strong>Toca la parada.</strong> Verás el destino y las siguientes paradas para distinguir el sentido.</span>
            </li>
            <li>
              <Clock3 aria-hidden="true" />
              <span><strong>Mira las próximas horas.</strong> Se muestran primero las salidas que aún puedes coger.</span>
            </li>
          </ol>
        </section>

        <section className={styles.linesSection} aria-labelledby="lines-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>RED URBANA</p>
              <h2 id="lines-title">Seis líneas, a simple vista.</h2>
            </div>
            <p>El color coincide con el que encontrarás sobre cada parada del mapa.</p>
          </div>
          <div className={styles.linesGrid}>
            {lines.map(({ number, name, origin, destination }) => {
              const palette = getTransitLinePalette(number);
              return (
                <article className={styles.lineCard} key={number}>
                  <span
                    className={styles.lineNumber}
                    style={{ backgroundColor: palette.background, color: palette.foreground }}
                    aria-label={`Línea ${number}`}
                  >
                    {number}
                  </span>
                  <div>
                    <h3>{name}</h3>
                    {origin && destination ? (
                      <p>{cleanStopName(origin)} <ArrowRight size={14} aria-hidden="true" /> {cleanStopName(destination)}</p>
                    ) : null}
                  </div>
                  <Link className={styles.routeAction} href={`/mapa?linea=${number}`} aria-label={`Ver recorrido de la línea ${number} en el mapa`}>
                    Ver recorrido
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.notice}>
          <div>
            <strong>Horarios publicados, no seguimiento en tiempo real.</strong>
            <p>Datos de {dataset.fuente}. Información revisada el {updatedAt}.</p>
          </div>
          <Link href="/mapa">
            Abrir mapa
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </SiteShell>
  );
}
