"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getPropertyShare, type PropertyShare } from "@/services/propertyShare.service";

const LOAD_ERROR = "We could not load this property. Please try again.";
const UNAVAILABLE_ERROR = "This property is no longer available to share.";

type PreviewState = {
  share: PropertyShare | null;
  error: string;
  isLoading: boolean;
};

export function useSharePreview(propertyId: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PreviewState>({ share: null, error: "", isLoading: true });

  useEffect(() => {
    let cancelled = false;

    getPropertyShare(propertyId)
      .then((share) => {
        if (!cancelled) setState({ share, error: "", isLoading: false });
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        const isMissing = failure instanceof ApiError && failure.status === 404;
        setState({ share: null, error: isMissing ? UNAVAILABLE_ERROR : LOAD_ERROR, isLoading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId, attempt]);

  const retry = () => {
    setState({ share: null, error: "", isLoading: true });
    setAttempt((current) => current + 1);
  };

  return { ...state, retry };
}
