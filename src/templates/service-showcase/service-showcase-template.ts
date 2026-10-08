import type { DemoDishesTemplate } from "@/components/demo/demo-dishes-carousel";
import type { DemoHomeTemplate } from "@/components/demo/demo-home";

export const serviceShowcaseTemplate: {
  home: DemoHomeTemplate;
  dishes: DemoDishesTemplate;
} = {
  home: {
    logoSrc: "/icons/pickyalo-app.svg",
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
    logoSrc: "/icons/pickyalo-app.svg",
    logoLightSrc: "/icons/pickyalo-app.svg",
    logoDarkSrc: "/icons/pickyalo-app.svg",
    logoClassName: "h-12 w-12 sm:h-14 sm:w-14",
    homeHref: "/",
    emptyEyebrow: "Lo local",
    emptyTitle: "La selección estará aquí pronto",
    emptyDescription:
      "Estamos preparando productos, platos y propuestas de los locales de Talavera.",
    backLabel: "Volver al inicio",
    backCompactLabel: "Inicio",
    heroEyebrow: "El escaparate local",
    heroTitle: "Lo de aquí se descubre mirando.",
    heroDescription:
      "Productos, platos y packs de Talavera. Mira la selección y conoce al local que hay detrás.",
    searchLabel: "Buscar productos",
    searchInputId: "demo-platos-search",
    searchPlaceholder: "Buscar producto, pack o local",
    noResultsEyebrow: "Sin coincidencias",
    noResultsDescription:
      "Prueba otro producto, local o categoría.",
    footerVariant: "zylenpick",
    promoHrefs: {
      "mira-que-pollo": "/platos",
      "simpre-fit": "/platos",
      "huelaa-bbq": "/platos",
    },
  },
};
