"use client";

import { useEffect, useState } from "react";
import {
  fetchAllLimelightProjects,
  type LimelightProject,
  type LimelightProjectsFilters,
} from "@/services/limelightProjects.service";
import { CATEGORY_ID_BY_SLUG } from "@/lib/property-search-url/searchUrl.config";
import { useLandingUrlCriteria } from "./useLandingUrlCriteria";

type LimelightResult = {
  key: string;
  projects: LimelightProject[];
};

// Failures only hide the section, so the rest of the landing page is never affected
export function useLimelightProjects() {
  const criteria = useLandingUrlCriteria();
  const listingType: LimelightProjectsFilters["listingType"] =
    criteria?.transaction === "property-for-sale"
      ? "sale"
      : criteria
        ? "rent-lease"
        : undefined;
  const category = criteria ? CATEGORY_ID_BY_SLUG[criteria.category] : undefined;
  const city = criteria?.cityName;
  const requestKey = `${listingType ?? ""}:${category ?? ""}:${city ?? ""}`;
  const [result, setResult] = useState<LimelightResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchAllLimelightProjects({ listingType, category, city }, controller.signal)
      .then((projects) => setResult({ key: requestKey, projects }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load limelight projects", error);
        setResult({ key: requestKey, projects: [] });
      });

    return () => controller.abort();
  }, [listingType, category, city, requestKey]);

  const isCurrent = result?.key === requestKey;
  return {
    projects: isCurrent ? result.projects : [],
    isLoading: !isCurrent,
    filters: { listingType, category, city },
  };
}
