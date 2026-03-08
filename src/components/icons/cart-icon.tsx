import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function CartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M4 6h2.2l1.8 8.2a1 1 0 0 0 1 .8h7.8a1 1 0 0 0 1-.8L19.5 8H7.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18.5" r="1.25" fill="currentColor" />
      <circle cx="17" cy="18.5" r="1.25" fill="currentColor" />
    </IconBase>
  );
}
