import type { IconProps } from "@/components/icons/icon-base";
import { PersonStanding } from "lucide-react";

export function WalkIcon({ size = 20, ...props }: IconProps) {
  return <PersonStanding size={size} strokeWidth={2} {...props} />;
}
