import type { DemoDishesTemplate } from "@/components/demo/demo-dishes-carousel";
import type { DemoHomeTemplate } from "@/components/demo/demo-home";

export const serviceShowcaseTemplate: {
  home: DemoHomeTemplate;
  dishes: DemoDishesTemplate;
} = {
  home: {
    logoSrc: "/logo/ZylenPick_LOGO.svg",
    logoAlt: "ZylenPick",
    badgeLabel: "Ruta demo",
    accentBadgeLabel: "Platos primero",
    titleLeading: "Zylen",
    titleAccent: "Pick",
    heroDescription:
      "Descubre que pedir en {location} con una direccion mas clara, visual y cercana.",
    bodyCopy:
      "Una portada de demo pensada para abrir el universo de {service} con menos ruido y una navegacion directa hacia la exploracion de platos y locales cerca de {location}.",
    primaryCtaWithCity: "Explorar {city}",
    primaryCtaWithoutCity: "Explorar platos",
    secondaryCtaWithCity: "Ver locales cercanos",
    secondaryCtaWithoutCity: "Ver locales",
    previewPrimaryLabelWithCity: "Seleccion en {city}",
    previewPrimaryLabelWithoutCity: "Acceso principal",
    fallbackPrimaryCardLabelWithCity: "Seleccion en {city}",
    fallbackPrimaryCardLabelWithoutCity: "Acceso principal",
    fallbackPrimaryCardTitle: "Platos",
    fallbackSecondaryCardLabel: "Locales",
    fallbackMapCardLabel: "Ciudades",
    primaryHref: "/platos",
    cityHrefBase: "/zonas",
    citiesHref: "/zonas",
  },
  dishes: {
    logoSrc: "/logo/ZyelnpickLOGO_green.png",
    logoLightSrc: "/logo/ZyelnpickLOGO_green.png",
    logoDarkSrc: "/logo/ZyelnpickLOGO_green.png",
    logoClassName: "h-auto w-[50px] sm:w-[54px]",
    homeHref: "/",
    emptyEyebrow: "Platos",
    emptyTitle: "No hay platos disponibles",
    emptyDescription:
      "En cuanto haya platos con imagen, esta pantalla usara ese contenido real para construir el explorador visual.",
    backLabel: "Volver al inicio",
    backCompactLabel: "Inicio",
    heroEyebrow: "Explorador visual",
    heroTitle: "¿Que nos apetece hoy?",
    heroDescription:
      "Una forma visual de descubrir platos: foto primero, contexto justo y detalle solo al abrir.",
    searchLabel: "Buscar platos",
    searchInputId: "demo-platos-search",
    searchPlaceholder: "Buscar plato, local o categoria",
    noResultsEyebrow: "Sin coincidencias",
    noResultsDescription:
      "Prueba otra categoria o cambia la seleccion curada para ver mas platos.",
    footerVariant: "zylenpick",
    promoHrefs: {
      "mira-que-pollo": "/platos",
      "simpre-fit": "/platos",
      "huelaa-bbq": "/platos",
    },
  },
};
