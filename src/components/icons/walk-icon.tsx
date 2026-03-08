import type { IconProps } from "@/components/icons/icon-base";
import { IconBase } from "@/components/icons/icon-base";

export function WalkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="14" cy="5" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12.5 20l1.3-5-2.4-2.1-2.2 2.2M12 9l-2.6 3.2 3 2.5 3.8-.9M10.5 8.7l2 1.3 2.8-.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
