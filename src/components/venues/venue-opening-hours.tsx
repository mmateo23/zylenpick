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
    <section className="rounded-[1.2rem] border border-black/10 bg-white/70 p-5 shadow-[0_16px_44px_rgba(31,36,28,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/40">
            Horario
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[#10130f]">
            Horarios
          </h3>
        </div>

        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
            isOpenNow
              ? "bg-[#1f8a70]/10 text-[#11624f]"
              : "bg-[#E5484D]/10 text-[#9f2f32]"
          }`}
        >
          {isOpenNow ? "Abierto" : "Cerrado"}
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {groupedHours.map((group) => (
          <div
            key={group.key}
            className={`flex items-center justify-between gap-4 rounded-[0.9rem] border px-3 py-2.5 ${
              group.isClosed
                ? "border-[#E5484D]/20 bg-[#E5484D]/10"
                : "border-black/10 bg-white/60"
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  group.isClosed ? "text-[#9f2f32]" : "text-[#10130f]"
                }`}
              >
                {group.label}
              </p>
              <p
                className={`mt-1 text-sm ${
                  group.isClosed ? "text-[#9f2f32]/70" : "text-black/50"
                }`}
              >
                {group.formattedHours}
              </p>
            </div>

            <span
              className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] ${
                group.isClosed ? "text-[#9f2f32]/70" : "text-black/40"
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
