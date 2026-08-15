import type {
  MapPlaceCategory,
  MapPlacePlanRole,
} from "@/features/map-places/types";

export type MapPlaceCategoryDefinition = {
  value: MapPlaceCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  markerPath: string;
};

export const mapPlaceCategories: MapPlaceCategoryDefinition[] = [
  {
    value: "bench",
    label: "Banco",
    shortLabel: "Bancos",
    iconName: "bench",
    markerPath: '<path d="M5 11h14v4H5zM7 7h10v4H7zM7 15v5M17 15v5"/>',
  },
  {
    value: "tables",
    label: "Mesa con bancos",
    shortLabel: "Mesas",
    iconName: "table",
    markerPath: '<path d="M4 10h16M6 6h12v4H6zM7 10l-1 8M17 10l1 8"/>',
  },
  {
    value: "playground",
    label: "Parque infantil",
    shortLabel: "Juegos",
    iconName: "blocks",
    markerPath: '<path d="M5 4h6v6H5zM13 4h6v6h-6zM9 12h6v7H9z"/>',
  },
  {
    value: "park",
    label: "Parque o zona verde",
    shortLabel: "Parques",
    iconName: "tree",
    markerPath: '<path d="M12 3 7 10h3l-4 6h5v4M12 3l5 7h-3l4 6h-7"/>',
  },
  {
    value: "fountain",
    label: "Fuente",
    shortLabel: "Fuentes",
    iconName: "droplets",
    markerPath: '<path d="M12 3s4 4.5 4 8a4 4 0 0 1-8 0c0-3.5 4-8 4-8zM5 19h14"/>',
  },
  {
    value: "toilets",
    label: "Aseos",
    shortLabel: "Aseos",
    iconName: "toilets",
    markerPath: '<circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/><path d="M8 9v10M5 13h6M16 9l-3 10M16 9l3 10M13 14h6"/>',
  },
  {
    value: "monument",
    label: "Monumento",
    shortLabel: "Monumentos",
    iconName: "landmark",
    markerPath: '<path d="m4 9 8-5 8 5M5 20h14M7 17V10M12 17V10M17 17V10"/>',
  },
  {
    value: "mural",
    label: "Mural y arte urbano",
    shortLabel: "Murales",
    iconName: "palette",
    markerPath: '<path d="M5 4h14v16H5zM8 8h8M8 12h5M8 16h8"/><path d="m15 11 2-2 2 2"/>',
  },
  {
    value: "viewpoint",
    label: "Mirador",
    shortLabel: "Miradores",
    iconName: "eye",
    markerPath: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
  },
  {
    value: "parking",
    label: "Aparcamiento",
    shortLabel: "Parking",
    iconName: "parking",
    markerPath: '<path d="M7 20V4h6a5 5 0 0 1 0 10H7M7 14h6"/>',
  },
  {
    value: "accessible",
    label: "Acceso adaptado",
    shortLabel: "Accesible",
    iconName: "accessibility",
    markerPath: '<circle cx="12" cy="4" r="2"/><path d="M8 9h5l2 4h3M10 9l-1 5a4 4 0 1 0 6 4"/>',
  },
  {
    value: "sports",
    label: "Zona deportiva",
    shortLabel: "Deporte",
    iconName: "activity",
    markerPath: '<circle cx="12" cy="12" r="8"/><path d="M5.5 8h13M5.5 16h13M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>',
  },
  {
    value: "event",
    label: "Espacio de eventos",
    shortLabel: "Eventos",
    iconName: "calendar",
    markerPath: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3"/>',
  },
];

export function getMapPlaceCategory(category: MapPlaceCategory) {
  return (
    mapPlaceCategories.find((definition) => definition.value === category) ??
    mapPlaceCategories[0]
  );
}

export function getDefaultMapPlacePlanRole(
  category: MapPlaceCategory,
): MapPlacePlanRole {
  if (["monument", "mural", "event"].includes(category)) return "discover";
  if (["bench", "tables", "playground", "park", "viewpoint", "sports"].includes(category)) {
    return "enjoy";
  }
  return "support";
}
