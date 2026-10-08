"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./home-orbit.module.css";

gsap.registerPlugin(useGSAP);

const scenes = [
  { id: "commerce", label: "Comercios", eyebrow: "Hecho aquí. Elegido para ti.", title: "Con mucho", accent: "gusto local.", copy: "Sabores y pequeños comercios que merece la pena conocer.", action: "Explorar comercios", href: "/platos?modo=locales" },
  { id: "discover", label: "Descubre", eyebrow: "Cambia de camino. Mira de nuevo.", title: "Lo de siempre.", accent: "Como nunca.", copy: "Rincones, historias y lugares para mirar tu ciudad con otros ojos.", action: "Salir a descubrir", href: "/mapa?explora=1" },
  { id: "events", label: "Eventos", eyebrow: "Hay planes que se viven fuera.", title: "Hoy se sale", accent: "de lo de siempre.", copy: "Consulta la agenda local y encuentra tu próxima cita.", action: "Ver qué hay en la agenda", href: "/eventos" },
] as const;

type Props = {
  images: { commerce: string; discover: string; events: string };
  cityName: string;
  onNavigate: () => void;
  onSceneChange: (scene: "commerce" | "discover" | "events") => void;
};

/** A three-position wheel. The angle stays continuous across the last/first scene. */
export function HomeOrbit({ images, cityName, onNavigate, onSceneChange }: Props) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const orbit = useRef({ angle: 0 });
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const active = ((step % 3) + 3) % 3;
  const scene = scenes[active];

  useEffect(() => onSceneChange(scene.id), [scene.id, onSceneChange]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .35 });
    if (root.current) observer.observe(root.current);
    return () => { media.removeEventListener("change", update); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reduced || !visible) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setStep((value) => value + 1);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reduced, visible]);

  const renderOrbit = useRef<() => void>(() => {});
  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const resize = new ResizeObserver(() => renderOrbit.current());
    resize.observe(host);
    return () => resize.disconnect();
  }, []);

  useGSAP(() => {
    const host = stage.current;
    if (!host) return;
    const figures = Array.from(host.querySelectorAll<HTMLElement>("[data-orbit-figure]"));
    const render = () => {
      const { width, height } = host.getBoundingClientRect();
      figures.forEach((figure, index) => {
        const angle = (index * 120 + orbit.current.angle - 90) * Math.PI / 180;
        const prominence = (1 - Math.sin(angle)) / 2;
        gsap.set(figure, {
          x: width * (.5 + Math.cos(angle) * .43),
          y: height * (.87 + Math.sin(angle) * .39),
          xPercent: -50,
          yPercent: -50,
          rotation: Math.cos(angle) * 18,
          scale: .48 + prominence * .52,
          zIndex: Math.round(prominence * 10),
        });
      });
    };
    renderOrbit.current = render;
    render();
    gsap.to(orbit.current, { angle: -step * 120, duration: reduced ? 0 : 1.25, ease: "power3.inOut", overwrite: true, onUpdate: render });
    if (!reduced) gsap.fromTo("[data-orbit-copy]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .55, delay: .12, overwrite: true, clearProps: "transform,opacity" });
  }, { scope: root, dependencies: [step, reduced] });

  function move(direction: number) {
    setPaused(true);
    setStep((value) => value + direction);
  }

  return <section
    ref={root}
    className={styles.hero}
    data-scene={scene.id}
    aria-label={`Descubre lo local en ${cityName}`}
    aria-roledescription="carrusel"
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={(event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
      }
    }}
  >
    <div className={styles.heading} data-orbit-copy key={`heading-${active}`}>
      <p className={styles.eyebrow}>{scene.eyebrow}</p>
      <h1>{scene.title}<br /><em>{scene.accent}</em></h1>
      <p className={styles.description}>{scene.copy}</p>
    </div>

    <div ref={stage} className={styles.stage}
      onPointerDown={(event) => { swiped.current = false; pointer.current = { x: event.clientX, y: event.clientY }; }}
      onPointerCancel={() => { pointer.current = null; }}
      onPointerUp={(event) => {
        const start = pointer.current;
        pointer.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(event.clientY - start.y)) { swiped.current = true; move(dx < 0 ? 1 : -1); }
      }}
    >
      <span className={styles.orbitLine} aria-hidden="true" />
      {scenes.map((item, index) => <Link key={item.id} href={item.href} prefetch={false} className={styles.figure} data-orbit-figure data-position={index} data-active={active === index} tabIndex={active === index ? 0 : -1} aria-hidden={active !== index} aria-label={item.action} onClick={(event) => { if (swiped.current) event.preventDefault(); else onNavigate(); }}>
        <Image src={images[item.id]} alt="" fill sizes="(max-width: 599px) 120vw, (max-width: 999px) 85vw, 900px" priority={index === 0} draggable={false} />
      </Link>)}
      <span className={styles.cityStamp} aria-hidden="true">{cityName}<br /><span>Se vive aquí.</span></span>
    </div>

    <div className={styles.controls}>
      <div className={styles.actionRow}>
        <button type="button" className={styles.arrow} aria-label="Ambiente anterior" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <Link className={styles.action} href={scene.href} prefetch={false} onClick={onNavigate} data-orbit-copy>{scene.action}<ArrowRight size={18} aria-hidden="true" /></Link>
        <button type="button" className={styles.arrow} aria-label="Ambiente siguiente" onClick={() => move(1)}><ArrowRight size={20} /></button>
      </div>
      <nav className={styles.choices} aria-label="Descubrir Pickyalo">
        {scenes.map((item, index) => <Link key={item.id} href={item.href} prefetch={false} data-active={active === index} onClick={onNavigate}>
          {item.label}<ArrowRight size={14} aria-hidden="true" />
        </Link>)}
        {!reduced && <button type="button" className={styles.playback} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Activar giro automático" : "Pausar giro automático"}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>}
      </nav>
      <a className={styles.below} href="#home-local-content">Más de aquí <ArrowDown size={13} aria-hidden="true" /></a>
      <span className={styles.srOnly} aria-live={paused ? "polite" : "off"}>{scene.label}: {scene.copy}</span>
    </div>
  </section>;
}

