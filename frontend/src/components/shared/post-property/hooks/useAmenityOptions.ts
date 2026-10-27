"use client";

import { useEffect, useState } from "react";
import type { AmenityOptionsQuery } from "@/services/property.service";
import { getToken } from "@/services/session";
import {
  EMPTY_AMENITY_OPTIONS,
  getAmenityOptionsKey,
  loadAmenityOptions,
  type AmenityTileOptions,
} from "../utils/amenityOptions";

type LoadedOptions = { key: string; options: AmenityTileOptions };

// Amenities and furnishing offered for a listing type, property type and sub type
export function useAmenityOptions(query: AmenityOptionsQuery) {
  const { listingType, propertyType, subType } = query;
  const key = getAmenityOptionsKey(query);
  const [loaded, setLoaded] = useState<LoadedOptions | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;
    loadAmenityOptions({ listingType, propertyType, subType }, token)
      .then((options) => {
        if (!cancelled) setLoaded({ key, options });
      })
      .catch(() => {
        if (!cancelled) setFailedKey(key);
      });

    return () => {
      cancelled = true;
    };
  }, [key, listingType, propertyType, subType]);

  const isLoaded = loaded?.key === key;

  return {
    ...(isLoaded ? loaded.options : EMPTY_AMENITY_OPTIONS),
    isLoading: !isLoaded && failedKey !== key,
    hasError: !isLoaded && failedKey === key,
  };
}
