import type { IconProps } from "@/components/icons/icon-base";
import { Footprints } from "lucide-react";

export function StepsIcon({ size = 20, ...props }: IconProps) {
  return <Footprints size={size} strokeWidth={2} {...props} />;
}
