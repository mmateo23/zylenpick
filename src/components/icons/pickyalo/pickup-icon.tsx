import { cn } from "@/lib/utils";

import { AnimatedIconBase } from "./animated-icon-base";
import styles from "./animated-icons.module.css";
import type { AnimatedIconProps } from "./animated-icon-types";

export function PickupOrderIcon({
  animated = false,
  className,
  triggerKey = 0,
  ...props
}: AnimatedIconProps) {
  return (
    <AnimatedIconBase
      className={cn(styles.icon, animated && styles.pickupAnimated, className)}
      {...props}
    >
      <g key={triggerKey}>
        <g className={styles.pickupBody}>
          <path d="M11 9.5 25 8.7l1.1 17.4-15.4.5L11 9.5Z" />
          <path d="m11 9.5 14-.8-1.2 4-12.4.4-.4-3.6Z" />
          <path d="M13.8 25.3c3.4-1 7.2-1.1 11.2-.4" />
        </g>
        <g className={styles.pickupArrow}>
          <path d="M3.8 17h7.1" />
          <path d="m7.8 13.9 3.2 3.1-3.2 3.1" />
        </g>
      </g>
    </AnimatedIconBase>
  );
}
