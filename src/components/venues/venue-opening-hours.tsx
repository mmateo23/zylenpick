import { VenueOpeningStatusBadge } from "@/components/venues/venue-opening-status-badge";
import {
  formatOpeningHoursDay,
  openingHourDayLabels,
  openingHourDayOrder,
  type OpeningStatus,
  type OpeningHoursValue,
} from "@/features/venues/opening-hours";

type VenueOpeningHoursProps = {
  openingHours: OpeningHoursValue;
  openingStatus: OpeningStatus;
};

type OpeningHoursGroup = {
  key: string;
  label: string;
  formattedHours: string;
  isClosed: boolean;
};

export function VenueOpeningHours({
  openingHours,
  openingStatus,
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
    <section
      id="horarios"
      className="scroll-mt-28 rounded-[22px] border border-[#741314]/20 bg-[#fffdf8] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#741314]">
            Cuándo ir
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#24110E]">
            Horario.
          </h3>
        </div>

        <VenueOpeningStatusBadge
          openingHours={openingHours}
          initialStatus={openingStatus}
        />
      </div>

      <div className="mt-5 space-y-2.5">
        {groupedHours.map((group) => (
          <div
            key={group.key}
            className={`flex items-center justify-between gap-4 rounded-[0.9rem] border px-3 py-2.5 ${
              group.isClosed
                ? "border-[#741314]/15 bg-[#FFE2E5]"
                : "border-[#741314]/15 bg-[#FFF7E8]"
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  group.isClosed ? "text-[#741314]" : "text-[#24110E]"
                }`}
              >
                {group.label}
              </p>
              <p
                className={`mt-1 text-sm ${
                  group.isClosed ? "text-[#741314]" : "text-[#61433A]"
                }`}
              >
                {group.formattedHours}
              </p>
            </div>

            <span
              className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] ${
                group.isClosed ? "text-danger/70" : "text-text-muted"
              }`}
            >
              {group.isClosed ? "No abre" : "Abre"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
