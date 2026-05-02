import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function CartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M7.5 9.5 10 5.5M16.5 9.5 14 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.2 9.5h13.6l-1.1 8.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5.2 9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13h6M10 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}
