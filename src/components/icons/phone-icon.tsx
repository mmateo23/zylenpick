import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M8.8 6.6l1.2 2.4a1 1 0 0 1-.2 1.1l-1 1a11 11 0 0 0 4.1 4.1l1-1a1 1 0 0 1 1.1-.2l2.4 1.2a1 1 0 0 1 .5 1.2l-.7 2.2a1 1 0 0 1-1 .7c-6.2-.3-11.2-5.3-11.5-11.5a1 1 0 0 1 .7-1l2.2-.7a1 1 0 0 1 1.2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
