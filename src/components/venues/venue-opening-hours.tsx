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

type OpeningHoursGroup = {
  key: string;
  label: string;
  formattedHours: string;
  isClosed: boolean;
};

export function VenueOpeningHours({
  openingHours,
  isOpenNow,
}: VenueOpeningHoursProps) {
  const groupedHours = openingHourDayOrder.reduce<OpeningHoursGroup[]>(
    (groups, dayKey) => {
      const dayValue = openingHours[dayKey];
      const isClosed =
        !dayValue.isOpen || !dayValue.firstOpen || !dayValue.firstClose;
      const formattedHours = formatOpeningHoursDay(dayValue);
      const dayLabel = openingHourDayLabels[dayKey];
      const lastGroup = groups[groups.length - 1];

      if (
        lastGroup &&
        lastGroup.formattedHours === formattedHours &&
        lastGroup.isClosed === isClosed
      ) {
        const [firstLabel] = lastGroup.label.split(" - ");
        lastGroup.label = `${firstLabel} - ${dayLabel}`;
        lastGroup.key = `${lastGroup.key}-${dayKey}`;
        return groups;
      }

      groups.push({
        key: dayKey,
        label: dayLabel,
        formattedHours,
        isClosed,
      });

      return groups;
    },
    [],
  );

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

      <div className="mt-6 space-y-3">
        {groupedHours.map((group) => (
          <div
            key={group.key}
            className={`flex items-center justify-between gap-4 rounded-[1.2rem] border px-4 py-3 ${
              group.isClosed
                ? "border-[#E5484D]/25 bg-[#E5484D]/8"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  group.isClosed
                    ? "text-[#FFB4B4]"
                    : "text-[color:var(--foreground)]"
                }`}
              >
                {group.label}
              </p>
              <p
                className={`mt-1 text-sm ${
                  group.isClosed
                    ? "text-[#FFB4B4]"
                    : "text-[color:var(--muted-strong)]"
                }`}
              >
                {group.formattedHours}
              </p>
            </div>

            <span
              className={`shrink-0 text-xs font-medium uppercase tracking-[0.18em] ${
                group.isClosed ? "text-[#FFB4B4]" : "text-[color:var(--muted)]"
              }`}
            >
              {group.isClosed ? "Cerrado" : "Abierto"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
