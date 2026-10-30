import { CITY_LOCALITIES } from "@/data/indianCityLocalities";

export const TOP_LOCALITY_LIMIT = 14;

function resolveCityKey(cityName: string): string | undefined {
  const trimmed = cityName.trim();
  if (!trimmed) return undefined;
  if (CITY_LOCALITIES[trimmed]) return trimmed;

  const normalized = trimmed.toLowerCase();
  return Object.keys(CITY_LOCALITIES).find(
    (city) => city.toLowerCase() === normalized,
  );
}

export function getTopLocalities(cityName?: string): string[] {
  if (!cityName) return [];
  const key = resolveCityKey(cityName);
  if (!key) return [];
  return (CITY_LOCALITIES[key] ?? []).slice(0, TOP_LOCALITY_LIMIT);
}
