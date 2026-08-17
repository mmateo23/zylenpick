import type {
  MapPlaceCategory,
  MapPlacePlanRole,
} from "@/features/map-places/types";

export type MapPlaceCategoryDefinition = {
  value: MapPlaceCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  isActive: boolean;
  sortOrder: number;
};

export const mapPlaceCategories: MapPlaceCategoryDefinition[] = [
  ["bench", "Banco", "Armchair", 10],
  ["tables", "Mesa con bancos", "Table2", 20],
  ["playground", "Parque infantil", "Blocks", 30],
  ["park", "Parque o zona verde", "TreePine", 40],
  ["fountain", "Fuente", "Droplets", 50],
  ["toilets", "Aseos", "Toilet", 60],
  ["monument", "Monumento", "Landmark", 70],
  ["mural", "Mural y arte urbano", "Palette", 80],
  ["viewpoint", "Mirador", "Eye", 90],
  ["parking", "Aparcamiento", "CircleParking", 100],
  ["accessible", "Acceso adaptado", "Accessibility", 110],
  ["sports", "Zona deportiva", "Activity", 120],
  ["event", "Espacio de eventos", "CalendarDays", 130],
].map(([value, label, iconName, sortOrder]) => ({
  value: String(value),
  label: String(label),
  shortLabel: String(label),
  iconName: String(iconName),
  isActive: true,
  sortOrder: Number(sortOrder),
}));

export function getMapPlaceCategory(
  category: MapPlaceCategory,
  categories: MapPlaceCategoryDefinition[] = mapPlaceCategories,
) {
  return (
    categories.find((definition) => definition.value === category) ??
    mapPlaceCategories.find((definition) => definition.value === category) ?? {
      value: category,
      label: category,
      shortLabel: category,
      iconName: "MapPin",
      isActive: true,
      sortOrder: 100,
    }
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
