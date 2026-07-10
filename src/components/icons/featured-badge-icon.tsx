import { Star } from "lucide-react";

import type { IconProps } from "@/components/icons/icon-base";

export function FeaturedBadgeIcon({ size = 20, ...props }: IconProps) {
  return <Star size={size} strokeWidth={2} fill="currentColor" {...props} />;
}
