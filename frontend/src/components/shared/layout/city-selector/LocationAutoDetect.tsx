"use client";

import { useEffect } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { readStoredLocation, storeLocation } from "./citySelector.shared";
import { detectCity, getDetectErrorCode, type DetectCityErrorCode } from "./detectCity";

const ATTEMPTED_SESSION_KEY = "lokesha_location_detect_attempted";

const ERROR_MESSAGES: Record<DetectCityErrorCode, string> = {
  unsupported: "Location is not supported on this device. Please select your city.",
  denied: "Location permission denied. Please select your city.",
  unavailable: "We could not find your location. Please select your city.",
  timeout: "Finding your location took too long. Please select your city.",
  geocode_failed: "We could not detect your city. Please select your city.",
  city_not_supported: "Lokesha is not available in your area yet. Please select a city.",
};

export default function LocationAutoDetect() {
  const { showToast } = useToast();

  useEffect(() => {
    if (readStoredLocation() !== null) return;
    // One attempt per session, also guards against double effect runs
    if (window.sessionStorage.getItem(ATTEMPTED_SESSION_KEY) === "true") return;
    window.sessionStorage.setItem(ATTEMPTED_SESSION_KEY, "true");

    detectCity()
      .then((location) => {
        // A manual choice made while detecting always wins
        if (readStoredLocation() !== null) return;
        storeLocation(location);
        showToast(`Showing properties in ${location.city}`);
      })
      .catch((error) => showToast(ERROR_MESSAGES[getDetectErrorCode(error)], "error"));
  }, [showToast]);

  return null;
}
