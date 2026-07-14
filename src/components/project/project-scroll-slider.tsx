"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type ProjectSlide = {
  id: string;
  eyebrow: string;
  title: Array<{
    text: string;
    tone?: "accent" | "strike" | "muted";
  }>;
  description: string;
  imageUrl: string;
  actionLabel: string;
  actionHref: string;
};

const productAssets = [
  {
    src: "/home/project/project_post_pickyalo.png",
    alt: "",
    className: "project-food-asset project-food-asset-post",
  },
];

export function ProjectScrollSlider() {
  const sliderRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const isMobileRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  const slides: ProjectSlide[] = useMemo(
    () => [
      {
        id: "discover",
        eyebrow: "01 / descubre cerca",
        title: [
          { text: "Lo bueno de " },
          { text: "cerca", tone: "accent" },
          { text: " entra primero por los ojos." },
        ],
        description:
          "Pickyalo reune productos y platos destacados de locales cercanos en una galeria visual, real y facil de mirar.",
        imageUrl:
          "https://images.unsplash.com/photo-1682685795463-0674c065f315?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        actionLabel: "Explorar",
        actionHref: "/platos",
      },
      {
        id: "choose",
        eyebrow: "02 / decide rapido",
        title: [
          { text: "Menos " },
          { text: "ruido", tone: "strike" },
          { text: ". Mas " },
          { text: "esto si", tone: "accent" },
          { text: "." },
        ],
        description:
          "Sin cartas infinitas, fotos pobres ni vueltas de mas. Ves lo que merece la pena y eliges sin acabar en lo de siempre.",
        imageUrl:
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=3032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        actionLabel: "Elegir",
        actionHref: "/platos",
      },
      {
        id: "pickup",
        eyebrow: "03 / recoge en el local",
        title: [
          { text: "Lo pides claro. " },
          { text: "Lo recoges facil", tone: "accent" },
          { text: ". Y el barrio sigue vivo." },
        ],
        description:
          "El local prepara tu seleccion, tu pasas a recogerla y compras mejor sin perder tiempo ni alejarte de lo cercano.",
        imageUrl:
          "https://images.unsplash.com/photo-1531920382591-9179c11ab2d5?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        actionLabel: "Recoger",
        actionHref: "/zonas",
      },
    ],
    [],
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
            index === nextIndex ? "rgba(116,19,20,1)" : "rgba(116,19,20,0.44)";
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
    <div className="relative w-full rounded-[2rem] border-2 border-[#741314] bg-[linear-gradient(135deg,#FFF7E8,#FDE3AD)] text-[#24110E]">
      <section
        className="project-slider-intro"
        style={{
          position: "relative",
          minHeight: "92svh",
          display: "flex",
          alignItems: "flex-end",
          padding: "7rem 1rem 3.5rem",
          overflow: "hidden",
          borderTopLeftRadius: "2rem",
          borderTopRightRadius: "2rem",
          backgroundImage:
            "linear-gradient(rgba(255,247,232,0.20), rgba(255,247,232,0.20)), url('https://images.unsplash.com/photo-1742845834625-4c68792709f1?q=80&w=2188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
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
              <Link
                href="/platos"
                className="project-cta-button"
                style={primaryButtonStyle}
              >
                Explorar
              </Link>
              <Link
                href="/unete"
                className="project-cta-button"
                style={secondaryButtonStyle}
              >
                Locales
              </Link>
            </div>
            <div className="project-hero-action-zone">
              <div className="project-food-cloud" aria-hidden="true">
                {productAssets.map((asset) => (
                  <img
                    key={asset.src}
                    src={asset.src}
                    alt={asset.alt}
                    className={asset.className}
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="project-hero-ticket">
                <div>
                  <span>Selección viva</span>
                  <strong>Productos que se entienden antes de pedir.</strong>
                </div>
                <Link href="/platos">Escaparate</Link>
              </div>
              <div className="project-hero-actions-grid">
                <Link href="/platos" className="project-mini-action">
                  <span>01</span>
                  <strong>Explorar</strong>
                  <small>Productos destacados listos para decidir.</small>
                </Link>
                <Link href="/zonas" className="project-mini-action">
                  <span>02</span>
                  <strong>Cerca</strong>
                  <small>Locales y zonas donde recoger sin dar vueltas.</small>
                </Link>
              </div>
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
                key={slide.id}
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
                "rgba(255,247,232,0.20)",
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
                  key={slide.id}
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
                  <h2 style={slideTitleStyle}>
                    {slide.title.map((part, partIndex) => (
                      <span
                        key={`${slide.id}-${partIndex}`}
                        className={
                          part.tone ? `project-title-${part.tone}` : undefined
                        }
                      >
                        {part.text}
                      </span>
                    ))}
                  </h2>
                  <p className="project-slide-description" style={slideCopyStyle}>
                    {slide.description}
                  </p>
                  <Link
                    href={slide.actionHref}
                    className="project-slide-action"
                    style={slideActionStyle}
                  >
                    {slide.actionLabel}
                  </Link>
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
                        ? "rgba(116,19,20,1)"
                        : "rgba(116,19,20,0.44)",
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
          position: "relative",
          minHeight: "86svh",
          display: "flex",
          alignItems: "center",
          padding: "5rem 1rem",
          overflow: "hidden",
          borderBottomLeftRadius: "2rem",
          borderBottomRightRadius: "2rem",
          backgroundImage:
            "linear-gradient(rgba(255,247,232,0.20), rgba(255,247,232,0.20)), url('https://images.unsplash.com/photo-1696360089706-beac23813902?q=80&w=2210&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="project-outro-pizza-layer" aria-hidden="true">
          <img
            src="/home/assets/asset_pizza_transparent.png"
            alt=""
            loading="lazy"
            className="project-outro-pizza"
          />
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
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
            <p style={{ color: "#24110E", fontSize: "1.35rem", lineHeight: 1.45 }}>
              Queremos que un buen producto cercano sea facil de encontrar,
              facil de entender y facil de recoger.
            </p>
            <div className="project-closing-proof">
              <span>Productos activos</span>
              <span>Locales cercanos</span>
              <span>Recogida clara</span>
            </div>
            <div style={actionsStyle}>
              <Link
                href="/platos"
                className="project-cta-button"
                style={primaryButtonStyle}
              >
                Explorar
              </Link>
              <Link
                href="/zonas"
                className="project-cta-button"
                style={secondaryButtonStyle}
              >
                Zonas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const eyebrowStyle = {
  color: "#741314",
  fontSize: "0.78rem",
  fontWeight: 800,
  letterSpacing: "0.28em",
  textTransform: "uppercase" as const,
};

const heroTitleStyle = {
  marginTop: "1.25rem",
  maxWidth: "12ch",
  color: "#741314",
  fontSize: "clamp(4rem, 10vw, 7.8rem)",
  fontWeight: 800,
  lineHeight: 0.86,
  letterSpacing: "-0.07em",
};

const heroCopyStyle = {
  color: "rgba(36,17,14,0.74)",
  fontSize: "clamp(1.45rem, 2.3vw, 2rem)",
  fontWeight: 600,
  lineHeight: 1.12,
};

const slideTitleStyle = {
  marginTop: "1.25rem",
  maxWidth: "12ch",
  color: "#741314",
  fontSize: "clamp(3.4rem, 8.5vw, 6.5rem)",
  fontWeight: 800,
  lineHeight: 0.9,
  letterSpacing: "-0.065em",
};

const slideCopyStyle = {
  marginTop: "1.75rem",
  maxWidth: "42rem",
  color: "rgba(36,17,14,0.78)",
  fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
  fontWeight: 650,
  lineHeight: 1.62,
};

const slideActionStyle = {
  display: "inline-flex",
  justifyContent: "center",
  marginTop: "1.65rem",
  borderRadius: "999px",
  border: "1px solid #741314",
  background: "#741314",
  color: "#FDE3AD",
  padding: "0.86rem 1.35rem",
  fontSize: "0.92rem",
  fontWeight: 900,
  textDecoration: "none",
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
  background: "#741314",
  color: "#FDE3AD",
  padding: "0.9rem 1.35rem",
  fontSize: "0.92rem",
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  justifyContent: "center",
  borderRadius: "999px",
  border: "1px solid #741314",
  background: "rgba(255,247,232,0.76)",
  color: "#741314",
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
  background: "rgba(116,19,20,0.22)",
};

const progressBarStyle = {
  position: "absolute" as const,
  left: "50%",
  top: 0,
  width: 3,
  height: "100%",
  transform: "translateX(-50%) scaleY(0)",
  transformOrigin: "top",
  background: "#741314",
};

const closingCardStyle = {
  position: "relative" as const,
  overflow: "hidden",
  border: "1px solid rgba(116,19,20,0.32)",
  borderRadius: "2rem",
  background: "rgba(255,247,232,0.78)",
  padding: "2rem",
  boxShadow: "0 30px 90px rgba(116,19,20,0.12)",
  backdropFilter: "blur(14px)",
};
