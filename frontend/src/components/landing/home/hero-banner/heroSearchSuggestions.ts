import { INDIAN_CITIES } from "@/data/indianCities";
import { CITY_LOCALITIES } from "@/data/indianCityLocalities";
import type { SearchTag } from "./heroBanner.shared";

export const MIN_SUGGESTION_CHARS = 3;
const MAX_SUGGESTIONS_PER_KIND = 6;

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

const uniqueLabels = (labels: string[]) => [...new Set(labels)];

const localitiesFor = (city: string | null) =>
  uniqueLabels(city ? CITY_LOCALITIES[city] ?? [] : Object.values(CITY_LOCALITIES).flat());

const matchLabels = (labels: readonly string[], query: string) => {
  const starts: string[] = [];
  const contains: string[] = [];
  for (const label of labels) {
    const index = normalize(label).indexOf(query);
    if (index === 0) starts.push(label);
    else if (index > 0) contains.push(label);
  }
  return [...starts, ...contains];
};

export const isSuggestionQuery = (text: string) =>
  normalize(text).length >= MIN_SUGGESTION_CHARS;

export type SearchSuggestionGroups = {
  cities: SearchTag[];
  localities: SearchTag[];
};

// Localities narrow to the selected city when there is one.
export function getSearchSuggestions(
  text: string,
  selectedCity: string | null,
): SearchSuggestionGroups {
  if (!isSuggestionQuery(text)) return { cities: [], localities: [] };
  const query = normalize(text);

  return {
    cities: matchLabels(INDIAN_CITIES, query)
      .slice(0, MAX_SUGGESTIONS_PER_KIND)
      .map((label) => ({ kind: "city", label })),
    localities: matchLabels(localitiesFor(selectedCity), query)
      .slice(0, MAX_SUGGESTIONS_PER_KIND)
      .map((label) => ({ kind: "locality", label })),
  };
}

// Exact (case-insensitive) match against known cities, then localities.
export function resolveSearchTag(
  text: string,
  selectedCity: string | null,
): SearchTag | null {
  const query = normalize(text);
  if (!query) return null;

  const city = INDIAN_CITIES.find((item) => normalize(item) === query);
  if (city) return { kind: "city", label: city };

  const locality = localitiesFor(selectedCity).find(
    (item) => normalize(item) === query,
  );
  return locality ? { kind: "locality", label: locality } : null;
}
