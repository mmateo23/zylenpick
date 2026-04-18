"use client";

import type { CSSProperties } from "react";

type BorderBeamProps = {
  className?: string;
  duration?: number;
  delay?: number;
  size?: number;
  borderWidth?: number;
  reverse?: boolean;
  initialOffset?: number;
};

export function BorderBeam({
  className = "",
  duration = 8,
  delay = 0,
  size = 240,
  borderWidth = 1.5,
  reverse = false,
  initialOffset = 0,
}: BorderBeamProps) {
  const wrapperStyle = {
    "--beam-duration": `${duration}s`,
    "--beam-delay": `${delay}s`,
    "--beam-direction": reverse ? "reverse" : "normal",
    "--beam-border-width": `${borderWidth}px`,
    "--beam-size": `${size}px`,
    transform: `rotate(${initialOffset}deg)`,
  } as CSSProperties;

  const maskStyle = {
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <div
        className="magic-border-beam absolute inset-[-120%] rounded-[inherit]"
        style={wrapperStyle}
      >
        <div
          className={`absolute inset-0 rounded-[inherit] bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,transparent_120deg,rgba(243,213,141,0.08)_150deg,rgba(243,213,141,0.95)_180deg,rgba(214,166,72,1)_210deg,rgba(243,213,141,0.28)_236deg,transparent_270deg,transparent_360deg)] p-[var(--beam-border-width)] ${className}`}
          style={maskStyle}
        />
      </div>
    </div>
  );
}
