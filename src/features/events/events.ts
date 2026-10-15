export type EventScheduleItem = {
  date: string;
  label: string;
  title: string;
  description?: string;
  time?: string;
  location?: string;
};

export type PublicEvent = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  description: string;
  startsOn: string;
  endsOn: string;
  city: { name: string; slug: string };
  locationLabel: string;
  venueNote?: string;
  accessLabel: string;
  accessNote?: string;
  organizer: string;
  websiteUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  verifiedOn: string;
  ticketsUrl?: string;
  directionsUrl?: string;
  imageUrl?: string;
  homeImageUrl?: string;
  imageAlt?: string;
  tags: string[];
  highlights: string[];
  schedule: EventScheduleItem[];
};

export type EventTemporalState = "upcoming" | "ongoing" | "past";

export function getMadridDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function getEventTemporalState(
  event: Pick<PublicEvent, "startsOn" | "endsOn">,
  today = getMadridDate(),
): EventTemporalState {
  if (today < event.startsOn) return "upcoming";
  if (today > event.endsOn) return "past";
  return "ongoing";
}

export function getUpcomingEvents(events: PublicEvent[], today = getMadridDate()) {
  return events
    .filter((event) => getEventTemporalState(event, today) !== "past")
    .sort((first, second) => first.startsOn.localeCompare(second.startsOn));
}


export function formatEventDateRange(event: Pick<PublicEvent, "startsOn" | "endsOn">) {
  const start = new Date(`${event.startsOn}T12:00:00+02:00`);
  const end = new Date(`${event.endsOn}T12:00:00+02:00`);
  const month = new Intl.DateTimeFormat("es-ES", { month: "long", timeZone: "Europe/Madrid" });
  if (event.startsOn === event.endsOn) {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Madrid",
    }).format(start);
  }
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} de ${month.format(start)} de ${end.getFullYear()}`;
  }
  return `${start.getDate()} de ${month.format(start)} – ${end.getDate()} de ${month.format(end)} de ${end.getFullYear()}`;
}
