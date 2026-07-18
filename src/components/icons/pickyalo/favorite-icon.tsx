import { cn } from "@/lib/utils";

import { AnimatedIconBase } from "./animated-icon-base";
import styles from "./animated-icons.module.css";
import type { AnimatedIconProps } from "./animated-icon-types";

export function PickyaloFavoriteIcon({
  active = false,
  animated = false,
  className,
  triggerKey = active ? "active" : "idle",
  ...props
}: AnimatedIconProps) {
  return (
    <AnimatedIconBase
      className={cn(styles.icon, animated && styles.favoriteAnimated, className)}
      {...props}
    >
      <g key={triggerKey}>
        <circle
          className={styles.favoritePulse}
          cx="16"
          cy="15.7"
          r="11.6"
          opacity="0"
        />
        <path
          className={styles.favoriteHeart}
          fill={active ? "currentColor" : "none"}
          d="M16 27S5 20.6 5 12.7C5 8.9 7.7 6.4 11 6.4c2.2 0 4 1.2 5 3 1-1.8 2.8-3 5-3 3.3 0 6 2.5 6 6.3C27 20.6 16 27 16 27Z"
        />
      </g>
    </AnimatedIconBase>
  );
}
