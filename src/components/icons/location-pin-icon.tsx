import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function LocationPinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M12 21s6-4.6 6-10a6 6 0 1 0-12 0c0 5.4 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </IconBase>
  );
}
