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

function getMadridTimeValue(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function isCurrentTimeInsideRange(
  currentTime: string,
  start: string,
  end: string,
) {
  return Boolean(start && end && currentTime >= start && currentTime <= end);
}

export function getOpeningStatus(openingHours: OpeningHoursValue, now = new Date()) {
  const dayKey = getMadridWeekday(now);
  const dayValue = openingHours[dayKey];
  const currentTime = getMadridTimeValue(now);

  const isOpenNow =
    dayValue.isOpen &&
    (isCurrentTimeInsideRange(currentTime, dayValue.firstOpen, dayValue.firstClose) ||
      isCurrentTimeInsideRange(
        currentTime,
        dayValue.secondOpen,
        dayValue.secondClose,
      ));

  return {
    dayKey,
    isOpenNow,
  };
}
