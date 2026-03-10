"use client";

import { useEffect, useState } from "react";

type StoryStep = {
  title: string;
  description: string;
  imageUrl: string;
};

type StoryCardSwapProps = {
  steps: StoryStep[];
};

function joinClasses(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export function StoryCardSwap({ steps }: StoryCardSwapProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (isReducedMotion || steps.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % steps.length);
    }, 4600);

    return () => {
      window.clearInterval(interval);
    };
  }, [isReducedMotion, steps.length]);

  const orderedSteps = steps.map((_, index) => {
    const relativeIndex = (index - activeIndex + steps.length) % steps.length;

    return {
      step: steps[index],
      originalIndex: index,
      relativeIndex,
    };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={joinClasses(
                "w-full rounded-[1.6rem] border px-5 py-5 text-left transition duration-300",
                isActive
                  ? "border-[color:var(--brand)]/40 bg-[rgba(31,138,112,0.12)] shadow-[var(--card-shadow)]"
                  : "border-white/10 bg-[rgba(255,255,255,0.02)] text-white/72",
              )}
            >
              <p
                className={joinClasses(
                  "text-xs uppercase tracking-[0.24em]",
                  isActive ? "text-[color:var(--brand)]" : "text-white/42",
                )}
              >
                0{index + 1}
              </p>
              <p className="mt-3 text-xl font-semibold text-white">{step.title}</p>
              <p className="mt-2 max-w-[28ch] text-sm leading-6 text-white/70">
                {step.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="relative mx-auto h-[26rem] w-full max-w-[32rem] sm:h-[30rem]">
        {orderedSteps.map(({ step, originalIndex, relativeIndex }) => {
          const isActive = relativeIndex === 0;
          const translateY = relativeIndex === 0 ? 0 : relativeIndex === 1 ? 22 : 42;
          const scale = relativeIndex === 0 ? 1 : relativeIndex === 1 ? 0.95 : 0.9;
          const opacity = relativeIndex === 0 ? 1 : relativeIndex === 1 ? 0.74 : 0.52;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => setActiveIndex(originalIndex)}
              className="absolute inset-0 overflow-hidden rounded-[2.1rem] border border-white/10 text-left shadow-[var(--shadow)] transition duration-500"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity,
                zIndex: steps.length - relativeIndex,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(6, 9, 8, 0.08), rgba(6, 9, 8, 0.72)), url('${step.imageUrl}')`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,7,0.14),rgba(5,8,7,0.82))]" />
              <div className="relative flex h-full flex-col justify-end px-6 pb-7 pt-16">
                <p className="text-xs uppercase tracking-[0.26em] text-white/54">
                  Paso 0{originalIndex + 1}
                </p>
                <h3 className="mt-3 max-w-[10ch] text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[22ch] text-sm leading-7 text-white/74 sm:text-base">
                  {step.description}
                </p>
                {isActive ? (
                  <p className="mt-5 text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
                    ZylenPick
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
