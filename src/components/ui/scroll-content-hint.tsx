"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ScrollContentHintProps = {
  visible: boolean;
  onActivate: () => void;
  label?: string;
  positionClassName?: string;
};

export function ScrollContentHint({
  visible,
  onActivate,
  label = "Desliza para ver todo",
  positionClassName = "inset-x-0 bottom-0",
}: ScrollContentHintProps) {
  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none absolute z-30 flex justify-center bg-gradient-to-t from-[#FFF9F1] via-[#FFF9F1]/95 to-transparent pb-2 pt-8 sm:hidden ${positionClassName}`}
    >
      <button
        type="button"
        onClick={onActivate}
        className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#FED47D] bg-[#741314] px-4 py-2.5 text-xs font-extrabold text-[#FFF7E8] shadow-[0_10px_28px_rgba(56,25,50,0.3)] outline-none transition hover:bg-[#5F0F10] focus-visible:ring-4 focus-visible:ring-[#FED47D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF9F1]"
        aria-label={label}
      >
        {label}
        <ChevronDown className="h-4 w-4 text-[#FED47D] motion-safe:animate-[bounce_1.8s_ease-in-out_infinite]" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useScrollContentHint<T extends HTMLElement>(refreshKey?: string | number | boolean | null) {
  const scrollRef = useRef<T | null>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  const updateScrollHint = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setCanScrollMore(false);
      return;
    }

    const remainingScroll = element.scrollHeight - element.scrollTop - element.clientHeight;
    setCanScrollMore(remainingScroll > 16);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const frame = window.requestAnimationFrame(updateScrollHint);
    const resizeObserver = new ResizeObserver(updateScrollHint);
    const mutationObserver = new MutationObserver(updateScrollHint);
    resizeObserver.observe(element);
    mutationObserver.observe(element, { childList: true, subtree: true, characterData: true });
    element.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      element.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, [refreshKey, updateScrollHint]);

  const scrollForward = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({
      top: Math.min(element.clientHeight * 0.56, 300),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  return { scrollRef, canScrollMore, updateScrollHint, scrollForward };
}
