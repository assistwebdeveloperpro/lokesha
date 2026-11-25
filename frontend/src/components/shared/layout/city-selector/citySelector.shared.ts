import { LANDING_ALL_INDIA_SEGMENT } from "@/lib/property-search-url/landingUrl.config";
import { toUrlSegment } from "@/lib/property-search-url/slug";

export const CITY_STORAGE_KEY = "lokesha_location";

export const ALL_INDIA_LABEL = "All India";

export const DEFAULT_SELECTED_CITY = "Ahmedabad";

export const CITY_CHANGE_EVENT = "lokesha-city-change";

export type LocationSource = "default" | "browser" | "manual";

export type SavedLocation = {
  city: string;
  citySlug: string;
  source: LocationSource;
};

export function toCitySlug(city: string): string {
  return city === ALL_INDIA_LABEL ? LANDING_ALL_INDIA_SEGMENT : toUrlSegment(city);
}

export function createLocation(city: string, source: LocationSource): SavedLocation {
  return { city, citySlug: toCitySlug(city), source };
}

function isSavedLocation(value: unknown): value is SavedLocation {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.city === "string" &&
    typeof candidate.citySlug === "string" &&
    (candidate.source === "default" ||
      candidate.source === "browser" ||
      candidate.source === "manual")
  );
}

// Records saved before the source rename: "auto" meant browser detection
function migrateLegacyLocation(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  const { city, source } = value as Record<string, unknown>;
  if (typeof city !== "string") return value;
  if (source !== "auto" && source !== "manual") return value;
  return createLocation(city, source === "auto" ? "browser" : "manual");
}

export function readStoredLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CITY_STORAGE_KEY);
    const parsed = migrateLegacyLocation(raw ? JSON.parse(raw) : null);
    return isSavedLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function storeLocation(location: SavedLocation): void {
  window.localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(location));
  window.dispatchEvent(new Event(CITY_CHANGE_EVENT));
}

export function readStoredCity(): string {
  return readStoredLocation()?.city ?? DEFAULT_SELECTED_CITY;
}

// Any city chosen by the user or from a url is a manual choice
export function storeCity(city: string): void {
  storeLocation(createLocation(city, "manual"));
}

// First visit: keep the default city until detection or the user decides otherwise
export function ensureDefaultLocation(): boolean {
  if (readStoredLocation() !== null) return false;
  storeLocation(createLocation(DEFAULT_SELECTED_CITY, "default"));
  return true;
}

export type PopularCity = {
  id: string;
  name: string;
  imageSrc: string;
};

export const POPULAR_CITIES: PopularCity[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    imageSrc: "/assets/images/popular_city_images/mumbai.svg",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    imageSrc: "/assets/images/popular_city_images/bengaluru.svg",
  },
  {
    id: "pune",
    name: "Pune",
    imageSrc: "/assets/images/popular_city_images/pune.svg",
  },
  {
    id: "chennai",
    name: "Chennai",
    imageSrc: "/assets/images/popular_city_images/chennai.svg",
  },
  {
    id: "kolkata",
    name: "Kolkata",
    imageSrc: "/assets/images/popular_city_images/kolkata.svg",
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    imageSrc: "/assets/images/popular_city_images/ahmedabad.svg",
  },
  {
    id: "delhi",
    name: "Delhi",
    imageSrc: "/assets/images/popular_city_images/new_delhi.svg",
  },
  {
    id: "noida",
    name: "Noida",
    imageSrc: "/assets/images/popular_city_images/noida.svg",
  },
  {
    id: "gurgaon",
    name: "Gurgaon",
    imageSrc: "/assets/images/popular_city_images/gurgaon.svg",
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    imageSrc: "/assets/images/popular_city_images/hyderabad.svg",
  },
  {
    id: "gandhinagar",
    name: "Gandhinagar",
    imageSrc: "/assets/images/popular_city_images/gandhinagar.svg",
  },
];

export type CitySelectorView = "popular" | "all";

export const CITY_PANEL_MAX_WIDTH = 512;
export const CITY_PANEL_GUTTER = 12;

export type CityPanelPlacement = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  caretLeft: number;
  backdropTop: number;
};

function preferredAlignOffset(isMobile: boolean, viewportWidth: number) {
  if (isMobile) return 0;
  if (viewportWidth >= 1280) return 40;
  if (viewportWidth >= 1024) return 32;
  return 16;
}

export function getCityPanelPlacement(
  trigger: DOMRect,
  isMobile: boolean,
): CityPanelPlacement {
  const visual = window.visualViewport;
  const viewportWidth = window.innerWidth;
  const visualBottom = visual ? visual.offsetTop + visual.height : window.innerHeight;
  const usableBottom = Math.min(window.innerHeight, visualBottom);
  const gutter = isMobile ? 10 : 16;
  const width = Math.min(CITY_PANEL_MAX_WIDTH, Math.max(0, viewportWidth - gutter * 2));
  const alignOffset = preferredAlignOffset(isMobile, viewportWidth);
  const minLeft = gutter;
  const maxLeft = Math.max(minLeft, viewportWidth - gutter - width);
  const left = Math.min(Math.max(trigger.left - alignOffset, minLeft), maxLeft);
  const top = trigger.bottom;
  const caretLeft = Math.min(
    Math.max(16, trigger.left + trigger.width / 2 - left - 7),
    Math.max(16, width - 24),
  );

  return {
    top,
    left,
    width,
    maxHeight: Math.max(220, usableBottom - top - gutter),
    caretLeft,
    backdropTop: trigger.bottom,
  };
}
