import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function FeaturedBadgeIcon(props: IconProps) {
  return (
    <IconBase {...props} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5l2.35 4.76 5.25.76-3.8 3.71.9 5.23L12 15.5l-4.7 2.46.9-5.23-3.8-3.71 5.25-.76L12 3.5z"
        fill="currentColor"
      />
    </IconBase>
  );
}
