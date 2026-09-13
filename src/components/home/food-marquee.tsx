"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";

import styles from "./food-marquee.module.css";

export function FoodMarquee({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [columnCount, setColumnCount] = useState(3);
  const root = useRef<HTMLDivElement>(null);
  const columns = Array.from({ length: columnCount }, (_, column) =>
    items.filter((_, index) => index % columnCount === column),
  );

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 699px)");
    const updateColumns = () => setColumnCount(mobile.matches ? 2 : 3);
    updateColumns();
    mobile.addEventListener("change", updateColumns);
    return () => mobile.removeEventListener("change", updateColumns);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={styles.root} data-paused={paused} data-visible={visible}>
      <div className={styles.controls}>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
          title={paused ? "Animar los platos" : "Detener y ver todos los platos"}
        >
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          {paused ? "Animar" : "Ver sin movimiento"}
        </button>
      </div>
      <div className={styles.frame}>
        <div className={styles.stage}>
          {columns.filter((column) => column.length).map((column, index) => (
            <div className={styles.column} key={index}>
              <div className={styles.track}>
                <div className={styles.group}>{column}</div>
                {[1, 2, 3].map((copy) => (
                  <div
                    key={copy}
                    className={styles.copy}
                    aria-hidden="true"
                    ref={(element) => element?.querySelectorAll("a").forEach((link) => { link.tabIndex = -1; })}
                  >
                    {column}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
