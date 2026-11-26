// Residential property type (as in the proptype param) -> word used in the search path
const RESIDENTIAL_TYPE_PATH_WORDS: Record<string, string> = {
  "flat-apartment": "flats",
  "bungalow-villa": "bungalows",
  "studio-apartment": "studio-apartments",
  "weekend-homes": "weekend-homes",
  "farm-house": "farm-houses",
  penthouse: "penthouse",
  duplex: "duplex",
};

const DEFAULT_TYPES_SEGMENT = "flats";

// ["penthouse", "flat-apartment"] -> "flats-penthouse"; no known type -> "flats"
export function buildTypesSegment(propertyTypes: readonly string[]): string {
  const selected = new Set(propertyTypes.map((type) => type.toLowerCase()));
  const words = Object.entries(RESIDENTIAL_TYPE_PATH_WORDS)
    .filter(([type]) => selected.has(type))
    .map(([, word]) => word);

  return words.length > 0 ? words.join("-") : DEFAULT_TYPES_SEGMENT;
}
