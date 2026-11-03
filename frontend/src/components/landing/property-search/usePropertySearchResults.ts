"use client";

import { useCallback, useEffect, useState } from "react";
import {
  searchProperties,
  type PublicSearchResponse,
} from "@/services/propertySearch.service";

type SearchResult = {
  key: string;
  data: PublicSearchResponse | null;
  error: string | null;
};

const ERROR_MESSAGE = "Unable to load properties. Please try again.";

// Loads one page of results whenever the query changes; the previous page stays until the next one arrives
export function usePropertySearchResults(query: string) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<SearchResult | null>(null);
  const requestKey = `${attempt}:${query}`;

  useEffect(() => {
    const controller = new AbortController();

    searchProperties(query, controller.signal)
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
  }, [query, requestKey]);

  const isCurrent = result?.key === requestKey;
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return {
    data: result?.data ?? null,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
    retry,
  };
}
