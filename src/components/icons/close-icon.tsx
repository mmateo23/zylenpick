import type { IconProps } from "@/components/icons/icon-base";
import { X } from "lucide-react";

export function CloseIcon({ size = 20, ...props }: IconProps) {
  return <X size={size} strokeWidth={2} {...props} />;
}
