import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
