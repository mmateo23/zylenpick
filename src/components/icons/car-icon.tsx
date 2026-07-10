import type { IconProps } from "@/components/icons/icon-base";
import { Car } from "lucide-react";

export function CarIcon({ size = 20, ...props }: IconProps) {
  return <Car size={size} strokeWidth={2} {...props} />;
}
