"use client";

import {
  AudioLines,
  BookOpen,
  Check,
  Headphones,
  LoaderCircle,
  Navigation,
  Pause,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PublicExploreExperience } from "@/features/explore/types";
import { captureExploreEvent } from "@/lib/analytics/posthog-events";

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
  const [duration, setDuration] = useState(point.audioDurationSeconds);
  const [storyOpen, setStoryOpen] = useState(false);
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

  return (
    <main className="public-light-theme fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#FDE3AD] p-2 text-[#24110E] sm:p-3">
      <section className="relative mx-auto grid h-full w-full max-w-[90rem] grid-rows-[38%_62%] overflow-hidden rounded-[1.75rem] bg-[#FFF7E8] sm:rounded-[2rem] lg:grid-cols-[55%_45%] lg:grid-rows-1">
        <figure className="relative min-h-0 overflow-hidden bg-[#741314]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={point.imageUrl}
            alt={point.imageAlt}
            className="h-full w-full object-cover object-center sepia-[0.42] saturate-[0.72] contrast-[1.03]"
            fetchPriority="high"
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

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4 text-[#FFF7E8] drop-shadow-[0_2px_6px_rgba(36,17,14,0.72)] sm:bottom-6 sm:left-8 sm:right-8">
            <p className="truncate text-xs font-semibold">
              {point.place.name} · {route.cityName}
            </p>
            <p className="shrink-0 font-mono text-xs font-bold">
              {String(point.position).padStart(2, "0")}/
              {String(totalPoints).padStart(2, "0")}
            </p>
          </div>
        </figure>

        <article className="flex min-h-0 flex-col px-5 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-4 sm:px-9 sm:pb-7 sm:pt-6 lg:px-12 lg:py-10 xl:px-14 xl:py-12">
          <div className="min-h-0">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.17em] text-[#741314]/72 sm:text-[10px]">
              {route.name} · Parada {String(point.position).padStart(2, "0")}
            </p>
            <h1 className="mt-2 line-clamp-3 max-w-[10ch] font-serif text-[clamp(2.55rem,11.5vw,4rem)] font-medium leading-[0.86] tracking-[-0.05em] text-[#5F0F10] sm:mt-3 lg:text-[clamp(4rem,5.4vw,6.5rem)]">
              {point.title}
            </h1>
            <p className="mt-2 line-clamp-2 max-w-[31rem] text-sm leading-5 text-[#24110E]/76 sm:mt-3 sm:text-base sm:leading-6 lg:mt-5 lg:text-lg lg:leading-7">
              {point.introduction}
            </p>
          </div>

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
                event.currentTarget.duration || point.audioDurationSeconds,
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

          <div className="mt-auto pt-3 lg:pt-8">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => void toggleAudio()}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8] transition-colors hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-3 motion-reduce:transition-none sm:text-base"
              >
                {isLoading ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin motion-reduce:animate-none"
                  />
                ) : isPlaying ? (
                  <Pause aria-hidden="true" className="h-5 w-5 fill-current" />
                ) : (
                  <AudioLines aria-hidden="true" className="h-5 w-5" />
                )}
                {isPlaying ? "Pausar" : "Escuchar"}
              </button>
              <button
                type="button"
                onClick={openStory}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#741314]/45 bg-transparent px-4 text-sm font-bold text-[#741314] transition-colors hover:bg-[#FDE3AD]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] motion-reduce:transition-none sm:text-base"
              >
                <BookOpen aria-hidden="true" className="h-5 w-5" />
                Leer
              </button>
            </div>

            {(isPlaying || currentTime > 0) && !audioError ? (
              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
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
                  onChange={(event) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Number(event.target.value);
                    }
                  }}
                  className="h-1 w-full cursor-pointer accent-[#741314]"
                />
                <span className="font-mono text-[10px] text-[#741314]/65">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            ) : null}

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
                  <span className="text-sm font-semibold">Ruta completada</span>
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-story-title"
            className="absolute inset-0 z-50 flex flex-col overflow-hidden rounded-[1.75rem] bg-[#FFF7E8] sm:rounded-[2rem]"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-[#741314]/18 px-5 py-4 sm:px-9 lg:px-12">
              <div className="flex min-w-0 items-center gap-3 text-[#741314]">
                <Headphones aria-hidden="true" className="h-5 w-5 shrink-0" />
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

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-9 lg:px-12">
              <article className="mx-auto max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#741314]/62">
                  Historia
                </p>
                <div className="mt-4 whitespace-pre-line font-serif text-[1.35rem] leading-[1.55] text-[#24110E] sm:text-[1.55rem]">
                  {point.story}
                </div>
                <div className="my-8 border-t border-[#741314]/20" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#741314]/62">
                  Transcripción del audio
                </p>
                <div className="mt-4 whitespace-pre-line text-base leading-8 text-[#24110E]/80">
                  {point.transcript}
                </div>
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
