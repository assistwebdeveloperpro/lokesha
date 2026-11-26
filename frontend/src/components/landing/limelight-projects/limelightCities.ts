import { INDIAN_STATES, STATE_CITIES } from "@/data/indianStatesCities";
import type { DropdownOption } from "@/components/shared/CustomDropdown";

const normalize = (value: string) => value.trim().toLowerCase();

function findState(city: string) {
  const target = normalize(city);
  return INDIAN_STATES.find((state) =>
    STATE_CITIES[state].some((stateCity) => normalize(stateCity) === target),
  );
}

// Cities of the selected city's state; the selected city is always part of the list
export function getSameStateCityOptions(city: string): DropdownOption[] {
  const state = findState(city);
  const cities = state ? STATE_CITIES[state] : [];
  const hasCity = cities.some((stateCity) => normalize(stateCity) === normalize(city));
  const names = hasCity ? cities : [city, ...cities];

  return names.map((name) => ({ value: name, label: name }));
}

// Matches the stored spelling so the dropdown highlights the current city
export function resolveCityName(city: string) {
  const state = findState(city);
  return state
    ? (STATE_CITIES[state].find((stateCity) => normalize(stateCity) === normalize(city)) ?? city)
    : city;
}
