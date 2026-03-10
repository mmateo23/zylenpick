import {
  formatOpeningHoursDay,
  openingHourDayLabels,
  openingHourDayOrder,
  type OpeningHoursValue,
} from "@/features/venues/opening-hours";

type VenueOpeningHoursProps = {
  openingHours: OpeningHoursValue;
  isOpenNow: boolean;
};

export function VenueOpeningHours({
  openingHours,
  isOpenNow,
}: VenueOpeningHoursProps) {
  return (
    <section className="glass-panel rounded-[2.3rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Horario
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Horarios del local
          </h3>
        </div>

        <span
          className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${
            isOpenNow
              ? "bg-[color:var(--brand-soft)] text-[color:var(--accent)]"
              : "bg-[#E5484D]/12 text-[#FFB4B4]"
          }`}
        >
          {isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {openingHourDayOrder.map((dayKey) => {
          const dayValue = openingHours[dayKey];
          const isClosed = !dayValue.isOpen || !dayValue.firstOpen || !dayValue.firstClose;

          return (
            <div
              key={dayKey}
              className={`grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 rounded-[1.2rem] border p-4 ${
                isClosed
                  ? "border-[#E5484D]/25 bg-[#E5484D]/8"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  isClosed
                    ? "bg-[#E5484D]/12 text-[#FFB4B4]"
                    : "bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
                }`}
              >
                {openingHourDayLabels[dayKey]}
              </span>
              <div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  {formatOpeningHoursDay(dayValue)}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    isClosed ? "text-[#FFB4B4]" : "text-[color:var(--muted)]"
                  }`}
                >
                  {isClosed ? "Cerrado" : "Abierto"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
