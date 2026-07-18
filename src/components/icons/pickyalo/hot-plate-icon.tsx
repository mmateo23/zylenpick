import { cn } from "@/lib/utils";

import { AnimatedIconBase } from "./animated-icon-base";
import styles from "./animated-icons.module.css";
import type { AnimatedIconProps } from "./animated-icon-types";

export function HotPlateIcon({
  animated = false,
  loop = true,
  className,
  triggerKey = 0,
  ...props
}: AnimatedIconProps) {
  return (
    <AnimatedIconBase
      className={cn(
        styles.icon,
        animated && styles.hotPlateAnimated,
        animated && loop && styles.hotPlateLoop,
        className,
      )}
      {...props}
    >
      <g key={triggerKey}>
        <path d="M5 23.5c2.7 2.7 19.3 2.7 22 0" />
        <path d="M7.2 21.3h17.6c-.9-5.1-4.2-8-8.8-8s-7.9 2.9-8.8 8Z" />
        <path d="M4.3 21.5h23.4" />
        <path className={styles.steam} d="M11.2 10.4c-2-2.1 1.8-2.9.2-5.1" />
        <path className={cn(styles.steam, styles.steamTwo)} d="M16 9.6c-2-2.2 2-3 .2-5.4" />
        <path className={cn(styles.steam, styles.steamThree)} d="M20.8 10.4c-2-2.1 1.8-2.9.2-5.1" />
      </g>
    </AnimatedIconBase>
  );
}
