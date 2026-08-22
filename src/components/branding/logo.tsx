import Image from "next/image";

type LogoProps = {
  mode?: "icon" | "full";
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  priority?: boolean;
};

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function Logo({
  mode = "full",
  className,
  iconClassName,
  priority = false,
}: LogoProps) {
  return (
    <span className={joinClasses("inline-flex items-center gap-3", className)}>
      <Image
        src="/icons/pickyalo-app.svg"
        alt="Pickyalo"
        width={128}
        height={128}
        priority={priority}
        className={joinClasses(
          mode === "full" ? "h-12 w-12 shrink-0" : "h-6 w-6 shrink-0",
          iconClassName,
        )}
      />
    </span>
  );
}
