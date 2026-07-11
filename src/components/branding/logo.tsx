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
        src={mode === "full" ? "/logo/LogoNuevo.svg" : "/logo/Agrupar.svg"}
        alt="Pickyalo"
        width={mode === "full" ? 180 : 128}
        height={mode === "full" ? 62 : 128}
        priority={priority}
        className={joinClasses(
          mode === "full" ? "h-8 w-auto shrink-0" : "h-6 w-auto shrink-0",
          iconClassName,
        )}
      />

      {mode === "full" && textClassName ? (
        <span
          className={joinClasses(
            inter.className,
            "text-lg font-semibold tracking-[-0.02em] text-current",
            textClassName,
          )}
        >
          Pickyalo
        </span>
      ) : null}
    </span>
  );
}
