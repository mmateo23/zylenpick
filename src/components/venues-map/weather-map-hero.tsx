import Image from "next/image";
import { ArrowDown, LocateFixed } from "lucide-react";
import type { CurrentWeather } from "@/features/weather/current-weather";
import styles from "./weather-hero.module.css";

const periodLabels = { dawn: "Amanece", day: "Ahora mismo", dusk: "Cae la tarde", night: "Bajo la luna" };

export function WeatherMapHero({ weather, heroImageUrl, demoMode = false, locating = false, located = false, locationLabel = null, onLocate, title = "Un mapa para salir y descubrir.", eyebrow, description, imageAlt = "Imagen destacada de Talavera de la Reina", actionHref, actionLabel = "Ver locales" }: {
  weather: CurrentWeather | null;
  heroImageUrl: string;
  demoMode?: boolean;
  locating?: boolean;
  located?: boolean;
  locationLabel?: string | null;
  onLocate?: () => void;
  title?: string;
  eyebrow?: string;
  description?: string;
  imageAlt?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  const period = weather?.period ?? (weather ? weather.isDay ? "day" : "night" : "unknown");
  const precipitation = weather && (weather.precipitationMm > 0 || ["rain", "storm", "snow"].includes(weather.conditionKind));
  return <header className={styles.hero} data-period={period} data-condition={weather?.conditionKind ?? "unknown"}>
    <div className={styles.atmosphere} aria-hidden="true">
      {weather ? <span className={styles.orb} data-phase={weather.isDay ? "sun" : weather.moonPhase} /> : null}
      {weather && weather.conditionKind !== "clear" ? <><span className={styles.cloud} /><span className={`${styles.cloud} ${styles.cloudSecond}`} /></> : null}
      {precipitation ? <div className={styles.rain}>{Array.from({ length: 9 }, (_, i) => <span key={i} />)}</div> : null}
    </div>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>{eyebrow ?? (demoMode ? "Explora cerca · Demo" : "Explora cerca")}</p>
      <h1>{title}</h1>
      <p>{description ?? (demoMode ? "Una muestra de cómo convivirían locales, parques, mesas y servicios en el explorador." : "Puntos de recogida, parques, monumentos y lugares útiles marcados y revisados por Pickyalo.")}</p>
    </div>
    <div className={styles.scene}>
      {weather ? <div className={styles.readout}>
        <span className={styles.period}>{periodLabels[weather.period ?? (weather.isDay ? "day" : "night")]}</span>
        <strong className={styles.temperature} aria-label={`${Math.round(weather.temperatureC)} grados Celsius`}>{Math.round(weather.temperatureC)}°</strong>
        <span className={styles.condition}>{weather.conditionLabel}</span>
      </div> : null}
      <Image className={styles.image} src={heroImageUrl === "/home/zonas/badges/talavera_tile_mural.png" ? "/home/assets/drive_teatro_victoria.png" : heroImageUrl} alt={imageAlt} width={1296} height={1200} sizes="(max-width: 1023px) 420px, 540px" priority />
      {actionHref ? <a className={styles.locate} href={actionHref}><ArrowDown size={17} aria-hidden="true" />{actionLabel}</a> : onLocate ? <button className={styles.locate} onClick={onLocate} type="button" disabled={locating}><LocateFixed size={17} aria-hidden="true" />{locating ? "Localizando…" : located ? "Centrar en mí" : "Usar mi ubicación"}</button> : null}
      {located ? <p className={styles.location} aria-live="polite">{locationLabel ?? "Tu ubicación aproximada"}</p> : null}
    </div>
  </header>;
}
