import { INDIAN_CITIES } from "@/data/indianCities";
import type { SearchTag, SearchTagKind } from "./heroBanner.shared";

const normalize = (label: string) => label.trim().toLowerCase();

export const searchTagKey = (tag: SearchTag) =>
  `${tag.kind}:${normalize(tag.label)}`;

// Known city names become city tags; the rest default to locality.
export function createSearchTag(
  label: string,
  kind?: SearchTagKind,
): SearchTag | null {
  const trimmed = label.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;

  const knownCity = INDIAN_CITIES.find(
    (city) => normalize(city) === normalize(trimmed),
  );
  if (!kind && knownCity) return { kind: "city", label: knownCity };

  return { kind: kind ?? "locality", label: trimmed };
}

// Only one city is searchable at a time, so a new city replaces the old one.
export function appendSearchTag(tags: SearchTag[], tag: SearchTag): SearchTag[] {
  const rest =
    tag.kind === "city" ? tags.filter((item) => item.kind !== "city") : tags;
  if (rest.some((item) => searchTagKey(item) === searchTagKey(tag))) return rest;
  return tag.kind === "city" ? [tag, ...rest] : [...rest, tag];
}

export function syncHeaderCityTag(
  tags: SearchTag[],
  headerCity: string | null,
): SearchTag[] {
  const withoutCity = tags.filter((tag) => tag.kind !== "city");
  return headerCity
    ? [{ kind: "city", label: headerCity }, ...withoutCity]
    : withoutCity;
}
