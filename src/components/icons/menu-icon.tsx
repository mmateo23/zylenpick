import type { IconProps } from "@/components/icons/icon-base";
import { Menu } from "lucide-react";

export function MenuIcon({ size = 20, ...props }: IconProps) {
  return <Menu size={size} strokeWidth={2} {...props} />;
}
