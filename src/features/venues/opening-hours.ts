export const openingHourDayOrder = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type OpeningHoursDayKey = (typeof openingHourDayOrder)[number];

export type OpeningHoursDayValue = {
  isOpen: boolean;
  firstOpen: string;
  firstClose: string;
  secondOpen: string;
  secondClose: string;
};

export type OpeningHoursValue = Record<OpeningHoursDayKey, OpeningHoursDayValue>;

export type OpeningStatusState =
  | "open"
  | "closed"
  | "opening_soon"
  | "closing_soon";

export type OpeningStatus = {
  dayKey: OpeningHoursDayKey;
  isOpenNow: boolean;
  state: OpeningStatusState;
  label: string;
  minutesUntilChange: number | null;
};

export const openingHourDayLabels: Record<OpeningHoursDayKey, string> = {
  mon: "L",
  tue: "M",
  wed: "X",
  thu: "J",
  fri: "V",
  sat: "S",
  sun: "D",
};

function createDefaultDayValue(): OpeningHoursDayValue {
  return {
    isOpen: false,
    firstOpen: "",
    firstClose: "",
    secondOpen: "",
    secondClose: "",
  };
}

export function createDefaultOpeningHours(): OpeningHoursValue {
  return {
    mon: createDefaultDayValue(),
    tue: createDefaultDayValue(),
    wed: createDefaultDayValue(),
    thu: createDefaultDayValue(),
    fri: createDefaultDayValue(),
    sat: createDefaultDayValue(),
    sun: createDefaultDayValue(),
  };
}

export function normalizeOpeningHours(
  value: unknown,
): OpeningHoursValue {
  const baseValue = createDefaultOpeningHours();

  if (!value || typeof value !== "object") {
    return baseValue;
  }

  for (const dayKey of openingHourDayOrder) {
    const dayValue = (value as Record<string, unknown>)[dayKey];

    if (!dayValue || typeof dayValue !== "object") {
      continue;
    }

    const dayRecord = dayValue as Record<string, unknown>;
    baseValue[dayKey] = {
      isOpen: Boolean(dayRecord.isOpen),
      firstOpen: typeof dayRecord.firstOpen === "string" ? dayRecord.firstOpen : "",
      firstClose:
        typeof dayRecord.firstClose === "string" ? dayRecord.firstClose : "",
      secondOpen:
        typeof dayRecord.secondOpen === "string" ? dayRecord.secondOpen : "",
      secondClose:
        typeof dayRecord.secondClose === "string" ? dayRecord.secondClose : "",
    };
  }

  return baseValue;
}

export function formatOpeningHoursDay(day: OpeningHoursDayValue) {
  if (!day.isOpen || !day.firstOpen || !day.firstClose) {
    return "Cerrado";
  }

  const firstRange = `${day.firstOpen} - ${day.firstClose}`;

  if (day.secondOpen && day.secondClose) {
    return `${firstRange} · ${day.secondOpen} - ${day.secondClose}`;
  }

  return firstRange;
}

function getMadridWeekday(date: Date): OpeningHoursDayKey {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    weekday: "short",
  }).format(date);

  switch (weekday) {
    case "Mon":
      return "mon";
    case "Tue":
      return "tue";
    case "Wed":
      return "wed";
    case "Thu":
      return "thu";
    case "Fri":
      return "fri";
    case "Sat":
      return "sat";
    default:
      return "sun";
  }
}

function getMadridTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
  };
}

function parseTimeToMinutes(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function formatTransitionLabel(action: "Abre" | "Cierra", minutes: number) {
  if (minutes <= 1) return `${action} en 1 min`;
  return `${action} en ${minutes} min`;
}

export function getOpeningStatus(
  openingHours: OpeningHoursValue,
  now = new Date(),
  soonThresholdMinutes = 30,
): OpeningStatus {
  const dayKey = getMadridWeekday(now);
  const dayIndex = openingHourDayOrder.indexOf(dayKey);
  const madridTime = getMadridTimeParts(now);
  const currentWeekMinute = dayIndex * 24 * 60 + madridTime.hour * 60 + madridTime.minute;
  const weekMinutes = 7 * 24 * 60;
  const intervals: Array<{ start: number; end: number }> = [];

  openingHourDayOrder.forEach((key, index) => {
    const day = openingHours[key];
    if (!day.isOpen) return;

    const ranges = [
      [day.firstOpen, day.firstClose],
      [day.secondOpen, day.secondClose],
    ] as const;

    ranges.forEach(([open, close]) => {
      const openMinutes = parseTimeToMinutes(open);
      const closeMinutes = parseTimeToMinutes(close);
      if (openMinutes === null || closeMinutes === null) return;

      const baseStart = index * 24 * 60 + openMinutes;
      const baseEnd = index * 24 * 60 + closeMinutes + (closeMinutes <= openMinutes ? 24 * 60 : 0);

      for (const weekOffset of [-weekMinutes, 0, weekMinutes]) {
        intervals.push({
          start: baseStart + weekOffset,
          end: baseEnd + weekOffset,
        });
      }
    });
  });

  const currentInterval = intervals.find(
    (interval) => currentWeekMinute >= interval.start && currentWeekMinute < interval.end,
  );

  if (currentInterval) {
    const minutesUntilClose = currentInterval.end - currentWeekMinute;
    if (minutesUntilClose <= soonThresholdMinutes) {
      return {
        dayKey,
        isOpenNow: true,
        state: "closing_soon",
        label: formatTransitionLabel("Cierra", minutesUntilClose),
        minutesUntilChange: minutesUntilClose,
      };
    }

    return {
      dayKey,
      isOpenNow: true,
      state: "open",
      label: "Abierto ahora",
      minutesUntilChange: minutesUntilClose,
    };
  }

  const nextInterval = intervals
    .filter((interval) => interval.start > currentWeekMinute)
    .sort((first, second) => first.start - second.start)[0];
  const minutesUntilOpen = nextInterval ? nextInterval.start - currentWeekMinute : null;

  if (minutesUntilOpen !== null && minutesUntilOpen <= soonThresholdMinutes) {
    return {
      dayKey,
      isOpenNow: false,
      state: "opening_soon",
      label: formatTransitionLabel("Abre", minutesUntilOpen),
      minutesUntilChange: minutesUntilOpen,
    };
  }

  return {
    dayKey,
    isOpenNow: false,
    state: "closed",
    label: "Cerrado ahora",
    minutesUntilChange: minutesUntilOpen,
  };
}
