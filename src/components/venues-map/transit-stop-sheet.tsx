"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, BusFront, ChevronDown, Clock3, RefreshCw, Route, X } from "lucide-react";

import styles from "./transit-stop-sheet.module.css";

import {
  findTransitStopSchedules,
  getTransitLinePalette,
  getUpcomingTransitTimes,
  isLikelyCurrentService,
  type TransitStopSchedule,
} from "@/features/transit/urbanos-talavera";
import { loadUrbanosTalaveraDataset } from "@/features/transit/urbanos-talavera-client";

type TransitStopSheetProps = {
  stopName: string;
  onClose: () => void;
  onViewRoute: (schedule: TransitStopSchedule) => void;
};

function scheduleKey(schedule: TransitStopSchedule) {
  return `${schedule.line}:${schedule.direction}:${schedule.days}:${schedule.routeStops.join("|")}:${schedule.stopIndex}`;
}

function getLineStyle(line: string) {
  const palette = getTransitLinePalette(line);
  return {
    "--line-color": palette.background,
    "--line-ink": palette.foreground,
    "--line-shadow": palette.shadow,
  } as CSSProperties;
}

function getDirectionDetails(schedule: TransitStopSchedule) {
  const circular = Boolean(schedule.origin && schedule.origin === schedule.destination);
  if (circular) {
    return {
      label: "Recorrido circular",
      detail: "Vuelve al punto de origen",
      circular: true,
    };
  }
  return {
    label: schedule.destination ? `Hacia ${schedule.destination}` : schedule.lineName,
    detail: schedule.origin ? `Sale de ${schedule.origin}` : "",
    circular: false,
  };
}

export function TransitStopSheet({ stopName, onClose, onViewRoute }: TransitStopSheetProps) {
  const [schedules, setSchedules] = useState<TransitStopSchedule[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeLine, setActiveLine] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSchedules(null);
    setFailed(false);
    setExpanded(null);
    void loadUrbanosTalaveraDataset()
      .then((dataset) => {
        if (cancelled) return;
        const matches = findTransitStopSchedules(dataset, stopName);
        setSchedules(matches);
        setActiveLine(matches[0]?.line ?? "");
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => { cancelled = true; };
  }, [stopName]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const lines = useMemo(
    () => Array.from(new Set((schedules ?? []).map((schedule) => schedule.line))),
    [schedules],
  );
  const lineSchedules = (schedules ?? [])
    .filter((schedule) => schedule.line === activeLine)
    .sort((left, right) => Number(isLikelyCurrentService(right.days)) - Number(isLikelyCurrentService(left.days)));

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar horarios"
        onClick={onClose}
        className={`${styles.backdrop} fixed inset-0 z-[129] cursor-default`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="transit-stop-title"
        className={`${styles.sheet} pickyalo-map-selection-sheet fixed inset-x-3 bottom-3 z-[130] max-h-[78dvh] overflow-y-auto overscroll-contain rounded-[1.45rem] md:inset-x-auto md:bottom-4 md:left-4 md:w-[25rem]`}
      >
        <header className={`${styles.header} rounded-t-[1.35rem] p-4 md:p-5`}>
          <div className="flex items-start gap-3">
            <span className={`${styles.stopIcon} grid h-12 w-12 shrink-0 place-items-center rounded-[1rem]`}>
              <BusFront size={24} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={`${styles.eyebrow} text-[10px] font-extrabold uppercase tracking-[.18em]`}>Parada de autobús</p>
              <h2 id="transit-stop-title" className="mt-1.5 text-[1.35rem] font-extrabold leading-[1.05] tracking-[-.035em]">{stopName}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar horarios" className={"pickyalo-light-control " + (`${styles.closeButton} grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors`)}>
              <X size={21} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-5">
          {schedules === null && !failed ? (
            <div className={`${styles.loading} rounded-[1rem] p-4 text-sm font-semibold`}>Consultando horarios oficiales…</div>
          ) : null}
          {failed || schedules?.length === 0 ? (
            <div className={`${styles.emptyState} rounded-[1rem] p-4`}>
              <p className={`${styles.emptyTitle} font-extrabold`}>Horario no disponible para esta parada</p>
              <p className={`${styles.muted} mt-1 text-xs leading-5`}>El nombre visible no coincide de forma segura con el horario oficial.</p>
            </div>
          ) : null}

          {lines.length > 0 ? (
            <>
              <p className={`${styles.linesLabel} text-[10px] font-extrabold uppercase tracking-[.16em] opacity-65`}>Líneas que pasan aquí</p>
              <div className="mt-2.5 flex flex-wrap gap-2" role="tablist" aria-label="Líneas de la parada">
                {lines.map((line) => (
                  <button
                    key={line}
                    type="button"
                    role="tab"
                    aria-selected={activeLine === line}
                    onClick={() => { setActiveLine(line); setExpanded(null); }}
                    style={getLineStyle(line)}
                    className={`${styles.lineButton} ${activeLine === line ? styles.lineButtonActive : ""} grid h-12 w-12 place-items-center rounded-[.85rem] text-base font-black`}
                  >
                    L{line}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {lineSchedules.map((schedule) => {
                  const key = scheduleKey(schedule);
                  const isCurrent = isLikelyCurrentService(schedule.days);
                  const upcoming = isCurrent ? getUpcomingTransitTimes(schedule.times) : schedule.times.slice(0, 3);
                  const isExpanded = expanded === key;
                  const direction = getDirectionDetails(schedule);
                  return (
                    <section
                      key={key}
                      className={`${styles.scheduleCard} ${isCurrent ? styles.scheduleCardCurrent : ""} rounded-[1.15rem] p-4`}
                    >
                      <button type="button" className={`${styles.scheduleButton} flex min-h-11 w-full items-start justify-between gap-3 text-left`} onClick={() => setExpanded(isExpanded ? null : key)} aria-expanded={isExpanded}>
                        <span className="flex min-w-0 items-start gap-3">
                          <span style={getLineStyle(schedule.line)} className={`${styles.lineIndicator} grid h-9 w-9 shrink-0 place-items-center rounded-[.65rem] text-xs font-black`} aria-label={`Línea ${schedule.line}`}>L{schedule.line}</span>
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <strong className={`${styles.direction} inline-flex items-center gap-1.5 text-[15px] font-black`}> 
                                {direction.circular
                                  ? <RefreshCw className="h-4 w-4 shrink-0" aria-hidden="true" />
                                  : <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
                                {direction.label}
                              </strong>
                              {isCurrent ? <span className={`${styles.currentBadge} rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[.12em]`}>Servicio de hoy</span> : null}
                            </span>
                            {direction.detail ? <small className={`${styles.serviceMeta} mt-1 block text-[11px] font-semibold leading-4`}>{direction.detail}</small> : null}
                            <small className={`${styles.serviceMeta} mt-1 block text-[10px] font-bold uppercase leading-4 tracking-[.07em]`}>{schedule.days}</small>
                          </span>
                        </span>
                        <span className={`${styles.chevronBubble} grid h-9 w-9 shrink-0 place-items-center rounded-full`}>
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                        </span>
                      </button>
                      {schedule.nextStops.length > 0 ? (
                        <p
                          className={`${styles.nextStops} mt-2.5 flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold`}
                          title={`Después: ${schedule.nextStops.join(" → ")}`}
                        >
                          <span className={`${styles.nextStopsLabel} shrink-0 text-[9px] font-black uppercase tracking-[.1em]`}>Después</span>
                          <span aria-hidden="true">·</span>
                          <span className="min-w-0 truncate">{schedule.nextStops.join(" → ")}</span>
                        </p>
                      ) : null}
                      <div className={`${styles.timesLabel} mt-3 flex items-center gap-2`}>
                        <Clock3 size={16} aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-[.13em]">{isCurrent ? "Próximas salidas" : "Primeras salidas"}</span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-end gap-2">
                        {upcoming.length ? upcoming.map((time, index) => (
                          <time
                            key={time}
                            className={isCurrent && index === 0
                              ? `${styles.primaryTime} rounded-[.8rem] px-3.5 py-2 text-xl font-black leading-none`
                              : `${styles.secondaryTime} rounded-[.75rem] px-3 py-2 text-sm font-extrabold`}
                          >
                            {time}
                          </time>
                        )) : <span className={`${styles.muted} text-xs font-semibold`}>{schedule.times.length ? "Sin más salidas indicadas hoy." : "Horario por confirmar."}</span>}
                      </div>
                      <button
                        type="button"
                        className={`${styles.routeButton} mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[.85rem] px-3 text-xs font-black`}
                        onClick={() => onViewRoute(schedule)}
                      >
                        <Route size={16} aria-hidden="true" />
                        Ver recorrido por paradas
                      </button>
                      {isExpanded ? (
                        <div className={`${styles.expandedTimes} mt-4 pt-3`}>
                          <p className={`${styles.linesLabel} mb-2 text-[9px] font-black uppercase tracking-[.13em] opacity-55`}>Horario completo</p>
                          <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
                            {schedule.times.length ? schedule.times.map((time, index) => <time key={`${time}-${index}`} className={`${styles.expandedTime} rounded-full px-2.5 py-1 text-xs font-bold`}>{time}</time>) : <p className={`${styles.muted} text-xs font-semibold`}>Datos incompletos en la fuente oficial.</p>}
                          </div>
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
              <p className={`${styles.footer} mt-4 pt-3 text-[10px] leading-4`}>Horarios oficiales de Urbanos Talavera · versión junio de 2026.</p>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
