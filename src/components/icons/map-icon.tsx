import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function MapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M4.5 6.5L9 4l6 2.5L19.5 4v13.5L15 20l-6-2.5L4.5 20V6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 4v13.5M15 6.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
