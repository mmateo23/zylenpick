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
  imageUrl?: string;
  homeImageUrl?: string;
  imageAlt?: string;
  tags: string[];
  highlights: string[];
  schedule: EventScheduleItem[];
};

/**
 * Editorial events stay deliberately small for now. The shape is ready for
 * records from Supabase later, while this first verified example remains easy
 * to audit and update from its official source.
 */
export const publicEvents: PublicEvent[] = [
  {
    slug: "autocross-cerro-negro-2026",
    title: "XII Autocross Cerro Negro",
    shortTitle: "Autocross Cerro Negro",
    eyebrow: "Motor · prueba regional",
    summary:
      "Una mañana de autocross sobre tierra en el Circuito Municipal Cerro Negro.",
    description:
      "El Circuito Municipal Cerro Negro acoge una nueva jornada de autocross organizada por la Escudería Cerro Negro. La prueba es puntuable para los campeonatos de Castilla-La Mancha, Extremadura y Castilla y León, con calificación, mangas clasificatorias y finales.",
    startsOn: "2026-09-27",
    endsOn: "2026-09-27",
    city: { name: "Talavera de la Reina", slug: "talavera-de-la-reina" },
    locationLabel: "Circuito Municipal Cerro Negro",
    venueNote: "Talavera de la Reina",
    accessLabel: "Entrada única: 5 €",
    accessNote: "Socios y niños de hasta 12 años, gratis.",
    organizer: "Escudería Cerro Negro",
    websiteUrl:
      "https://www.escuderiacerronegro.com/noticias/xii-autocross-cerro-negro/",
    sourceUrl:
      "https://www.escuderiacerronegro.com/noticias/xii-autocross-cerro-negro/",
    sourceLabel: "Web oficial de Escudería Cerro Negro y cartel del evento",
    verifiedOn: "2026-09-25",
    imageUrl: "/events/autocross-cerro-negro-2026.jpg",
    homeImageUrl: "/events/autocross-drive.png",
    imageAlt:
      "Cartel del Autocross Cerro Negro del 27 de septiembre de 2026",
    tags: ["Motor", "Autocross", "Deporte", "Aire libre"],
    highlights: [
      "Prueba sobre tierra",
      "Puntuable para los campeonatos FACM, FEXA y FACYL",
      "Entrada única de 5 €",
      "Socios y niños de hasta 12 años, gratis",
    ],
    schedule: [
      {
        date: "2026-09-27",
        label: "27 de septiembre",
        time: "10:00",
        title: "Sesión de calificación",
      },
      {
        date: "2026-09-27",
        label: "27 de septiembre",
        time: "11:30",
        title: "Mangas clasificatorias",
      },
      {
        date: "2026-09-27",
        label: "27 de septiembre",
        time: "13:00",
        title: "Finales",
      },
    ],
  },
];

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

export function getUpcomingEvents(today = getMadridDate()) {
  return publicEvents
    .filter((event) => getEventTemporalState(event, today) !== "past")
    .sort((first, second) => first.startsOn.localeCompare(second.startsOn));
}

export function getEventBySlug(slug: string) {
  return publicEvents.find((event) => event.slug === slug) ?? null;
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
