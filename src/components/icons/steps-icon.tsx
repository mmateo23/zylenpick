import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function StepsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M8.5 7.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2ZM18.5 15.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.2 11.2c.7.9 1.8 1.6 3 1.8M15.8 11.2c-.7-.9-1.8-1.6-3-1.8M11.8 17.6c-1.4 0-2.8-.5-3.8-1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
