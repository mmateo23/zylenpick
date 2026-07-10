import type { IconProps } from "@/components/icons/icon-base";
import { ShoppingBag } from "lucide-react";

export function CartIcon({ size = 20, ...props }: IconProps) {
  return <ShoppingBag size={size} strokeWidth={2} {...props} />;
}
