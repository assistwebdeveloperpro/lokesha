"use client";

import { useEffect } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import {
  ensureDefaultLocation,
  readStoredLocation,
  storeLocation,
} from "./citySelector.shared";
import { DETECT_ERROR_MESSAGES, detectCity, getDetectErrorCode } from "./detectCity";

export default function LocationAutoDetect() {
  const { showToast } = useToast();

  useEffect(() => {
    // Only the first visit asks for permission, the default city is saved right away
    if (!ensureDefaultLocation()) return;

    detectCity()
      .then((location) => {
        // A manual choice made while detecting always wins
        if (readStoredLocation()?.source !== "default") return;
        storeLocation(location);
        showToast(`Showing properties in ${location.city}`);
      })
      .catch((error) => {
        const code = getDetectErrorCode(error);
        // Declining the browser prompt is a user choice, not an error
        if (code === "denied") return;
        showToast(DETECT_ERROR_MESSAGES[code], "error");
      });
  }, [showToast]);

  return null;
}
