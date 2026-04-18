import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

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
  textClassName,
  priority = false,
}: LogoProps) {
  return (
    <span className={joinClasses("inline-flex items-center gap-3", className)}>
      <Image
        src="/logo/ZyelnpickLOGO_green.png"
        alt="ZylenPick"
        width={512}
        height={512}
        priority={priority}
        className={joinClasses("h-6 w-auto shrink-0", iconClassName)}
      />

      {mode === "full" ? (
        <span
          className={joinClasses(
            inter.className,
            "text-lg font-semibold tracking-[-0.02em] text-current",
            textClassName,
          )}
        >
          ZylenPick
        </span>
      ) : null}
    </span>
  );
}
