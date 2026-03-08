import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function CarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M5 16l1.5-5a2 2 0 0 1 1.9-1.4h7.2A2 2 0 0 1 17.5 11L19 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16h16v2.2a.8.8 0 0 1-.8.8H18a1 1 0 0 1-1-1V16H7v2a1 1 0 0 1-1 1H4.8a.8.8 0 0 1-.8-.8V16Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="16.2" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="16.2" r="1.2" fill="currentColor" />
    </IconBase>
  );
}
