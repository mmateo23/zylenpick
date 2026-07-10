import type { IconProps } from "@/components/icons/icon-base";
import { Phone } from "lucide-react";

export function PhoneIcon({ size = 20, ...props }: IconProps) {
  return <Phone size={size} strokeWidth={2} {...props} />;
}
