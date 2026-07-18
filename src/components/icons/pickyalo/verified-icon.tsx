import { cn } from "@/lib/utils";

import { AnimatedIconBase } from "./animated-icon-base";
import styles from "./animated-icons.module.css";
import type { AnimatedIconProps } from "./animated-icon-types";

export function PickyaloVerifiedIcon({
  animated = false,
  className,
  triggerKey = 0,
  ...props
}: AnimatedIconProps) {
  return (
    <AnimatedIconBase
      className={cn(styles.icon, animated && styles.verifiedAnimated, className)}
      {...props}
    >
      <g key={triggerKey}>
        <circle className={styles.verifiedCircle} cx="16" cy="16" r="11.6" />
        <path className={styles.verifiedCheck} d="m10.4 16.2 3.6 3.7 7.8-8.1" />
      </g>
    </AnimatedIconBase>
  );
}
