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
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const notifiedId = useRef<string | null>(null);

  // The focused property is resolved once its list has loaded, and again for each new focus
  if (!focusId && resolvedId !== null) {
    setResolvedId(null);
  } else if (focusId && !isLoading && resolvedId !== focusId) {
    setResolvedId(focusId);
    if (isListed) setHighlightedId(focusId);
  }

  useEffect(() => {
    if (!resolvedId) {
      notifiedId.current = null;
      return;
    }
    if (notifiedId.current === resolvedId) return;

    notifiedId.current = resolvedId;
    onResolved(isListed);
  }, [resolvedId, isListed, onResolved]);

  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  return highlightedId;
}
