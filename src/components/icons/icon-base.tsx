import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function IconBase({
  size = 20,
  className,
  children,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}
