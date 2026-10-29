"use client";

import { useEffect, useState } from "react";
import {
  CITY_CHANGE_EVENT,
  DEFAULT_SELECTED_CITY,
  readStoredCity,
} from "./citySelector.shared";

export function useHeaderCity(): string {
  const [city, setCity] = useState(DEFAULT_SELECTED_CITY);

  useEffect(() => {
    const sync = () => setCity(readStoredCity());
    sync();
    window.addEventListener(CITY_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CITY_CHANGE_EVENT, sync);
  }, []);

  return city;
}
