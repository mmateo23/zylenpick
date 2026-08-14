"use client";

import { useState } from "react";
import { Copy, RotateCcw } from "lucide-react";

import {
  openingHourDayLabels,
  openingHourDayOrder,
  type OpeningHoursValue,
} from "@/features/venues/opening-hours";

type AdminOpeningHoursTableProps = {
  initialValue: OpeningHoursValue;
};

const timeInputClassName =
  "dark-form-field h-11 min-w-0 rounded-[0.75rem] border border-white/10 bg-[color:var(--surface-strong)] px-2.5 text-sm text-[color:var(--foreground)] outline-none transition focus:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-35";

export function AdminOpeningHoursTable({ initialValue }: AdminOpeningHoursTableProps) {
  const [hours, setHours] = useState(initialValue);

  const updateDay = (
    dayKey: (typeof openingHourDayOrder)[number],
    field: keyof OpeningHoursValue[typeof dayKey],
    value: string | boolean,
  ) => {
    setHours((current) => ({
      ...current,
      [dayKey]: { ...current[dayKey], [field]: value },
    }));
  };

  const copyMonday = () => {
    const monday = hours.mon;
    setHours((current) =>
      openingHourDayOrder.reduce<OpeningHoursValue>(
        (next, dayKey) => ({ ...next, [dayKey]: { ...monday } }),
        current,
      ),
    );
  };

  const closeAll = () => {
    setHours((current) =>
      openingHourDayOrder.reduce<OpeningHoursValue>(
        (next, dayKey) => ({
          ...next,
          [dayKey]: { ...current[dayKey], isOpen: false },
        }),
        current,
      ),
    );
  };

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[color:var(--surface-strong)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="text-xs leading-5 text-[color:var(--muted-strong)]">
          Activa cada día y completa al menos el primer tramo.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyMonday}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-[color:var(--foreground)] transition hover:border-emerald-400/35"
          >
            <Copy aria-hidden="true" className="h-3.5 w-3.5" />
            Copiar lunes
          </button>
          <button
            type="button"
            onClick={closeAll}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-[color:var(--muted-strong)] transition hover:border-white/20 hover:text-[color:var(--foreground)]"
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            Cerrar todos
          </button>
        </div>
      </div>

      <div className="hidden grid-cols-[6rem_7rem_repeat(4,minmax(7rem,1fr))] gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] lg:grid">
        <span>Día</span>
        <span>Estado</span>
        <span>Abre</span>
        <span>Cierra</span>
        <span>2.º abre</span>
        <span>2.º cierra</span>
      </div>

      <div className="divide-y divide-white/8">
        {openingHourDayOrder.map((dayKey) => {
          const day = hours[dayKey];

          return (
            <div
              key={dayKey}
              className={`grid gap-3 px-4 py-4 transition sm:px-5 lg:grid-cols-[6rem_7rem_repeat(4,minmax(7rem,1fr))] lg:items-center lg:gap-2 ${
                day.isOpen ? "bg-emerald-400/[0.035]" : "bg-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-3 lg:block">
                <span className="text-sm font-bold text-[color:var(--foreground)]">
                  {openingHourDayLabels[dayKey]}
                </span>
                <span
                  className={`text-xs font-semibold lg:hidden ${
                    day.isOpen
                      ? "text-emerald-700"
                      : "text-[color:var(--muted-strong)]"
                  }`}
                >
                  {day.isOpen ? "Abierto" : "Cerrado"}
                </span>
              </div>

              <label className="inline-flex w-fit cursor-pointer items-center gap-2">
                <input
                  name={`openingHours.${dayKey}.isOpen`}
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(event) => updateDay(dayKey, "isOpen", event.target.checked)}
                  className="peer sr-only"
                />
                <span className="relative h-6 w-11 rounded-full bg-white/12 transition peer-checked:bg-emerald-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-300 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                <span className="hidden text-xs font-semibold text-[color:var(--muted-strong)] lg:inline">
                  {day.isOpen ? "Abierto" : "Cerrado"}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2 lg:contents">
                <label>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)] lg:hidden">Abre</span>
                  <input
                    name={`openingHours.${dayKey}.firstOpen`}
                    type="time"
                    value={day.firstOpen}
                    disabled={!day.isOpen}
                    required={day.isOpen}
                    onChange={(event) => updateDay(dayKey, "firstOpen", event.target.value)}
                    className={timeInputClassName}
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)] lg:hidden">Cierra</span>
                  <input
                    name={`openingHours.${dayKey}.firstClose`}
                    type="time"
                    value={day.firstClose}
                    disabled={!day.isOpen}
                    required={day.isOpen}
                    onChange={(event) => updateDay(dayKey, "firstClose", event.target.value)}
                    className={timeInputClassName}
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)] lg:hidden">2.º abre</span>
                  <input
                    name={`openingHours.${dayKey}.secondOpen`}
                    type="time"
                    value={day.secondOpen}
                    disabled={!day.isOpen}
                    required={day.isOpen && Boolean(day.secondClose)}
                    onChange={(event) => updateDay(dayKey, "secondOpen", event.target.value)}
                    className={timeInputClassName}
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)] lg:hidden">2.º cierra</span>
                  <input
                    name={`openingHours.${dayKey}.secondClose`}
                    type="time"
                    value={day.secondClose}
                    disabled={!day.isOpen}
                    required={day.isOpen && Boolean(day.secondOpen)}
                    onChange={(event) => updateDay(dayKey, "secondClose", event.target.value)}
                    className={timeInputClassName}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
