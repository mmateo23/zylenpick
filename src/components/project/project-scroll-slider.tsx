"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

type ProjectScrollSliderProps = {
  siteMedia: SiteMediaAssetMap;
};

type ProjectSlide = {
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
};

export function ProjectScrollSlider({ siteMedia }: ProjectScrollSliderProps) {
  const sliderRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const isMobileRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  const slides: ProjectSlide[] = useMemo(
    () => [
      {
        eyebrow: "01 / cerca",
        title: "Descubrir algo bueno cerca no deberia ser complicado.",
        description:
          "Pickyalo convierte productos y platos destacados de locales cercanos en una seleccion visual, rapida y facil de recoger.",
        imageUrl: siteMedia.project_hero.imageUrl,
      },
      {
        eyebrow: "02 / problema",
        title: "Cuando todo parece igual, decidir se vuelve ruido.",
        description:
          "Menus largos, fotos pobres y demasiadas vueltas hacen que acabes eligiendo lo mismo de siempre.",
        imageUrl: siteMedia.project_problem.imageUrl,
      },
      {
        eyebrow: "03 / seleccion",
        title: "La decision entra primero por los ojos.",
        description:
          "Mostramos una seleccion clara de productos activos para que entiendas rapido que merece la pena recoger.",
        imageUrl: siteMedia.project_idea.imageUrl,
      },
      {
        eyebrow: "04 / mira",
        title: "Mira productos reales de locales reales.",
        description:
          "La experiencia empieza como una galeria editorial: visual, directa y pensada para decidir sin friccion.",
        imageUrl: siteMedia.project_step_discover.imageUrl,
      },
      {
        eyebrow: "05 / elige",
        title: "Elige rapido, sin perderte en una carta infinita.",
        description:
          "Pickyalo no intenta ensenarte todo. Te ayuda a encontrar algo bueno y accionable cerca de ti.",
        imageUrl: siteMedia.project_step_order.imageUrl,
      },
      {
        eyebrow: "06 / recoge",
        title: "Recoges en el local y ayudas al comercio cercano.",
        description:
          "El pedido queda claro, el local prepara tu seleccion y tu solo llegas, confirmas y recoges.",
        imageUrl: siteMedia.project_step_pickup.imageUrl,
      },
    ],
    [siteMedia],
  );

  useEffect(() => {
    const slider = sliderRef.current;
    const progressBar = progressRef.current;

    if (!slider || !progressBar) {
      return;
    }

    const update = () => {
      isMobileRef.current = window.innerWidth < 768;
      setIsMobile(isMobileRef.current);
      const top = slider.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, slider.offsetHeight - window.innerHeight);
      const raw = (window.scrollY - top) / distance;
      const progress = Math.min(1, Math.max(0, raw));
      const nextIndex = Math.min(
        slides.length - 1,
        Math.floor(progress * slides.length),
      );

      progressBar.style.transform = `translateX(-50%) scaleY(${progress})`;

      slider
        .querySelectorAll<HTMLElement>("[data-project-slide-image]")
        .forEach((image, index) => {
          image.style.opacity = index === nextIndex ? "1" : "0";
          image.style.transform = index === nextIndex ? "scale(1)" : "scale(1.09)";
          image.style.objectPosition = isMobileRef.current ? "center center" : "center";
        });

      slider
        .querySelectorAll<HTMLElement>("[data-project-slide-content]")
        .forEach((content, index) => {
          content.style.opacity = index === nextIndex ? "1" : "0";
          content.style.transform =
            index === nextIndex ? "translateY(0)" : "translateY(28px)";
          content.style.pointerEvents = index === nextIndex ? "auto" : "none";
        });

      slider
        .querySelectorAll<HTMLElement>("[data-project-slide-indicator]")
        .forEach((indicator, index) => {
          indicator.style.color =
            index === nextIndex ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.44)";
          const marker = indicator.querySelector<HTMLElement>("[data-project-marker]");
          if (marker) {
            marker.style.width = index === nextIndex ? "2rem" : "0.75rem";
          }
        });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [slides.length]);

  return (
    <div className="relative w-full rounded-[2rem] bg-[#10070d] text-white">
      <section
        className="project-slider-intro"
        style={{
          minHeight: "92svh",
          display: "flex",
          alignItems: "flex-end",
          padding: "7rem 1rem 3.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
            gap: "3rem",
            alignItems: "end",
            width: "100%",
          }}
        >
          <div>
            <p style={eyebrowStyle}>El proyecto</p>
            <h1 style={heroTitleStyle}>Menos vueltas. Mas producto local.</h1>
          </div>
          <div style={{ maxWidth: "42rem", paddingBottom: "0.5rem" }}>
            <p style={heroCopyStyle}>
              Pickyalo nace para que descubrir, elegir y recoger en locales
              cercanos se sienta tan claro como mirar un buen escaparate.
            </p>
            <div style={actionsStyle}>
              <Link href="/platos" style={primaryButtonStyle}>
                Explorar
              </Link>
              <Link href="/unete" style={secondaryButtonStyle}>
                Tengo un local
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={sliderRef}
        aria-label="Historia de Pickyalo"
        className="project-slider-scroll"
        style={{
          position: "relative",
          height: `${slides.length * 100 + 20}svh`,
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100svh",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            {slides.map((slide, index) => (
              <img
                key={slide.title}
                data-project-slide-image
                src={slide.imageUrl}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: index === 0 ? 1 : 0,
                  transform: index === 0 ? "scale(1)" : "scale(1.09)",
                  transition: "opacity 520ms ease, transform 1100ms ease",
                  willChange: "opacity, transform",
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(16,7,13,0.86), rgba(16,7,13,0.42) 52%, rgba(16,7,13,0.76))",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 26% 48%, rgba(194,97,87,0.24), transparent 38%), radial-gradient(circle at 82% 24%, rgba(254,212,125,0.14), transparent 30%)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 3,
              height: "100%",
              display: "flex",
              alignItems: "center",
              padding: "7rem 2rem 4rem",
            }}
            className="project-slider-stage-content"
          >
            <div style={{ position: "relative", width: "100%", maxWidth: "58rem" }}>
              {slides.map((slide, index) => (
                <div
                  key={slide.title}
                  data-project-slide-content
                  className="project-slider-copy-block"
                  style={{
                    position: index === 0 ? "relative" : "absolute",
                    inset: index === 0 ? undefined : 0,
                    maxWidth: "58rem",
                    opacity: index === 0 ? 1 : 0,
                    transform: index === 0 ? "translateY(0)" : "translateY(28px)",
                    transition: "opacity 420ms ease, transform 560ms ease",
                    pointerEvents: index === 0 ? "auto" : "none",
                  }}
                >
                  <p style={eyebrowStyle}>{slide.eyebrow}</p>
                  <h2 style={slideTitleStyle}>{slide.title}</h2>
                  <p style={slideCopyStyle}>{slide.description}</p>
                </div>
              ))}
            </div>

            <div
              className="project-slider-indicator"
              style={{ ...indicatorStyle, display: isMobile ? "none" : "grid" }}
            >
              {slides.map((_, indicatorIndex) => (
                <div
                  key={indicatorIndex}
                  data-project-slide-indicator
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    color:
                      indicatorIndex === 0
                        ? "rgba(255,255,255,1)"
                        : "rgba(255,255,255,0.44)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  <span
                    data-project-marker
                    style={{
                      width: indicatorIndex === 0 ? "2rem" : "0.75rem",
                      height: 1,
                      background: "currentColor",
                      transition: "width 220ms ease",
                    }}
                  />
                  {(indicatorIndex + 1).toString().padStart(2, "0")}
                </div>
              ))}
            </div>

            <div
              className="project-slider-progress-track"
              style={{ ...progressTrackStyle, display: isMobile ? "none" : "block" }}
            >
              <div ref={progressRef} style={progressBarStyle} />
            </div>
          </div>
        </div>
      </section>

      <section
        className="project-slider-outro"
        style={{
          minHeight: "86svh",
          display: "flex",
          alignItems: "center",
          padding: "5rem 1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(20rem, 0.85fr)",
            gap: "2rem",
            alignItems: "end",
            width: "100%",
          }}
        >
          <div>
            <p style={eyebrowStyle}>Siguiente paso</p>
            <h2 style={heroTitleStyle}>Un escaparate vivo para cada barrio.</h2>
          </div>
          <div style={closingCardStyle}>
            <p style={{ color: "#fff", fontSize: "1.35rem", lineHeight: 1.45 }}>
              Queremos que un buen producto cercano sea facil de encontrar,
              facil de entender y facil de recoger.
            </p>
            <div style={actionsStyle}>
              <Link href="/platos" style={primaryButtonStyle}>
                Explorar
              </Link>
              <Link href="/zonas" style={secondaryButtonStyle}>
                Ver zonas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const eyebrowStyle = {
  color: "#fed47d",
  fontSize: "0.78rem",
  fontWeight: 800,
  letterSpacing: "0.28em",
  textTransform: "uppercase" as const,
};

const heroTitleStyle = {
  marginTop: "1.25rem",
  maxWidth: "12ch",
  color: "#fff",
  fontSize: "clamp(4rem, 10vw, 7.8rem)",
  fontWeight: 800,
  lineHeight: 0.86,
  letterSpacing: "-0.07em",
};

const heroCopyStyle = {
  color: "rgba(255,255,255,0.82)",
  fontSize: "clamp(1.45rem, 2.3vw, 2rem)",
  fontWeight: 600,
  lineHeight: 1.12,
};

const slideTitleStyle = {
  marginTop: "1.25rem",
  maxWidth: "12ch",
  color: "#fff",
  fontSize: "clamp(3.4rem, 8.5vw, 6.5rem)",
  fontWeight: 800,
  lineHeight: 0.9,
  letterSpacing: "-0.065em",
};

const slideCopyStyle = {
  marginTop: "1.75rem",
  maxWidth: "42rem",
  color: "rgba(255,255,255,0.78)",
  fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
  lineHeight: 1.75,
};

const actionsStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "0.75rem",
  marginTop: "2rem",
};

const primaryButtonStyle = {
  display: "inline-flex",
  justifyContent: "center",
  borderRadius: "999px",
  background: "#fed47d",
  color: "#381932",
  padding: "0.9rem 1.35rem",
  fontSize: "0.92rem",
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  justifyContent: "center",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "0.9rem 1.35rem",
  fontSize: "0.92rem",
  fontWeight: 800,
  textDecoration: "none",
};

const indicatorStyle = {
  position: "absolute" as const,
  zIndex: 3,
  right: "2rem",
  top: "50%",
  transform: "translateY(-50%)",
  display: "grid",
  gap: "1rem",
};

const progressTrackStyle = {
  position: "absolute" as const,
  zIndex: 3,
  right: "1rem",
  top: "50%",
  width: 1,
  height: "22rem",
  transform: "translateY(-50%)",
  background: "rgba(255,255,255,0.22)",
};

const progressBarStyle = {
  position: "absolute" as const,
  left: "50%",
  top: 0,
  width: 3,
  height: "100%",
  transform: "translateX(-50%) scaleY(0)",
  transformOrigin: "top",
  background: "#fff",
};

const closingCardStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "2rem",
  background: "rgba(255,255,255,0.06)",
  padding: "2rem",
  boxShadow: "0 30px 90px rgba(0,0,0,0.28)",
  backdropFilter: "blur(14px)",
};
