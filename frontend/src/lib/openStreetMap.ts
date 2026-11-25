export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = "&copy; OpenStreetMap contributors";
export const OSM_MAX_ZOOM = 19;

const SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const CITY_ZOOM_LEVEL = "10";
const COUNTRY_CODE = "in";
const RESULT_LIMIT = "6";

export const MAP_MARKER_SIZE = 34;
export const MAP_MARKER_HTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_MARKER_SIZE}" height="${MAP_MARKER_SIZE}" viewBox="0 0 24 24" fill="#0284c7" stroke="#fff" stroke-width="1.5"><path d="M12 22s8-6.5 8-12a8 8 0 1 0-16 0c0 5.5 8 12 8 12Z"/><circle cx="12" cy="10" r="3" fill="#fff" stroke="none"/></svg>`;

export type PlaceResult = { id: number; name: string; latitude: number; longitude: number };

export async function searchPlaces(query: string, signal: AbortSignal): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    countrycodes: COUNTRY_CODE,
    limit: RESULT_LIMIT,
  });
  const response = await fetch(`${SEARCH_URL}?${params}`, { signal });
  if (!response.ok) throw new Error("Location search failed");

  const rows: { place_id: number; display_name: string; lat: string; lon: string }[] = await response.json();
  return rows.map((row) => ({
    id: row.place_id,
    name: row.display_name,
    latitude: Number(row.lat),
    longitude: Number(row.lon),
  }));
}

export type ReverseGeocodeResult = {
  cityCandidates: string[];
  state: string;
  country: string;
};

type ReverseGeocodeResponse = {
  address?: Record<string, string | undefined>;
};

// Nominatim returns the locality under different keys depending on its size
const CITY_ADDRESS_KEYS = ["city", "town", "municipality", "village", "city_district", "state_district", "county"];

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal: AbortSignal,
): Promise<ReverseGeocodeResult> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "jsonv2",
    zoom: CITY_ZOOM_LEVEL,
    addressdetails: "1",
    "accept-language": "en",
  });
  const response = await fetch(`${REVERSE_URL}?${params}`, { signal });
  if (!response.ok) throw new Error("Reverse geocoding failed");

  const { address = {} }: ReverseGeocodeResponse = await response.json();
  const cityCandidates = CITY_ADDRESS_KEYS.flatMap((key) => (address[key] ? [address[key] as string] : []));
  return { cityCandidates, state: address.state ?? "", country: address.country ?? "" };
}
