"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ScrollVelocityContainerProps = ComponentPropsWithoutRef<"div">;

type ScrollVelocityRowProps = {
  baseVelocity?: number;
  children: ReactNode;
  className?: string;
  direction?: 1 | -1;
};

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export function ScrollVelocityContainer({
  className,
  ...props
}: ScrollVelocityContainerProps) {
  return (
    <div
      className={cn("w-full overflow-hidden", className)}
      {...props}
    />
  );
}

export function ScrollVelocityRow({
  baseVelocity = 18,
  children,
  className,
  direction = 1,
}: ScrollVelocityRowProps) {
  const reducedMotion = useReducedMotion();
  const baseX = useMotionValue(direction === 1 ? -12.5 : -6.25);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 48,
    stiffness: 320,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    [-1200, 0, 1200],
    [0.6, 0, 0.6],
    { clamp: true },
  );
  const x = useTransform(baseX, (value) => `${wrap(-25, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;

    const seconds = Math.min(delta, 40) / 1000;
    const speed = baseVelocity * (1 + velocityFactor.get());
    baseX.set(baseX.get() + direction * speed * seconds);
  });

  return (
    <div className="flex overflow-hidden" aria-hidden="true">
      <motion.div
        className={cn("flex w-max min-w-max will-change-transform", className)}
        style={{ x: reducedMotion ? "-12.5%" : x }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="shrink-0 whitespace-nowrap pr-[0.45em]">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
