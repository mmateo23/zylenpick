import type { SVGProps } from "react";

export type AnimatedIconProps = Omit<
  SVGProps<SVGSVGElement>,
  "width" | "height" | "className"
> & {
  size?: number;
  className?: string;
  strokeWidth?: number;
  animated?: boolean;
  active?: boolean;
  title?: string;
  loop?: boolean;
  triggerKey?: string | number;
};
