export const siteMediaAssetDefinitions = [
  {
    key: "home_hero",
    label: "Home hero",
    description: "Imagen principal de la home y selector inicial de zona.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80",
  },
  {
    key: "join_hero",
    label: "Unete hero",
    description: "Imagen principal de la pagina para captar nuevos locales.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "project_hero",
    label: "El proyecto hero",
    description: "Imagen de apertura de la pagina El proyecto.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80",
  },
  {
    key: "project_problem",
    label: "El proyecto problema",
    description: "Imagen de apoyo para la seccion del problema.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "project_idea",
    label: "El proyecto idea",
    description: "Imagen de apoyo para la seccion de la idea.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "project_step_discover",
    label: "Paso descubre",
    description: "Imagen del paso Descubre.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "project_step_order",
    label: "Paso pide",
    description: "Imagen del paso Pide.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "project_step_pickup",
    label: "Paso recoge",
    description: "Imagen del paso Recoge.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
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
