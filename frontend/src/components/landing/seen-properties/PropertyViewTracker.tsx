"use client";

import { useEffect, useRef } from "react";
import { trackPropertyView } from "./trackPropertyView";

type PropertyViewTrackerProps = {
  propertyId: string;
};

// Renders nothing; records one view per visit of the details page
export function PropertyViewTracker({ propertyId }: PropertyViewTrackerProps) {
  const trackedId = useRef<string | null>(null);

  useEffect(() => {
    // The ref survives re-renders and the Strict Mode double effect
    if (trackedId.current === propertyId) return;
    trackedId.current = propertyId;
    void trackPropertyView(propertyId);
  }, [propertyId]);

  return null;
}
