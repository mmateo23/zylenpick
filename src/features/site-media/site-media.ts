export const siteMediaPageDefinitions = [
  { key: "home", label: "Home", route: "/" },
  { key: "dishes", label: "Platos", route: "/platos" },
  { key: "map", label: "Mapa", route: "/mapa" },
  { key: "join", label: "Únete", route: "/unete" },
  { key: "project", label: "El proyecto", route: "/el-proyecto" },
  { key: "cart", label: "Cesta", route: "/cart" },
] as const;

export type SiteMediaPageKey = (typeof siteMediaPageDefinitions)[number]["key"];

export const siteMediaAssetDefinitions = [
  {
    key: "home_hero",
    page: "home",
    slot: "Hero principal",
    label: "Portada de la Home",
    description: "Fondo principal que se muestra en la primera pantalla de Pickyalo.",
    recommendedSize: "1800 × 1200 px · horizontal",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80",
  },
  {
    key: "home_map_feature",
    page: "home",
    slot: "Bloque Explora",
    label: "Post del mapa",
    description: "Imagen protagonista del post que presenta el mapa y la ciudad en la Home.",
    recommendedSize: "1200 × 960 px · 5:4",
    defaultImageUrl: "/home/zonas/badges/talavera_tile_mural.png",
  },
  {
    key: "dishes_hero",
    page: "dishes",
    slot: "Hero principal",
    label: "Portada de Platos",
    description: "Fondo del bloque principal de la selección de productos y platos.",
    recommendedSize: "1800 × 1200 px · horizontal",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1778048840966-04589f37c525?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    key: "map_hero",
    page: "map",
    slot: "Hero principal",
    label: "Portada del Mapa",
    description: "Imagen visual que acompaña la cabecera del explorador de mapa.",
    recommendedSize: "1400 × 900 px · horizontal",
    defaultImageUrl: "/home/zonas/badges/talavera_tile_letters.png",
  },
  {
    key: "join_hero",
    page: "join",
    slot: "Hero principal",
    label: "Portada de Únete",
    description: "Imagen principal de la página para captar nuevos locales.",
    recommendedSize: "1600 × 1200 px · horizontal",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "join_plan_free",
    page: "join",
    slot: "Planes · 01",
    label: "Estar en Pickyalo",
    description: "Fotografía del primer plan público para empezar sin coste.",
    recommendedSize: "1200 × 960 px · 5:4",
    defaultImageUrl: "/home/zonas/talavera-poster-local.webp",
  },
  {
    key: "join_plan_presence",
    page: "join",
    slot: "Planes · 02",
    label: "Cuidar mi presencia",
    description: "Fotografía del plan dedicado a mejorar la presentación del local.",
    recommendedSize: "1200 × 960 px · 5:4",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "join_plan_visibility",
    page: "join",
    slot: "Planes · 03",
    label: "Llegar a más personas",
    description: "Fotografía del plan centrado en dar visibilidad a los mejores platos.",
    recommendedSize: "1200 × 960 px · 5:4",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop",
  },
  {
    key: "join_plan_growth",
    page: "join",
    slot: "Planes · 04",
    label: "Crecer acompañado",
    description: "Fotografía del plan de acompañamiento continuado.",
    recommendedSize: "1200 × 960 px · 5:4",
    defaultImageUrl: "/home/project/project_post_pickyalo.png",
  },
  {
    key: "join_showcase",
    page: "join",
    slot: "Demostración visual",
    label: "Así puede aparecer tu local",
    description: "Imagen del ejemplo que enseña cómo se presenta un producto en Pickyalo.",
    recommendedSize: "1200 × 1500 px · vertical",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop",
  },
  {
    key: "project_hero",
    page: "project",
    slot: "Hero principal",
    label: "El Proyecto · apertura",
    description: "Fondo de la primera pantalla de El Proyecto.",
    recommendedSize: "1800 × 1200 px · horizontal",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1742845834625-4c68792709f1?q=80&w=2188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    key: "project_step_discover",
    page: "project",
    slot: "Sección Origen",
    label: "El Proyecto · origen",
    description: "Fotografía de la sección Pickyalo nace aquí.",
    recommendedSize: "1400 × 1050 px · 4:3",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "project_step_order",
    page: "project",
    slot: "Sección Propuesta",
    label: "El Proyecto · producto",
    description: "Fotografía de producto de la sección La propuesta.",
    recommendedSize: "1400 × 1050 px · 4:3",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=3032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    key: "project_step_pickup",
    page: "project",
    slot: "Sección Ciudad",
    label: "El Proyecto · ciudad",
    description: "Fotografía de la sección dedicada a la ciudad.",
    recommendedSize: "1400 × 1050 px · 4:3",
    defaultImageUrl: "/home/zonas/talavera-poster-local.webp",
  },
  {
    key: "project_idea",
    page: "project",
    slot: "Sección Comercios",
    label: "El Proyecto · comercios",
    description: "Fotografía de la sección Para los comercios.",
    recommendedSize: "1400 × 1050 px · 4:3",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "cart_empty_hero",
    page: "cart",
    slot: "Estado vacío",
    label: "Cesta · vacía",
    description: "Fondo de la cesta cuando todavía no hay productos seleccionados.",
    recommendedSize: "1800 × 1200 px · horizontal",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "cart_active_hero",
    page: "cart",
    slot: "Estado con productos",
    label: "Cesta · con productos",
    description: "Fondo de la cesta y del ticket cuando ya contiene productos.",
    recommendedSize: "1800 × 1200 px · horizontal",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1528459105426-b9548367069b?q=85&w=1800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
] as const;

export type SiteMediaAssetKey = (typeof siteMediaAssetDefinitions)[number]["key"];

export type SiteMediaAssetDefinition = (typeof siteMediaAssetDefinitions)[number];

export type SiteMediaAssetItem = {
  key: SiteMediaAssetKey;
  label: string;
  description: string;
  imageUrl: string;
};

export type SiteMediaAssetMap = Record<SiteMediaAssetKey, SiteMediaAssetItem>;

export function getDefaultSiteMediaAssetMap(): SiteMediaAssetMap {
  return siteMediaAssetDefinitions.reduce((map, asset) => {
    map[asset.key] = {
      key: asset.key,
      label: asset.label,
      description: asset.description,
      imageUrl: asset.defaultImageUrl,
    };

    return map;
  }, {} as SiteMediaAssetMap);
}
