"use client";

import {
  BookOpen,
  Check,
  Headphones,
  LoaderCircle,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PublicExploreExperience } from "@/features/explore/types";
import { captureExploreEvent } from "@/lib/analytics/posthog-events";
import styles from "./explore-point-experience.module.css";

type Props = { experience: PublicExploreExperience; preview?: boolean };

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function distanceBetween(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) {
  const radius = 6371000;
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatDistance(distance: number) {
  return distance < 1000
    ? `${Math.max(10, Math.round(distance / 10) * 10)} m`
    : `${(distance / 1000).toFixed(1).replace(".", ",")} km`;
}

export function ExplorePointExperience({ experience, preview = false }: Props) {
  const { route, point, nextPoint, sponsor, totalPoints } = experience;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(point.audioDurationSeconds ?? 0);
  const [storyOpen, setStoryOpen] = useState(false);
  const storyRef = useRef<HTMLElement | null>(null);
  const source: "preview" | "qr" = preview ? "preview" : "qr";
  const progressKey = `pickyalo.explora.${route.id}.visited`;
  const eventProperties = {
    route_id: route.id,
    route_slug: route.slug,
    point_id: point.id,
    point_slug: point.slug,
    point_position: point.position,
    total_points: totalPoints,
    source,
  };

  const nextDistance = useMemo(
    () => (nextPoint ? distanceBetween(point, nextPoint) : null),
    [nextPoint, point],
  );
  const audioProgress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  useEffect(() => {
    if (!storyOpen || !storyRef.current) return;
    const dialog = storyRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const siblings = Array.from(dialog.parentElement?.children ?? []).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element !== dialog,
    );
    const previousInert = siblings.map((element) => element.inert);
    siblings.forEach((element) => { element.inert = true; });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setStoryOpen(false);
      if (event.key !== "Tab") return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], summary, [tabindex="0"]',
      )).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      siblings.forEach((element, index) => { element.inert = previousInert[index]; });
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [storyOpen]);

  useEffect(() => {
    if (preview) return;
    let visited: string[] = [];
    try {
      visited = JSON.parse(window.localStorage.getItem(progressKey) ?? "[]");
    } catch {
      visited = [];
    }
    const nextVisited = Array.from(new Set([...visited, point.id]));
    window.localStorage.setItem(progressKey, JSON.stringify(nextVisited));
    captureExploreEvent(
      "explore_point_opened",
      eventProperties,
      `${route.id}:${point.id}`,
    );
    if (!nextPoint && nextVisited.length >= totalPoints) {
      captureExploreEvent(
        "explore_route_completed",
        eventProperties,
        route.id,
      );
    }
    // These identifiers only change when navigating to another route stop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point.id, progressKey, preview, route.id]);

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError(false);
    if (audio.paused) {
      setIsLoading(true);
      try {
        await audio.play();
        if (!preview) {
          captureExploreEvent(
            "explore_audio_started",
            eventProperties,
            `${route.id}:${point.id}`,
          );
        }
      } catch {
        setAudioError(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      audio.pause();
    }
  }

  function openStory() {
    setStoryOpen(true);
    if (!preview) {
      captureExploreEvent(
        "explore_transcript_opened",
        eventProperties,
        `${route.id}:${point.id}`,
      );
    }
  }

  function rewindAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
    setCurrentTime(audio.currentTime);
  }

  return (
    <main className={`public-light-theme ${styles.page}`}>
      <section className={styles.experience}>
        <figure className={styles.cover}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={point.imageUrl}
            alt={point.imageAlt}
            className="h-full w-full object-cover object-center saturate-[0.98] contrast-[1.02]"
            fetchPriority="high"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[#5F0F10]"
            style={{ opacity: point.imageOverlayOpacity / 100 }}
          />
          <figcaption className="sr-only">
            {point.place.name}, {route.cityName}
          </figcaption>

          <Link
            href="/"
            aria-label="Ir al inicio de Pickyalo"
            className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[#FFF7E8] px-3 py-2 text-[#741314] shadow-[0_4px_18px_rgba(36,17,14,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF7E8] sm:left-8 sm:top-8"
          >
            <Image
              src="/icons/pickyalo-app.svg"
              alt=""
              width={30}
              height={30}
              className="h-7 w-7"
              priority
            />
            <span className="text-[9px] font-bold uppercase leading-[1.35] tracking-[0.2em]">
              Pickyalo
              <br />
              Explora
            </span>
          </Link>

          <div className={styles.photoCaption}>
            <p className="truncate text-xs font-semibold">
              {point.place.name} · {route.cityName}
            </p>
            <p className="shrink-0 font-mono text-xs font-bold">
              {String(point.position).padStart(2, "0")}/
              {String(totalPoints).padStart(2, "0")}
            </p>
          </div>
        </figure>

        <article className={styles.content}>
          <div className="min-h-0">
            <p className={styles.eyebrow}>
              {route.name} · Parada {String(point.position).padStart(2, "0")}
            </p>
            <h1 className={styles.title}>
              {point.title}
            </h1>
            <p className={styles.introduction}>
              {point.introduction}
            </p>
          </div>

          <dl className={styles.facts} aria-label="De un vistazo">
            <div><dt>Dónde</dt><dd>{route.cityName}</dd></div>
            <div><dt>En esta ruta</dt><dd>Parada {point.position} de {totalPoints}</dd></div>
            {point.audioDurationSeconds ? (
              <div><dt>Escucha</dt><dd>{formatTime(point.audioDurationSeconds)} min</dd></div>
            ) : null}
          </dl>

          {point.audioUrl ? (
            <audio
              ref={audioRef}
              src={point.audioUrl}
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onTimeUpdate={(event) =>
                setCurrentTime(event.currentTarget.currentTime)
              }
              onLoadedMetadata={(event) =>
                setDuration(
                  event.currentTarget.duration ||
                    point.audioDurationSeconds ||
                    0,
                )
              }
              onError={() => {
                setAudioError(true);
                setIsLoading(false);
              }}
              onEnded={() => {
                setIsPlaying(false);
                if (!preview) {
                  captureExploreEvent(
                    "explore_audio_completed",
                    eventProperties,
                    `${route.id}:${point.id}`,
                  );
                }
              }}
            />
          ) : null}

          <div className="mt-5">
            {point.audioUrl ? (
              <section
                aria-label="Reproductor de la historia narrada"
                className={styles.player}
                data-playing={isPlaying && !isLoading && !audioError}
              >
                <div className={styles.playerHeader}>
                  <div className={styles.playerIdentity}>
                    <Headphones aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <p className={styles.playerEyebrow}>
                      Historia narrada
                    </p>
                  </div>
                  <div className={styles.playerState}>
                    <span className={styles.playerSignal} aria-hidden="true">
                      <i /><i /><i /><i /><i />
                    </span>
                    <span className={styles.playerStatus} aria-live="polite">
                    {audioError ? "No disponible" : isLoading
                      ? "Cargando"
                      : isPlaying
                        ? "Escuchando"
                        : currentTime > 0
                          ? "En pausa"
                          : duration > 0
                            ? `${Math.max(1, Math.ceil(duration / 60))} min`
                            : "A tu ritmo"}
                    </span>
                  </div>
                </div>

                <div className={styles.playerControls}>
                  <button
                    type="button"
                    onClick={() => void toggleAudio()}
                    disabled={audioError || isLoading}
                    aria-label={isPlaying ? "Pausar narración" : "Reproducir narración"}
                    className={styles.playerPlay}
                  >
                    {isLoading ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="h-5 w-5 animate-spin motion-reduce:animate-none"
                      />
                    ) : isPlaying ? (
                      <Pause aria-hidden="true" className="h-5 w-5 fill-current" />
                    ) : (
                      <Play aria-hidden="true" className="ml-0.5 h-5 w-5 fill-current" />
                    )}
                  </button>

                  <p className={styles.playerLabel}>
                    <span>{audioError ? "Puedes leer la historia" : isLoading ? "Preparando el audio" : isPlaying ? "Ahora suena" : currentTime > 0 ? "Continúa escuchando" : "Escucha su historia"}</span>
                    <strong>{point.title}</strong>
                  </p>

                  <div className={styles.playerTimeline}>
                    <label className="sr-only" htmlFor="explore-audio-progress">
                      Progreso del audio
                    </label>
                    <input
                      id="explore-audio-progress"
                      type="range"
                      min="0"
                      max={Math.max(duration, 1)}
                      step="0.1"
                      value={Math.min(currentTime, duration || 0)}
                      aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
                      disabled={audioError || duration <= 0}
                      onChange={(event) => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = Number(event.target.value);
                          setCurrentTime(audioRef.current.currentTime);
                        }
                      }}
                      className={styles.playerRange}
                      style={{
                        backgroundImage: `linear-gradient(90deg, #FDE3AD ${audioProgress}%, rgba(253,227,173,.3) ${audioProgress}%)`,
                      }}
                    />
                    <div className={styles.playerTimes}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{duration > 0 ? formatTime(duration) : "—:—"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={rewindAudio}
                    disabled={audioError || currentTime <= 0}
                    aria-label="Retroceder 10 segundos"
                    className={styles.playerRewind}
                    title="Retroceder 10 segundos"
                  >
                    <span className="relative">
                      <RotateCcw aria-hidden="true" className="h-7 w-7" />
                      <span aria-hidden="true" className="absolute inset-0 grid place-items-center pt-px text-[10px] font-bold">10</span>
                    </span>
                  </button>
                </div>
              </section>
            ) : null}

            <button
              type="button"
              onClick={openStory}
              className="mt-2.5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#741314]/35 bg-transparent px-4 text-sm font-bold text-[#741314] transition-colors hover:bg-[#FDE3AD]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] motion-reduce:transition-none"
            >
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              Leer historia
            </button>

            {audioError ? (
              <p role="alert" className="mt-2 text-xs font-semibold text-rose-800">
                El audio no está disponible. Puedes leer la historia.
              </p>
            ) : null}

            <div className="mt-3 border-t border-[#741314]/20 pt-2.5">
              {nextPoint ? (
                <Link
                  href={`/explora/${route.slug}/${nextPoint.slug}?unlock=${nextPoint.publicToken}`}
                  onClick={() => {
                    if (!preview) {
                      captureExploreEvent(
                        "explore_next_point_clicked",
                        eventProperties,
                      );
                    }
                  }}
                  className="group flex min-h-11 items-center justify-between gap-4 text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
                >
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#741314]/62">
                      Siguiente
                      {nextDistance !== null
                        ? ` · ${formatDistance(nextDistance)}`
                        : ""}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">
                      {nextPoint.title}
                    </span>
                  </span>
                  <Navigation
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 fill-current transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
              ) : (
                <div className="flex min-h-11 items-center gap-3 text-[#741314]">
                  <Check aria-hidden="true" className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    {totalPoints === 1 ? "Punto visitado" : "Ruta completada"}
                  </span>
                </div>
              )}
            </div>

            {sponsor ? (
              <p className="mt-2 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[#741314]/52">
                Con el apoyo de {sponsor.name}
              </p>
            ) : null}
          </div>
        </article>

        {storyOpen ? (
          <section
            ref={storyRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-story-title"
            className={styles.storyDialog}
          >
            <header className="flex shrink-0 items-center justify-between border-b border-[#741314]/18 px-5 py-4 sm:px-9 lg:px-12">
              <div className="flex min-w-0 items-center gap-3 text-[#741314]">
                <BookOpen aria-hidden="true" className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em]">
                    {route.name} · {String(point.position).padStart(2, "0")}
                  </p>
                  <h2
                    id="explore-story-title"
                    className="mt-0.5 truncate font-serif text-xl text-[#5F0F10]"
                  >
                    {point.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStoryOpen(false)}
                aria-label="Cerrar historia"
                className="ml-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#741314]/28 text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </header>

            <div className={styles.storyScroll} tabIndex={0} aria-label="Contenido de la historia">
              <article className={styles.storyBody}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={point.imageUrl} alt={point.imageAlt} className={styles.storyImage} />
                <p className={styles.eyebrow}>La historia del lugar</p>
                <p className={styles.storyLead}>{point.introduction}</p>
                <div className={styles.storyText}>
                  {point.story}
                </div>
                {point.audioUrl ? (
                  <details className={styles.transcript}>
                    <summary>
                      Transcripción del audio
                    </summary>
                    <div className="mt-4 whitespace-pre-line text-base leading-8 text-[#24110E]/80">
                      {point.transcript}
                    </div>
                  </details>
                ) : null}
                {point.credits ? (
                  <p className="mt-8 border-t border-[#741314]/18 pt-4 text-xs leading-5 text-[#741314]/62">
                    {point.credits}
                  </p>
                ) : null}
              </article>
            </div>
          </section>
        ) : null}
      </section>

    </main>
  );
}
