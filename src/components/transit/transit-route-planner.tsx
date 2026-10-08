"use client";

import Link from "next/link";
import { ArrowRight, BusFront, Route } from "lucide-react";
import { useMemo, useState } from "react";

import styles from "@/app/autobuses/autobuses.module.css";
import {
  findDirectTransitJourneys,
  getTransitLinePalette,
  getTransitLineRoutes,
  normalizeTransitStopName,
  type UrbanosTalaveraDataset,
} from "@/features/transit/urbanos-talavera";

export function TransitRoutePlanner({ dataset }: { dataset: UrbanosTalaveraDataset }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const stops = useMemo(() => {
    const names = new Map<string, string>();
    Object.keys(dataset.lineas).forEach((line) => {
      getTransitLineRoutes(dataset, line).forEach((route) => {
        route.stops.forEach((stop) => {
          const key = normalizeTransitStopName(stop);
          if (!names.has(key)) names.set(key, stop);
        });
      });
    });
    return Array.from(names.values()).sort((left, right) => left.localeCompare(right, "es"));
  }, [dataset]);
  const journeys = useMemo(
    () => from && to ? findDirectTransitJourneys(dataset, from, to) : [],
    [dataset, from, to],
  );
  const queryStarted = Boolean(from && to && normalizeTransitStopName(from) !== normalizeTransitStopName(to));

  return (
    <section className={styles.planner} aria-labelledby="planner-title">
      <div className={styles.plannerHeading}>
        <p className={styles.eyebrow}>CONSULTA UNA RUTA</p>
        <h2 id="planner-title">¿De qué parada sales?</h2>
        <p>Te mostramos líneas directas y el tramo exacto de paradas. Sin datos en tiempo real ni transbordos inventados.</p>
      </div>
      <div className={styles.plannerControls}>
        <label>
          <span>Desde</span>
          <select value={from} onChange={(event) => setFrom(event.target.value)}>
            <option value="">Elige una parada</option>
            {stops.map((stop) => <option key={`from-${stop}`} value={stop}>{stop}</option>)}
          </select>
        </label>
        <ArrowRight className={styles.plannerArrow} aria-hidden="true" />
        <label>
          <span>Hasta</span>
          <select value={to} onChange={(event) => setTo(event.target.value)}>
            <option value="">Elige tu destino</option>
            {stops.map((stop) => <option key={`to-${stop}`} value={stop}>{stop}</option>)}
          </select>
        </label>
      </div>
      {queryStarted ? (
        <div className={styles.journeyResults} aria-live="polite">
          {journeys.length ? journeys.map((journey) => {
            const palette = getTransitLinePalette(journey.line);
            const params = new URLSearchParams({
              linea: journey.line,
              direccion: journey.direction,
              desde: journey.boardingStop,
              hasta: journey.alightingStop,
            });
            return (
              <Link className={styles.journeyCard} key={`${journey.line}-${journey.direction}-${journey.stops.join("|")}`} href={`/mapa?${params.toString()}`}>
                <span className={styles.journeyLine} style={{ background: palette.background, color: palette.foreground }}>L{journey.line}</span>
                <span>
                  <strong>{journey.stops.length} paradas</strong>
                  <small>{journey.boardingStop} → {journey.alightingStop}</small>
                </span>
                <Route aria-hidden="true" />
              </Link>
            );
          }) : (
            <div className={styles.noJourney}>
              <BusFront aria-hidden="true" />
              <span><strong>No aparece una línea directa.</strong> Prueba otra parada cercana o consulta la red completa en el mapa.</span>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
