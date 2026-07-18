import { cn } from "@/lib/utils";

import { AnimatedIconBase } from "./animated-icon-base";
import styles from "./animated-icons.module.css";
import type { AnimatedIconProps } from "./animated-icon-types";

export function PickyaloLocationIcon({
  animated = false,
  className,
  triggerKey = 0,
  ...props
}: AnimatedIconProps) {
  return (
    <AnimatedIconBase
      className={cn(styles.icon, animated && styles.locationAnimated, className)}
      {...props}
    >
      <g key={triggerKey}>
        <ellipse
          className={styles.locationShadow}
          cx="16"
          cy="28"
          rx="4.7"
          ry="1.2"
          fill="currentColor"
          stroke="none"
          opacity="0.2"
        />
        <g className={styles.locationPin}>
          <path d="M25.3 12.7c0 6.8-9.3 13.1-9.3 13.1S6.7 19.5 6.7 12.7a9.3 9.3 0 1 1 18.6 0Z" />
          <circle cx="16" cy="12.4" r="3.1" />
        </g>
      </g>
    </AnimatedIconBase>
  );
}
