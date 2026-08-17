import type { ComponentProps } from "react";
import {
  Accessibility,
  Activity,
  Armchair,
  Baby,
  Bike,
  Blocks,
  CalendarDays,
  Camera,
  CircleDot,
  CircleParking,
  Coffee,
  Droplets,
  Eye,
  Landmark,
  MapPin,
  Palette,
  PersonStanding,
  ShoppingBag,
  Table2,
  Toilet,
  TreePine,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";

const iconRegistry = {
  Accessibility,
  Activity,
  Armchair,
  Baby,
  Bike,
  Blocks,
  CalendarDays,
  Camera,
  CircleDot,
  CircleParking,
  Coffee,
  Droplets,
  Eye,
  Landmark,
  MapPin,
  Palette,
  PersonStanding,
  ShoppingBag,
  Table2,
  Toilet,
  TreePine,
  Utensils,
  Waves,
} satisfies Record<string, LucideIcon>;

export const mapPlaceIconOptions = Object.keys(iconRegistry).sort();

export function getMapPlaceIcon(iconName: string): LucideIcon {
  return iconRegistry[iconName as keyof typeof iconRegistry] ?? MapPin;
}

type MapPlaceIconProps = Omit<ComponentProps<LucideIcon>, "ref"> & {
  name: string;
};

export function MapPlaceIcon({ name, ...props }: MapPlaceIconProps) {
  const Icon = getMapPlaceIcon(name);
  return <Icon {...props} />;
}
