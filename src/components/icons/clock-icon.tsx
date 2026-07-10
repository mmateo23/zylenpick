import type { IconProps } from "@/components/icons/icon-base";
import { Clock } from "lucide-react";

export function ClockIcon({ size = 20, ...props }: IconProps) {
  return <Clock size={size} strokeWidth={2} {...props} />;
}
