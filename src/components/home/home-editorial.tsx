"use client";

import { useRef, useState, type ReactNode } from "react";
import styles from "./pickyalo-home.module.css";

type Edition = { id: string; label: string; title: string; description: string; content: ReactNode; selection: ReactNode };

// Only the page turn is client state. Content and selection stay server rendered.
export function HomeEditorial({ editions, header, children, footer }: { editions: Edition[]; header: ReactNode; children: ReactNode; footer: ReactNode }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  return (
    <div className={styles.page} data-environment={editions[active].id}>
      {header}
      <main className={styles.homeMain}
        onDragStart={(event) => {
          if (event.target instanceof Element && event.target.closest("[data-swipe-region]")) event.preventDefault();
        }}
        onPointerDown={(event) => {
          gesture.current = null;
          dragged.current = false;
          if (event.button !== 0 || !(event.target instanceof Element) || !event.target.closest("[data-swipe-region]")) return;
          gesture.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!gesture.current) return;
          const dx = event.clientX - gesture.current.x;
          const dy = event.clientY - gesture.current.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) dragged.current = true;
        }}
        onPointerCancel={() => { gesture.current = null; dragged.current = false; }}
        onPointerUp={(event) => {
          if (!gesture.current) return;
          const dx = event.clientX - gesture.current.x;
          const dy = event.clientY - gesture.current.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            dragged.current = true;
            setActive((current) => (current + (dx < 0 ? 1 : -1) + editions.length) % editions.length);
          }
          gesture.current = null;
        }}
        onClickCapture={(event) => {
          if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; }
        }}>
      <section className={styles.hero} aria-labelledby="home-title" data-swipe-region>
      <div className={styles.heroHeading}>
        <p>Pickyalo · El escaparate de Talavera</p>
        <h1 id="home-title">Tu ciudad.<span>A primera vista.</span></h1>
        <p className={styles.heroDescription}>Descubre <strong>lo que se hace aquí</strong>, rincones que merecen una visita y planes para vivir <em>Talavera de cerca.</em></p>
      </div>
      <div className={styles.editionTabs} role="tablist" aria-label="Qué te apetece hoy">
        {editions.map((edition, index) => (
          <button key={edition.id} ref={(node) => { tabs.current[index] = node; }} type="button"
            role="tab" id={`edition-tab-${edition.id}`} aria-controls={`edition-${edition.id}`}
            aria-selected={active === index} tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % editions.length;
              else if (event.key === "ArrowLeft") next = (index - 1 + editions.length) % editions.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = editions.length - 1;
              else return;
              event.preventDefault();
              setActive(next);
              tabs.current[next]?.focus();
            }}>
            {edition.label}
          </button>
        ))}
      </div>
      <p className={styles.editionFootnote}><span>Desliza y descubre {editions.length === 3 ? "lo local, la ciudad y su agenda" : "lo local y la ciudad"}.</span></p>
      </section>
      {editions.map((edition, index) => (
        <div key={edition.id} id={`edition-${edition.id}`} role="tabpanel"
          aria-labelledby={`edition-tab-${edition.id}`} hidden={active !== index}
          className={styles.editionPage} tabIndex={0}>
          <div className={styles.sceneStage} data-swipe-region>
            <div className={styles.editionIntro}><h2>{edition.title}</h2><p className="sr-only">{edition.description}</p></div>
            {edition.content}
          </div>
          {edition.selection}
        </div>
      ))}
      {children}
      </main>
      {footer}
    </div>
  );
}
