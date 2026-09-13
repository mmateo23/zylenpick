"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { getVenueOpeningStatus, openingHourDayOrder, type OpeningHoursValue } from "@/features/venues/opening-hours";

const dayNames = { mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado", sun: "Domingo" };

export function VenueQrWeek({ hours, manualOpenStatus }: { hours: OpeningHoursValue; manualOpenStatus?: boolean | null }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const status = now ? getVenueOpeningStatus(hours, manualOpenStatus, now) : null;
  const hasSchedule = openingHourDayOrder.some((key) => hours[key].isOpen || hours[key].firstOpen || hours[key].firstClose);

  return (
    <section aria-labelledby="qr-week-title" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#741314] pb-4">
        <h3 id="qr-week-title" className="flex items-center gap-2 text-lg font-bold text-[#741314]"><Clock3 size={20} aria-hidden="true" /> Horario semanal</h3>
        {(hasSchedule || typeof manualOpenStatus === "boolean") && status ? <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold ${status.state === "opening_soon" || status.state === "closing_soon" ? "bg-[#FFF0CC] text-[#704400]" : status.isOpenNow ? "bg-[#E5F1E8] text-[#245336]" : "bg-[#F4E1DD] text-[#741314]"}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{status.label}</span> : null}
      </div>
      {hasSchedule ? (
        <table className="w-full table-fixed border-collapse text-sm">
          <caption className="sr-only">Horario habitual, de lunes a domingo.</caption>
          <tbody>
            {openingHourDayOrder.map((key) => {
              const day = hours[key];
              const today = status?.dayKey === key;
              const ranges = [[day.firstOpen, day.firstClose], [day.secondOpen, day.secondClose]].filter(([open, close]) => open && close);
              return (
                <tr key={key} aria-current={today ? "date" : undefined} className={`border-b border-[#741314]/10 ${today ? "bg-[#FDE3AD]/60" : ""}`}>
                  <th scope="row" className="w-[44%] px-2 py-3 text-left font-medium"><span className={today ? "font-bold text-[#741314]" : ""}>{dayNames[key]}</span>{today ? <span className="ml-2 text-xs font-bold text-[#741314]">Hoy</span> : null}</th>
                  <td className="px-2 py-3 text-right tabular-nums">
                    {!day.isOpen ? <span className="text-[#741314]">Cerrado</span> : ranges.length ? ranges.map(([open, close], index) => <span key={index} className="block leading-6"><time>{open}</time> – <time>{close}</time>{close <= open ? <span className="ml-1 text-xs" title="Cierra al día siguiente">(+1)</span> : null}</span>) : "Por confirmar"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : <p className="py-5 text-base leading-6">Horario pendiente de confirmar. Pregunta en el local antes de volver.</p>}
      {hasSchedule ? <p className="mt-3 text-xs leading-5 text-[#62463E]">Horario habitual. Los festivos pueden variar.</p> : null}
    </section>
  );
}
