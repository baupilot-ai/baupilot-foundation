import { useCallback, useState } from "react";

/**
 * Weather data structure used by the daily report editor.
 * Structure is deliberately API-agnostic so we can later swap in a paid
 * provider (e.g. OpenWeather, MeteoBlue) without touching the UI.
 */
export interface DailyReportWeather {
  morningTemp: number | null;
  noonTemp: number | null;
  eveningTemp: number | null;
  condition: string | null;
  windSpeed: number | null;
  windDirection: string | null;
  precipitationMm: number | null;
  precipitation: string | null; // "rain" | "snow" | "none" | ...
  humidity: number | null;
  source: "open-meteo" | "mock" | "custom";
}

export interface ProjectLocation {
  lat?: number | null;
  lng?: number | null;
}

// Weather code → German label (WMO codes, cf. https://open-meteo.com/en/docs)
function codeToCondition(code: number): { condition: string; precipitation: string } {
  if (code === 0) return { condition: "Klar", precipitation: "keiner" };
  if ([1, 2].includes(code)) return { condition: "Leicht bewölkt", precipitation: "keiner" };
  if (code === 3) return { condition: "Bewölkt", precipitation: "keiner" };
  if ([45, 48].includes(code)) return { condition: "Nebel", precipitation: "keiner" };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: "Nieselregen", precipitation: "Regen" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: "Regen", precipitation: "Regen" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: "Schnee", precipitation: "Schnee" };
  if ([95, 96, 99].includes(code)) return { condition: "Gewitter", precipitation: "Regen" };
  return { condition: "Unbekannt", precipitation: "keiner" };
}

function mockWeather(): DailyReportWeather {
  return {
    morningTemp: 8,
    noonTemp: 15,
    eveningTemp: 11,
    condition: "Leicht bewölkt",
    windSpeed: 10,
    windDirection: "SW",
    precipitationMm: 0,
    precipitation: "keiner",
    humidity: 65,
    source: "mock",
  };
}

async function fetchOpenMeteo(date: string, lat: number, lng: number): Promise<DailyReportWeather> {
  // Free, no-key API. Requested hourly variables at 08/12/18.
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("hourly", "temperature_2m,precipitation,weather_code,wind_speed_10m,relative_humidity_2m");
  url.searchParams.set("daily", "weather_code,precipitation_sum,wind_speed_10m_max");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", date);
  url.searchParams.set("end_date", date);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Wetter-API ${res.status}`);
  const json = await res.json();

  const hours: string[] = json?.hourly?.time ?? [];
  const temps: number[] = json?.hourly?.temperature_2m ?? [];
  const codes: number[] = json?.hourly?.weather_code ?? [];
  const winds: number[] = json?.hourly?.wind_speed_10m ?? [];
  const hums: number[] = json?.hourly?.relative_humidity_2m ?? [];

  const idx = (h: number) => hours.findIndex((t) => t.endsWith(`T${String(h).padStart(2, "0")}:00`));
  const iMorn = idx(8);
  const iNoon = idx(12);
  const iEve = idx(18);

  const dayCode = json?.daily?.weather_code?.[0] ?? codes[iNoon] ?? 0;
  const cond = codeToCondition(dayCode);

  return {
    morningTemp: iMorn >= 0 ? temps[iMorn] ?? null : null,
    noonTemp: iNoon >= 0 ? temps[iNoon] ?? null : null,
    eveningTemp: iEve >= 0 ? temps[iEve] ?? null : null,
    condition: cond.condition,
    windSpeed: json?.daily?.wind_speed_10m_max?.[0] ?? (iNoon >= 0 ? winds[iNoon] ?? null : null),
    windDirection: null,
    precipitationMm: json?.daily?.precipitation_sum?.[0] ?? null,
    precipitation: cond.precipitation,
    humidity: iNoon >= 0 ? hums[iNoon] ?? null : null,
    source: "open-meteo",
  };
}

/**
 * Hook: on-demand weather fetch for a given date & project location.
 * - If a paid API key is provided via VITE_WEATHER_API_KEY, a custom fetch can be
 *   wired here later. For now, we default to open-meteo (no key) or a mock.
 */
export function useDailyReportWeather(_date: string, projectLocation: ProjectLocation) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DailyReportWeather | null>(null);

  const load = useCallback(
    async (date: string) => {
      setLoading(true);
      setError(null);
      try {
        const { lat, lng } = projectLocation;
        if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
          const w = await fetchOpenMeteo(date, lat, lng);
          setData(w);
          return w;
        }
        // No coordinates → mock fallback
        const w = mockWeather();
        setData(w);
        return w;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Wetter konnte nicht geladen werden";
        setError(msg);
        const w = mockWeather();
        setData(w);
        return w;
      } finally {
        setLoading(false);
      }
    },
    [projectLocation],
  );

  return { data, loading, error, load };
}
