import { LANDING_ALL_INDIA_SEGMENT } from "./landingUrl.config";
import { toUrlSegment } from "./slug";

const CITY_PLACEHOLDER = "{city}";
const TYPES_PLACEHOLDER = "{types}";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// null means all of India
export function cityToSegment(cityName: string | null | undefined): string {
  return cityName ? toUrlSegment(cityName) : LANDING_ALL_INDIA_SEGMENT;
}

export function fillCityTemplate(
  template: string,
  cityName: string | null | undefined,
  typesSegment = "",
): string {
  return template
    .replace(TYPES_PLACEHOLDER, typesSegment)
    .replace(CITY_PLACEHOLDER, cityToSegment(cityName));
}

// "buy-{types}-in-{city}" + "buy-flats-penthouse-in-navi-mumbai" -> "navi-mumbai"
export function matchCityTemplate(template: string, slug: string): string | null {
  const pattern = template
    .split(/(\{city\}|\{types\})/)
    .map((part) => {
      if (part === CITY_PLACEHOLDER) return "(.+)";
      if (part === TYPES_PLACEHOLDER) return "[^/]+?";
      return escapeRegExp(part);
    })
    .join("");

  return new RegExp(`^${pattern}$`).exec(slug.toLowerCase())?.[1] ?? null;
}

export const isAllIndiaSegment = (segment: string) =>
  segment === LANDING_ALL_INDIA_SEGMENT;

export function findKnownCity(
  segment: string,
  knownCities: readonly string[],
): string | undefined {
  return knownCities.find((city) => toUrlSegment(city) === segment);
}
