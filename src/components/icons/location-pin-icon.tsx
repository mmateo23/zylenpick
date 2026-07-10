import type { IconProps } from "@/components/icons/icon-base";
import { MapPin } from "lucide-react";

export function LocationPinIcon({ size = 20, ...props }: IconProps) {
  return <MapPin size={size} strokeWidth={2} {...props} />;
}
