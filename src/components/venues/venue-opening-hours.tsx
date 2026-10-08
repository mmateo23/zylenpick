import { VenueOpeningStatusBadge } from "@/components/venues/venue-opening-status-badge";
import {
  formatOpeningHoursDay,
  hasOpeningHoursData,
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
  const hasKnownHours =
    openingStatus.source === "manual" || hasOpeningHoursData(openingHours);
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
      className="scroll-mt-28 rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface-strong)] p-5 text-[color:var(--text-primary)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[color:var(--brand-accent)]">
            Cuándo ir
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[color:var(--text-primary)]">
            Horario.
          </h3>
        </div>

        <VenueOpeningStatusBadge
          openingHours={openingHours}
          initialStatus={openingStatus}
        />
      </div>

      <div className="mt-5 space-y-2.5">
        {hasKnownHours ? groupedHours.map((group) => (
          <div
            key={group.key}
            className={`flex items-center justify-between gap-4 rounded-[0.9rem] border px-3 py-2.5 ${
              group.isClosed
                ? "border-[color:var(--border-subtle)] bg-[color:var(--bg-surface-muted)]"
                : "border-[color:var(--border-subtle)] bg-[color:var(--bg-page)]"
            }`}
          >
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-[color:var(--text-primary)]"
              >
                {group.label}
              </p>
              <p
                className="mt-1 text-sm text-[color:var(--text-secondary)]"
              >
                {group.formattedHours}
              </p>
            </div>

            <span
              className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] ${
                group.isClosed ? "text-danger" : "text-text-muted"
              }`}
            >
              {group.isClosed ? "No abre" : "Abre"}
            </span>
          </div>
        )) : (
          <p className="rounded-[0.9rem] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface-muted)] px-4 py-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Este local todavía no ha confirmado su horario.
          </p>
        )}
      </div>
    </section>
  );
}
