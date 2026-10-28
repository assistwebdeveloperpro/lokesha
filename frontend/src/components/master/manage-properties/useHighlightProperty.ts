"use client";

import { useEffect, useRef, useState } from "react";

const HIGHLIGHT_DURATION_MS = 8000;

type UseHighlightPropertyOptions = {
  focusId: string | null;
  isLoading: boolean;
  isListed: boolean;
  onResolved: (isListed: boolean) => void;
};

export function useHighlightProperty({ focusId, isLoading, isListed, onResolved }: UseHighlightPropertyOptions) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const resolvedId = useRef<string | null>(null);

  useEffect(() => {
    if (!focusId) {
      resolvedId.current = null;
      return;
    }
    if (isLoading || resolvedId.current === focusId) return;

    resolvedId.current = focusId;
    if (isListed) setHighlightedId(focusId);
    onResolved(isListed);
  }, [focusId, isLoading, isListed, onResolved]);

  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  return highlightedId;
}
