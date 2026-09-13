export type WeatherConditionKind =
  | "clear"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

export type MoonPhase =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export type CurrentWeather = {
  period: "dawn" | "day" | "dusk" | "night";
  temperatureC: number;
  conditionLabel: string;
  conditionKind: WeatherConditionKind;
  isDay: boolean;
  precipitationMm: number;
  cloudCoverPercent: number;
  moonPhase: MoonPhase;
  moonPhaseLabel: string;
  moonIlluminationPercent: number;
};

type OpenMeteoResponse = {
  daily?: { sunrise?: number[]; sunset?: number[] };
  current?: {
    temperature_2m?: number;
    is_day?: number;
    precipitation?: number;
    weather_code?: number;
    cloud_cover?: number;
  };
};

const moonPhaseNames: Array<{ phase: MoonPhase; label: string }> = [
  { phase: "new", label: "Luna nueva" },
  { phase: "waxing-crescent", label: "Luna creciente" },
  { phase: "first-quarter", label: "Cuarto creciente" },
  { phase: "waxing-gibbous", label: "Gibosa creciente" },
  { phase: "full", label: "Luna llena" },
  { phase: "waning-gibbous", label: "Gibosa menguante" },
  { phase: "last-quarter", label: "Cuarto menguante" },
  { phase: "waning-crescent", label: "Luna menguante" },
];

export function getWeatherPeriod(now: number, sunrise: number | undefined, sunset: number | undefined, isDay: boolean): CurrentWeather["period"] {
  const twilight = 45 * 60 * 1000;
  if (Number.isFinite(sunrise) && Math.abs(now - sunrise! * 1000) <= twilight) return "dawn";
  if (Number.isFinite(sunset) && Math.abs(now - sunset! * 1000) <= twilight) return "dusk";
  return isDay ? "day" : "night";
}

function getMoonState(now: Date) {
  const synodicMonthDays = 29.53058867;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const elapsedDays = (now.getTime() - knownNewMoon) / 86_400_000;
  const cycle = ((elapsedDays % synodicMonthDays) + synodicMonthDays) % synodicMonthDays;
  const fraction = cycle / synodicMonthDays;
  const phaseIndex = Math.round(fraction * 8) % 8;
  const phase = moonPhaseNames[phaseIndex];

  return {
    moonPhase: phase.phase,
    moonPhaseLabel: phase.label,
    moonIlluminationPercent: Math.round(
      ((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100,
    ),
  };
}

function getCondition(weatherCode: number): {
  label: string;
  kind: WeatherConditionKind;
} {
  if (weatherCode === 0) return { label: "Despejado", kind: "clear" };
  if (weatherCode <= 3) return { label: "Algo nublado", kind: "cloudy" };
  if (weatherCode === 45 || weatherCode === 48) {
    return { label: "Niebla", kind: "fog" };
  }
  if (weatherCode >= 51 && weatherCode <= 67) {
    return { label: "Lluvia", kind: "rain" };
  }
  if (weatherCode >= 71 && weatherCode <= 77) {
    return { label: "Nieve", kind: "snow" };
  }
  if (weatherCode >= 80 && weatherCode <= 82) {
    return { label: "Chubascos", kind: "rain" };
  }
  if (weatherCode >= 85 && weatherCode <= 86) {
    return { label: "Nieve", kind: "snow" };
  }
  if (weatherCode >= 95) return { label: "Tormenta", kind: "storm" };
  return { label: "Tiempo variable", kind: "cloudy" };
}

export async function getCurrentWeather({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<CurrentWeather | null> {
  const apiKey = process.env.OPEN_METEO_API_KEY?.trim();

  // The public endpoint is suitable for local evaluation. Production uses the
  // commercial endpoint only when its server-side key has been configured.
  if (process.env.NODE_ENV === "production" && !apiKey) return null;

  const endpoint = apiKey
    ? "https://customer-api.open-meteo.com/v1/forecast"
    : "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,is_day,precipitation,weather_code,cloud_cover",
    timezone: "Europe/Madrid",
    daily: "sunrise,sunset",
    timeformat: "unixtime",
    forecast_days: "1",
  });
  if (apiKey) params.set("apikey", apiKey);

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as OpenMeteoResponse;
    const current = payload.current;
    if (
      !current ||
      typeof current.temperature_2m !== "number" ||
      typeof current.weather_code !== "number" ||
      typeof current.is_day !== "number"
    ) {
      return null;
    }

    const condition = getCondition(current.weather_code);
    return {
      period: getWeatherPeriod(Date.now(), payload.daily?.sunrise?.[0], payload.daily?.sunset?.[0], current.is_day === 1),
      temperatureC: current.temperature_2m,
      conditionLabel: condition.label,
      conditionKind: condition.kind,
      isDay: current.is_day === 1,
      precipitationMm: current.precipitation ?? 0,
      cloudCoverPercent: current.cloud_cover ?? 0,
      ...getMoonState(new Date()),
    };
  } catch {
    return null;
  }
}
