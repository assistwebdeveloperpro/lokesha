import {
  getAmenityOptions,
  type AmenityOptionDto,
  type AmenityOptionsQuery,
  type AmenityOptionsResponse,
} from "@/services/property.service";
import type { ImageTileOption } from "../config/postPropertyForm.shared";

export type AmenityTileOptions = {
  amenities: ImageTileOption[];
  furnishing: ImageTileOption[];
};

export const EMPTY_AMENITY_OPTIONS: AmenityTileOptions = { amenities: [], furnishing: [] };

const toTile = (option: AmenityOptionDto): ImageTileOption => ({
  id: option.key,
  label: option.name,
  image: option.imagePath,
});

export function toTileOptions(response: AmenityOptionsResponse): AmenityTileOptions {
  return { amenities: response.amenities.map(toTile), furnishing: response.furnishing.map(toTile) };
}

export const getAmenityOptionsKey = ({ listingType, propertyType, subType }: AmenityOptionsQuery) =>
  [listingType, propertyType, subType ?? ""].join(":");

type Fetcher = typeof getAmenityOptions;

// The options only change with the database, so each combination is fetched once per page load
export function createAmenityOptionsLoader(fetcher: Fetcher = getAmenityOptions) {
  const cache = new Map<string, Promise<AmenityTileOptions>>();

  return function load(query: AmenityOptionsQuery, token: string): Promise<AmenityTileOptions> {
    const key = getAmenityOptionsKey(query);
    const cached = cache.get(key);
    if (cached) return cached;

    const request = fetcher(query, token).then(toTileOptions);
    cache.set(key, request);
    // A failed request is not kept, so the next render can try again
    request.catch(() => cache.delete(key));
    return request;
  };
}

export const loadAmenityOptions = createAmenityOptionsLoader();
