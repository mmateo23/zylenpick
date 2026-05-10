import type { DemoDishesTemplate } from "@/components/demo/demo-dishes-carousel";
import type { DemoHomeTemplate } from "@/components/demo/demo-home";

export const serviceShowcaseTemplate: {
  home: DemoHomeTemplate;
  dishes: DemoDishesTemplate;
} = {
  home: {
    logoSrc: "/logo/Pickyalo_Logo_Coral.svg",
    logoAlt: "Pickyalo",
    badgeLabel: "Ruta visual",
    accentBadgeLabel: "Platos primero",
    titleLeading: "Picky",
    titleAccent: "alo",
    heroDescription:
      "Descubre qué pedir en {location} con una dirección más clara, visual y cercana.",
    bodyCopy:
      "Una portada pensada para abrir el universo de {service} con menos ruido y una navegación directa hacia la exploración de productos, platos y locales cerca de {location}.",
    primaryCtaWithCity: "Explorar {city}",
    primaryCtaWithoutCity: "Explorar platos",
    secondaryCtaWithCity: "Ver locales cercanos",
    secondaryCtaWithoutCity: "Ver locales",
    previewPrimaryLabelWithCity: "Selección en {city}",
    previewPrimaryLabelWithoutCity: "Acceso principal",
    fallbackPrimaryCardLabelWithCity: "Selección en {city}",
    fallbackPrimaryCardLabelWithoutCity: "Acceso principal",
    fallbackPrimaryCardTitle: "Platos",
    fallbackSecondaryCardLabel: "Locales",
    fallbackMapCardLabel: "Ciudades",
    primaryHref: "/platos",
    cityHrefBase: "/zonas",
    citiesHref: "/zonas",
  },
  dishes: {
    logoSrc: "/logo/Pickyalo_Logo_Coral.svg",
    logoLightSrc: "/logo/Pickyalo_Logo_Coral.svg",
    logoDarkSrc: "/logo/Pickyalo_Logo_Coral.svg",
    logoClassName: "h-auto w-[108px] sm:w-[118px]",
    homeHref: "/",
    emptyEyebrow: "Platos",
    emptyTitle: "No hay platos disponibles",
    emptyDescription:
      "En cuanto haya platos con imagen, esta pantalla usara ese contenido real para construir el explorador visual.",
    backLabel: "Volver al inicio",
    backCompactLabel: "Inicio",
    heroEyebrow: "Decide rápido",
    heroTitle: "Elige qué comer ahora",
    heroDescription:
      "Mira platos reales de locales cercanos y elige uno para recoger sin darle mil vueltas.",
    searchLabel: "Buscar platos",
    searchInputId: "demo-platos-search",
    searchPlaceholder: "Buscar plato, local o categoría",
    noResultsEyebrow: "Sin coincidencias",
    noResultsDescription:
      "Prueba otra categoria o cambia la selección curada para ver más platos.",
    footerVariant: "zylenpick",
    promoHrefs: {
      "mira-que-pollo": "/platos",
      "simpre-fit": "/platos",
      "huelaa-bbq": "/platos",
    },
  },
};
