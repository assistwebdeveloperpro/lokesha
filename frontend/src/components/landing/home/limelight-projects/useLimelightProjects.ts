"use client";

import { useEffect, useState } from "react";
import {
  fetchAllLimelightProjects,
  type LimelightProject,
  type LimelightProjectsFilters,
} from "@/services/limelightProjects.service";
import { useLandingUrlCriteria } from "./useLandingUrlCriteria";

type LimelightResult = {
  key: string;
  projects: LimelightProject[];
};

// Limelight is only shown for residential properties on sale
const LIMELIGHT_LISTING_TYPE = "sale";
const LIMELIGHT_CATEGORY = "residential";

// Failures only hide the section, so the rest of the landing page is never affected
export function useLimelightProjects() {
  const criteria = useLandingUrlCriteria();
  const isVisible =
    criteria?.category === "residential-real-estate" &&
    criteria.transaction === "property-for-sale";
  const city = criteria?.cityName;
  const requestKey = `${LIMELIGHT_LISTING_TYPE}:${LIMELIGHT_CATEGORY}:${city ?? ""}`;
  const [result, setResult] = useState<LimelightResult | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    const controller = new AbortController();

    fetchAllLimelightProjects(
      { listingType: LIMELIGHT_LISTING_TYPE, category: LIMELIGHT_CATEGORY, city },
      controller.signal,
    )
      .then((projects) => setResult({ key: requestKey, projects }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load limelight projects", error);
        setResult({ key: requestKey, projects: [] });
      });

    return () => controller.abort();
  }, [isVisible, city, requestKey]);

  const isCurrent = result?.key === requestKey;
  const filters: LimelightProjectsFilters = {
    listingType: LIMELIGHT_LISTING_TYPE,
    category: LIMELIGHT_CATEGORY,
    city,
  };

  return {
    isVisible,
    projects: isCurrent ? result.projects : [],
    isLoading: isVisible && !isCurrent,
    filters,
  };
}
