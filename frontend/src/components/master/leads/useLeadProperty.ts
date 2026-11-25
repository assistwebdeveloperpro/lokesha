"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";
import { getReviewProperty, type ReviewDetailResponse } from "@/services/propertyReview.service";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load this property. Please try again.";

export function useLeadProperty(propertyId: string) {
  const router = useRouter();
  const [detail, setDetail] = useState<ReviewDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    getReviewProperty(propertyId, token)
      .then((response) => {
        if (cancelled) return;
        setDetail(response);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          clearAdminSession();
          router.push(LOGIN_PATH);
          return;
        }
        setError(LOAD_ERROR);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId, attempt, router]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setAttempt((current) => current + 1);
  }, []);

  return { detail, isLoading, error, reload };
}
