import type { IconProps } from "@/components/icons/icon-base";
import { Map } from "lucide-react";

export function MapIcon({ size = 20, ...props }: IconProps) {
  return <Map size={size} strokeWidth={2} {...props} />;
}
