"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Compass, MapPin, Moon, Store, Sun, X } from "lucide-react";

import { readSelectedCity, saveSelectedCity, type StoredCity } from "@/features/location/city-preference";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { homeHref, homeNowItems, initialHomeSelection, type HomeResult } from "./home-discovery-model";
import { HomePocketMap } from "./home-pocket-map";
import { PickyPong } from "./picky-pong";
import { HomeOrbit } from "./home-orbit";
import styles from "./home-discovery.module.css";

const returnKey = "pickyalo.home.return";

export type PickyaloHomeProps = {
  cities: StoredCity[];
  citySlug: string;
  cityName: string;
  items: HomeResult[];
  today: string;
  mapboxAccessToken: string;
  entryImages: {
    commerce: string;
    discover: string;
    events: string;
  };
};

function ResultImage({ item }: { item: HomeResult }) {
  const [failed, setFailed] = useState(false);
  const FallbackIcon = item.path === "comer" ? Store : item.path === "eventos" ? CalendarDays : Compass;
  return <span className={styles.resultMedia}>
    {item.image && !failed
      ? <Image src={item.image} alt="" fill sizes="(max-width: 599px) 90vw, (max-width: 999px) 44vw, 360px" onError={() => setFailed(true)} />
      : <span className={styles.imageFallback}><FallbackIcon size={40} /><span>{item.categoryLabel || "Selección local"}</span></span>}
    <span className={styles.mediaLabel}>{item.kind === "workshop" ? "Taller" : item.kind === "venue" ? "Local" : item.path === "eventos" ? "En la agenda" : item.categoryLabel}</span>
  </span>;
}

export function PickyaloHome({ cities, citySlug, cityName, items, today, mapboxAccessToken, entryImages }: PickyaloHomeProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cityOpen, setCityOpen] = useState(false);
  const [orbitScene, setOrbitScene] = useState<"commerce" | "discover" | "events">("commerce");
  const { resolvedTheme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const cityDialog = useRef<HTMLDialogElement>(null);
  const cityButton = useRef<HTMLButtonElement>(null);
  const nowItems = homeNowItems(items, today);
  const pocketItems = useMemo(() => items
    .filter((item): item is HomeResult & { latitude: number; longitude: number } =>
      item.path === "descubrir" && item.latitude !== undefined && item.longitude !== undefined)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.latitude === item.latitude && candidate.longitude === item.longitude) === index)
    .slice(0, 7), [items]);
  const shortCityName = cityName === "Talavera de la Reina" ? "Talavera" : cityName;

  useEffect(() => setThemeReady(true), []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("ciudad")) return;
    try {
      const stored = readSelectedCity();
      if (stored && stored.slug !== citySlug && cities.some((city) => city.slug === stored.slug)) {
        router.replace(homeHref(stored.slug, initialHomeSelection), { scroll: false });
      }
    } catch { /* The Home remains usable when browser storage is disabled. */ }
  }, [cities, citySlug, router]);

  useEffect(() => {
    if (cityOpen) cityDialog.current?.showModal();
    else if (cityDialog.current?.open) cityDialog.current.close();
  }, [cityOpen]);

  const remember = useCallback(() => {
    try { sessionStorage.setItem(returnKey, homeHref(citySlug, initialHomeSelection)); } catch {}
  }, [citySlug]);

  function selectCity(city: StoredCity) {
    setCityOpen(false);
    try { saveSelectedCity(city); } catch {}
    startTransition(() => router.push(homeHref(city.slug, initialHomeSelection), { scroll: false }));
  }

  return <div className={`pickyalo-public-canvas ${styles.home}`} data-home-path="inicio" data-orbit-scene={orbitScene}>
    <a href="#home-content" className={styles.skip}>Saltar al contenido</a>
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" aria-label="Pickyalo · inicio" className={styles.brand}>
          <Image className={styles.logoLight} src="/logo/LogoNuevo.svg" alt="Pickyalo" width={124} height={44} priority />
          <Image className={styles.logoDark} src="/logo/LogoNuevo_Negativo.svg" alt="Pickyalo" width={124} height={44} />
        </Link>
        <div className={styles.headerActions}>
        <button ref={cityButton} className={styles.locality} onClick={() => setCityOpen(true)} aria-haspopup="dialog" disabled={pending}>
          <MapPin size={16} aria-hidden="true" /><span>{shortCityName}</span><ChevronDown size={14} aria-hidden="true" />
        </button>
        <button className={styles.themeToggle} type="button" aria-label="Modo granate" aria-pressed={themeReady && resolvedTheme === "dark"} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          <Moon className={styles.logoLight} size={19} aria-hidden="true" /><Sun className={styles.logoDark} size={19} aria-hidden="true" />
        </button>
        </div>
      </header>

      <main id="home-content" className={styles.initial}>
        <HomeOrbit images={entryImages} cityName={shortCityName} onNavigate={remember} onSceneChange={setOrbitScene} />

        <div id="home-local-content" className={styles.orbitContentAnchor} />
        {pocketItems.length ? <section className={styles.pocket} aria-labelledby="pocket-title">
          <div className={styles.pocketCopy}>
            <p className={styles.eyebrow}>POCKET MAP · {shortCityName}</p>
            <h2 id="pocket-title">Lo bueno de aquí,<br /><em>en el bolsillo.</em></h2>
            <p>Un vistazo rápido a los lugares y servicios que ya forman parte de Pickyalo.</p>
            <Link href="/mapa" onClick={remember}>Abrir el mapa completo <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <HomePocketMap accessToken={mapboxAccessToken} cityName={shortCityName} items={pocketItems} onOpen={remember} />
        </section> : null}

        <Link className={styles.busBanner} href="/autobuses" onClick={remember}>
          <span className={styles.busIcon} aria-hidden="true">
            <Image
              src="/images/transit/pickyalo-bus-asset-cutout.png"
              alt=""
              fill
              sizes="(max-width: 599px) 108px, 160px"
            />
          </span>
          <span className={styles.busCopy}>
            <span className={styles.eyebrow}>AUTOBUSES URBANOS</span>
            <strong>¿Qué línea pasa por aquí?</strong>
            <span>Consulta sentidos, próximas salidas y siguientes paradas.</span>
          </span>
          <span className={styles.busAction}>Ver autobuses <ArrowRight size={18} aria-hidden="true" /></span>
        </Link>

        <section className={styles.aboutGame} aria-labelledby="about-heading">
          <div className={styles.aboutGameCopy}>
            <p className={styles.eyebrow}>CERCA · LOCAL · ELEGIDO</p>
            <h2 id="about-heading">Pickyalo,<br /><em>en pocas palabras.</em></h2>
            <p>Lo bueno de tu ciudad, <strong>más fácil de elegir.</strong><br />Comida, sitios y planes cerca de ti, seleccionados con criterio.</p>
            <p className={styles.aboutPunchline}>Menos buscar. <em>Más disfrutar.</em></p>
            <Link href="/el-proyecto" onClick={remember}>Conoce el proyecto<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <PickyPong />
        </section>

        <section className={styles.nowSection} aria-labelledby="now-heading">
          <div className={styles.nowHeading}>
            <div><p className={styles.eyebrow}>UNA SELECCIÓN PARA EMPEZAR</p><h2 id="now-heading">Ahora en {shortCityName}</h2></div>
            <p>Si quieres mirar con calma, empieza por aquí.</p>
          </div>
          {nowItems.length ? <div className={styles.results}>
            {nowItems.map((item) => <article key={item.id} className={`pickyalo-media-card ${styles.result}`}>
              <Link href={item.href} prefetch={false} onClick={remember} aria-label={`${item.title} · ${item.cta}`}>
                <ResultImage item={item} />
                <span className={styles.resultBody}>
                  <span className={styles.resultTitle}><h3>{item.title}</h3></span>
                  <span className={styles.resultSubtitle}>{item.subtitle}</span>
                  {item.kind === "event" && item.startsOn && <span className={styles.eventDate}>{new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date(item.startsOn))}</span>}
                  <span className={styles.resultCta}>{item.cta}<ArrowRight size={18} aria-hidden="true" /></span>
                </span>
              </Link>
            </article>)}
          </div> : <div className={styles.empty}><Compass size={34} strokeWidth={1.25} aria-hidden="true" /><h3>Estamos preparando la selección.</h3><p>Mientras tanto, puedes entrar en Comercios o descubrir la ciudad en el mapa.</p></div>}
        </section>
      </main>

    </div>

    <ZylenPickFooter theme="auto" />

    <dialog ref={cityDialog} className={styles.cityDialog} aria-labelledby="city-heading" onCancel={() => setCityOpen(false)} onClose={() => { setCityOpen(false); cityButton.current?.focus(); }} onClick={(event) => { if (event.target === event.currentTarget) setCityOpen(false); }}>
      <div className={styles.cityPanel}>
        <button className={"pickyalo-light-control " + (styles.close)} onClick={() => setCityOpen(false)} aria-label="Cerrar selección de localidad"><X size={21} /></button>
        <p className={styles.eyebrow}>LO BUENO ESTÁ CERCA</p><h2 id="city-heading">¿Dónde miramos?</h2>
        <p>Elige tu localidad. Tú decides por dónde empezar.</p>
        <div className={styles.cityList}>{cities.map((city) => <button key={city.slug} onClick={() => selectCity(city)} aria-pressed={city.slug === citySlug}><MapPin size={18} aria-hidden="true" /><span>{city.name}</span>{city.slug === citySlug ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}</button>)}</div>
        {!cities.length && <p>No hemos podido cargar las localidades.</p>}
      </div>
    </dialog>
  </div>;
}
