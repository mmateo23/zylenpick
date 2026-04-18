"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

type SmoothCursorProps = {
  rootSelector?: string;
};

export function SmoothCursor({
  rootSelector = "[data-demo-home-root]",
}: SmoothCursorProps) {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const scaleTarget = useMotionValue(1);
  const rotateTarget = useMotionValue(0);
  const opacityTarget = useMotionValue(0);

  const x = useSpring(pointerX, {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  });
  const y = useSpring(pointerY, {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  });
  const scale = useSpring(scaleTarget, {
    damping: 34,
    stiffness: 320,
    mass: 0.9,
  });
  const rotate = useSpring(rotateTarget, {
    damping: 34,
    stiffness: 260,
    mass: 0.8,
  });
  const opacity = useSpring(opacityTarget, {
    damping: 26,
    stiffness: 180,
    mass: 0.7,
  });

  const glowOpacity = useTransform(scale, [1, 1.24], [0.2, 0.36]);
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`;

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateEnabled = () => setEnabled(mediaQuery.matches);
    updateEnabled();

    mediaQuery.addEventListener("change", updateEnabled);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !enabled || typeof window === "undefined") {
      return;
    }

    const root =
      document.querySelector<HTMLElement>(rootSelector) ?? document.body;

    const handlePointerMove = (event: PointerEvent) => {
      const nextX = event.clientX;
      const nextY = event.clientY;
      const deltaX = nextX - lastPointRef.current.x;
      const deltaY = nextY - lastPointRef.current.y;

      pointerX.set(nextX);
      pointerY.set(nextY);
      rotateTarget.set(Math.atan2(deltaY, deltaX) * (180 / Math.PI));
      opacityTarget.set(1);

      lastPointRef.current = { x: nextX, y: nextY };
    };

    const handlePointerEnter = () => {
      opacityTarget.set(1);
    };

    const handlePointerLeave = () => {
      opacityTarget.set(0);
      scaleTarget.set(1);
    };

    const handlePointerDown = () => {
      scaleTarget.set(0.92);
    };

    const handlePointerUp = () => {
      scaleTarget.set(1);
    };

    const handleMouseOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest("a, button, [role='button']");
      scaleTarget.set(interactive ? 1.24 : 1);
    };

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerenter", handlePointerEnter);
    root.addEventListener("pointerleave", handlePointerLeave);
    root.addEventListener("pointerdown", handlePointerDown);
    root.addEventListener("pointerup", handlePointerUp);
    root.addEventListener("mouseover", handleMouseOver);

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerenter", handlePointerEnter);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("pointerdown", handlePointerDown);
      root.removeEventListener("pointerup", handlePointerUp);
      root.removeEventListener("mouseover", handleMouseOver);
    };
  }, [
    enabled,
    mounted,
    opacityTarget,
    pointerX,
    pointerY,
    rootSelector,
    rotateTarget,
    scaleTarget,
  ]);

  if (!mounted || !enabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
      style={{ transform, opacity }}
    >
      <motion.div
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/8 backdrop-blur-md"
        style={{ boxShadow: "0 0 40px rgba(16,185,129,0.2)" }}
      >
        <motion.div
          className="absolute inset-[-6px] rounded-full border border-emerald-300/25"
          style={{ opacity: glowOpacity }}
        />
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
      </motion.div>
    </motion.div>
  );
}
