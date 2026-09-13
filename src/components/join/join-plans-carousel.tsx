"use client";

import { Children, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import styles from "./join-support-funnel.module.css";

const labels = ["Free", "Suave", "Picante", "Fuego"];

export function JoinPlansCarousel({ children }: { children: ReactNode }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const metrics = useRef({ linked: false, top: 88, travel: 0, maxX: 0 });

  const goTo = useCallback((index: number, smooth = true) => {
    const area = areaRef.current;
    const track = trackRef.current;
    if (!area || !track) return;
    const behavior = smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant";
    const ratio = index / (labels.length - 1);
    const current = metrics.current;
    if (current.linked) {
      window.scrollTo({ top: window.scrollY + area.getBoundingClientRect().top - current.top + ratio * current.travel, behavior });
    } else {
      track.scrollTo({ left: ratio * (track.scrollWidth - track.clientWidth), behavior });
    }
  }, []);

  useEffect(() => {
    const area = areaRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!area || !viewport || !track) return;
    const mobile = window.matchMedia("(max-width: 760px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let touching = false;
    let touchOrigin: { x: number; y: number } | null = null;
    let lastProgrammaticX = -1;

    const update = () => {
      frame = 0;
      const current = metrics.current;
      if (!current.linked || touching) return;
      const progress = Math.min(1, Math.max(0, (current.top - area.getBoundingClientRect().top) / current.travel));
      lastProgrammaticX = progress * current.maxX;
      track.scrollLeft = lastProgrammaticX;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      const top = 88;
      const maxX = Math.max(0, track.scrollWidth - track.clientWidth);
      // Short screens and reduced motion keep a native swipe carousel, with no pinned content.
      const linked = mobile.matches && !reduced.matches && viewport.offsetHeight + top + 20 <= window.innerHeight && maxX > 0;
      const travel = Math.max(maxX, window.innerHeight * 1.2);
      metrics.current = { linked, top, travel, maxX };
      area.dataset.linked = String(linked);
      area.style.height = linked ? `${viewport.offsetHeight + travel}px` : "auto";
      if (!mobile.matches) { track.scrollLeft = 0; setActive(0); }
      schedule();
    };
    const onTrackScroll = () => {
      const maxX = track.scrollWidth - track.clientWidth;
      if (maxX > 0) setActive(Math.round((track.scrollLeft / maxX) * (labels.length - 1)));
      const current = metrics.current;
      if (!current.linked || touching || Math.abs(track.scrollLeft - lastProgrammaticX) < 2) return;
      // Keep the vertical position in sync after native swipe or keyboard scrolling.
      window.scrollTo({ top: window.scrollY + area.getBoundingClientRect().top - current.top + (track.scrollLeft / current.maxX) * current.travel, behavior: "instant" });
    };
    const onTouchStart = (event: TouchEvent) => {
      touching = false;
      touchOrigin = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!touchOrigin) return;
      const dx = Math.abs(event.touches[0].clientX - touchOrigin.x);
      const dy = Math.abs(event.touches[0].clientY - touchOrigin.y);
      touching = dx > 8 && dx > dy;
    };
    const onTouchEnd = () => {
      touching = false;
      touchOrigin = null;
      const current = metrics.current;
      if (current.linked && Math.abs(track.scrollLeft - lastProgrammaticX) > 2) onTrackScroll();
      else schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    track.addEventListener("scroll", onTrackScroll, { passive: true });
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("touchcancel", onTouchEnd, { passive: true });
    mobile.addEventListener("change", measure);
    reduced.addEventListener("change", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      track.removeEventListener("scroll", onTrackScroll);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("touchcancel", onTouchEnd);
      mobile.removeEventListener("change", measure);
      reduced.removeEventListener("change", measure);
    };
  }, []);

  return (
    <div ref={areaRef} className={styles.plansArea}>
      <div ref={viewportRef} className={styles.plansViewport}>
        <div className={styles.carouselControls} role="group" aria-label="Elegir plan">
          <button type="button" onClick={() => goTo(Math.max(0, active - 1))} disabled={active === 0} aria-label="Plan anterior"><ArrowLeft size={18} aria-hidden="true" /></button>
          <div className={styles.carouselSteps}>
            {labels.map((label, index) => <button type="button" key={label} onClick={() => goTo(index)} aria-label={`Ver plan ${label}`} aria-pressed={index === active}><span /></button>)}
          </div>
          <span className={styles.carouselCount} aria-live="polite">{active + 1} / 4</span>
          <button type="button" onClick={() => goTo(Math.min(3, active + 1))} disabled={active === 3} aria-label="Plan siguiente"><ArrowRight size={18} aria-hidden="true" /></button>
        </div>
        <div ref={trackRef} className={styles.planGrid}>
          {Children.map(children, (child, index) => <div className={styles.planSlide} onFocusCapture={() => { if (window.matchMedia("(max-width: 760px)").matches && index !== active) goTo(index, false); }}>{child}</div>)}
        </div>
      </div>
    </div>
  );
}
