export const JOIN_PLAN_INTEREST_OPTIONS = [
  {
    value: "free_presence",
    title: "Estar en Pickyalo",
    eyebrow: "Empieza sin coste",
    subtitle: "Para empezar sin coste.",
    features: ["Local visible", "Carta visual", "Pedidos para recoger"],
    cta: "Quiero aparecer gratis",
  },
  {
    value: "improve_presence",
    title: "Cuidar mi presencia",
    eyebrow: "Haz que se entienda",
    subtitle: "Para que lo que haces se entienda y apetezca.",
    features: [
      "Presentación clara",
      "Carta revisada",
      "Ayuda con fotos, platos y alérgenos",
    ],
    cta: "Quiero mejorar mi ficha",
  },
  {
    value: "more_visibility",
    title: "Llegar a más personas",
    eyebrow: "Llega más lejos",
    subtitle: "Para llevar tus mejores platos donde se decide qué comer.",
    features: [
      "Platos en selecciones destacadas",
      "Participación en momentos y campañas",
      "Apoyo para elegir qué platos impulsar",
    ],
    cta: "Quiero que me descubra más gente",
  },
  {
    value: "guided_growth",
    title: "Crecer acompañado",
    eyebrow: "Avanza con apoyo",
    subtitle: "Para locales que quieren avanzar con alguien al lado.",
    features: [
      "Mayor frecuencia de visibilidad",
      "Campañas editoriales",
      "Informe mensual: qué ha funcionado y qué destacar",
    ],
    cta: "Quiero hablar con Pickyalo",
  },
] as const;

const JOIN_ADDITIONAL_INTEREST_OPTIONS = [
  {
    value: "commercial_consultation",
    title: "Hablar sobre planes y servicios",
  },
] as const;

export const JOIN_INTEREST_OPTIONS = [
  ...JOIN_PLAN_INTEREST_OPTIONS,
  ...JOIN_ADDITIONAL_INTEREST_OPTIONS,
] as const;

export type JoinPlanInterest =
  (typeof JOIN_PLAN_INTEREST_OPTIONS)[number]["value"];
export type JoinInterest = (typeof JOIN_INTEREST_OPTIONS)[number]["value"];

export function isJoinInterest(value: unknown): value is JoinInterest {
  return JOIN_INTEREST_OPTIONS.some((option) => option.value === value);
}

export function getJoinInterestLabel(value: JoinInterest | null | undefined) {
  return (
    JOIN_INTEREST_OPTIONS.find((option) => option.value === value)?.title ??
    "No indicado"
  );
}
