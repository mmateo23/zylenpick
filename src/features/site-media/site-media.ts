export const siteMediaAssetDefinitions = [
  {
    key: "home_hero",
    label: "Portada de la Home",
    description: "Fondo principal que se muestra en la primera pantalla de Pickyalo.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80",
  },
  {
    key: "dishes_hero",
    label: "Portada de Platos",
    description: "Fondo del bloque principal de la selección de productos y platos.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1778048840966-04589f37c525?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    key: "map_hero",
    label: "Portada del Mapa",
    description: "Imagen visual que acompaña la cabecera del explorador de mapa.",
    defaultImageUrl: "/home/zonas/badges/talavera_tile_letters.png",
  },
  {
    key: "join_hero",
    label: "Portada de Únete",
    description: "Imagen principal de la página para captar nuevos locales.",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "project_hero",
    label: "El Proyecto · apertura",
    description: "Fondo de la primera pantalla de El Proyecto.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1742845834625-4c68792709f1?q=80&w=2188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    key: "project_step_discover",
    label: "El Proyecto · origen",
    description: "Fotografía de la sección Pickyalo nace aquí.",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "project_step_order",
    label: "El Proyecto · producto",
    description: "Fotografía de producto de la sección La propuesta.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=3032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    key: "project_step_pickup",
    label: "El Proyecto · ciudad",
    description: "Fotografía de la sección dedicada a la ciudad.",
    defaultImageUrl: "/home/zonas/talavera-poster-local.webp",
  },
  {
    key: "project_idea",
    label: "El Proyecto · comercios",
    description: "Fotografía de la sección Para los comercios.",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "cart_empty_hero",
    label: "Cesta · vacía",
    description: "Fondo de la cesta cuando todavía no hay productos seleccionados.",
    defaultImageUrl: "/cart/empty-cart-talavera.jpg",
  },
  {
    key: "cart_active_hero",
    label: "Cesta · con productos",
    description: "Fondo de la cesta y del ticket cuando ya contiene productos.",
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
