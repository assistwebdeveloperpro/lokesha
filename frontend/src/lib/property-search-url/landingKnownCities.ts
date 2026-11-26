import { POPULAR_CITIES } from "@/components/shared/layout/city-selector/citySelector.shared";
import { INDIAN_CITIES } from "@/data/indianCities";

export const LANDING_KNOWN_CITIES = [
  ...new Set([...INDIAN_CITIES, ...POPULAR_CITIES.map((city) => city.name)]),
];
