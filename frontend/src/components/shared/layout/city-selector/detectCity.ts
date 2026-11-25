import { INDIAN_CITIES } from "@/data/indianCities";
import { reverseGeocode } from "@/lib/openStreetMap";
import { toCityId, type SavedLocation } from "./citySelector.shared";

export type DetectCityErrorCode =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "geocode_failed"
  | "city_not_supported";

type DetectCityError = Error & { code: DetectCityErrorCode };

function createDetectError(code: DetectCityErrorCode): DetectCityError {
  return Object.assign(new Error(code), { code });
}

function isDetectError(error: unknown): error is DetectCityError {
  return error instanceof Error && "code" in error;
}

export function getDetectErrorCode(error: unknown): DetectCityErrorCode {
  return isDetectError(error) ? error.code : "geocode_failed";
}

// Includes the time the user takes to answer the browser permission prompt
const GEOLOCATION_TIMEOUT_MS = 60_000;
const GEOCODE_TIMEOUT_MS = 8_000;
const COORDINATE_CACHE_DECIMALS = 2;

// Nominatim names that differ from the city master
const CITY_ALIASES: Record<string, string> = {
  bangalore: "Bengaluru",
  bombay: "Mumbai",
  calcutta: "Kolkata",
  madras: "Chennai",
  "new delhi": "Delhi",
};

const cityByLowerName = new Map<string, string>(INDIAN_CITIES.map((city) => [city.toLowerCase(), city]));

// One reverse lookup per rounded area per session, as Nominatim asks for caching
const geocodeCache = new Map<string, Promise<SavedLocation>>();

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(createDetectError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      if (error.code === error.PERMISSION_DENIED) reject(createDetectError("denied"));
      else if (error.code === error.TIMEOUT) reject(createDetectError("timeout"));
      else reject(createDetectError("unavailable"));
    }, { enableHighAccuracy: false, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 10 * 60 * 1000 });
  });
}

function matchCityMaster(candidates: string[]): string | null {
  for (const candidate of candidates) {
    const key = candidate.trim().toLowerCase();
    const match = cityByLowerName.get(CITY_ALIASES[key]?.toLowerCase() ?? key);
    if (match) return match;
  }
  return null;
}

async function resolveLocation(latitude: number, longitude: number): Promise<SavedLocation> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);

  try {
    const { cityCandidates, state, country } = await reverseGeocode(latitude, longitude, controller.signal);
    const city = matchCityMaster(cityCandidates);
    if (!city) throw createDetectError("city_not_supported");
    return { cityId: toCityId(city), city, state, country, source: "auto" };
  } catch (error) {
    if (isDetectError(error)) throw error;
    throw createDetectError("geocode_failed");
  } finally {
    clearTimeout(timer);
  }
}

export async function detectCity(): Promise<SavedLocation> {
  const { coords } = await getCurrentPosition();
  const cacheKey = `${coords.latitude.toFixed(COORDINATE_CACHE_DECIMALS)},${coords.longitude.toFixed(COORDINATE_CACHE_DECIMALS)}`;

  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  const pending = resolveLocation(coords.latitude, coords.longitude);
  geocodeCache.set(cacheKey, pending);
  // Failed lookups must not be cached
  pending.catch(() => geocodeCache.delete(cacheKey));
  return pending;
}
