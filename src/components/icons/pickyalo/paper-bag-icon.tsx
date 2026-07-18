import { cn } from "@/lib/utils";

import { AnimatedIconBase } from "./animated-icon-base";
import styles from "./animated-icons.module.css";
import type { AnimatedIconProps } from "./animated-icon-types";

export function PaperBagIcon({
  animated = false,
  className,
  triggerKey = 0,
  ...props
}: AnimatedIconProps) {
  return (
    <AnimatedIconBase
      className={cn(styles.icon, animated && styles.paperBagAnimated, className)}
      {...props}
    >
      <g key={triggerKey}>
        <g className={styles.bagBody}>
          <path d="M7.5 9.8 24.6 8.7c1.1-.1 1.8.5 1.9 1.6l1 15.5c.1 1.3-.6 2-1.9 2.1L8.2 27.5c-1.1 0-1.8-.7-1.7-1.8L7.5 9.8Z" />
          <path className={styles.bagSideFold} d="m8.2 13.8 3.1 2.2-.9 10.6" />
          <path className={styles.bagBottomFold} d="M10.5 26.7c4.7-1.5 10.2-1.7 16.1-.7" />
        </g>
        <path
          className={styles.bagTopFold}
          d="m7.5 9.8 17.1-1.1-1.4 4.6-15 0.5-.7-4Z"
        />
        <g className={styles.bagItem}>
          <rect x="13.1" y="1.8" width="6.4" height="5.5" rx="1.4" />
          <path d="M14.8 4.6h3" />
        </g>
      </g>
    </AnimatedIconBase>
  );
}
