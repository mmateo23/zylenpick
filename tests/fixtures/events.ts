import type { PublicEvent } from "../../src/features/events/events";

export const eventFixtures: PublicEvent[] = [
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

