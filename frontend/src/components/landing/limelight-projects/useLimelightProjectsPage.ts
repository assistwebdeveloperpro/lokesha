"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchLimelightProjects,
  type LimelightProjectsFilters,
  type LimelightProjectsResponse,
} from "@/services/limelightProjects.service";

export type FetchProjectsPage = typeof fetchLimelightProjects;

type PageResult = {
  key: string;
  data: LimelightProjectsResponse | null;
  error: string | null;
};

const ERROR_MESSAGE = "Unable to load projects. Please try again.";

// Loads one page whenever the page changes; the previous page stays until the next one arrives
export function useLimelightProjectsPage(
  page: number,
  pageSize: number,
  { listingType, category, city }: LimelightProjectsFilters,
  fetchPage: FetchProjectsPage = fetchLimelightProjects,
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<PageResult | null>(null);
  const requestKey = `${attempt}:${page}:${listingType ?? ""}:${category ?? ""}:${city ?? ""}`;

  useEffect(() => {
    const controller = new AbortController();

    fetchPage({ page, pageSize, listingType, category, city }, controller.signal)
      .then((data) => setResult({ key: requestKey, data, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          key: requestKey,
          data: null,
          error: error instanceof Error ? error.message : ERROR_MESSAGE,
        });
      });

    return () => controller.abort();
  }, [fetchPage, page, pageSize, listingType, category, city, requestKey]);

  const isCurrent = result?.key === requestKey;
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return {
    data: result?.data ?? null,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
    retry,
  };
}
