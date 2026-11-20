"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchSubscriptionUserDetail, type AdminUserDetail } from "@/services/adminSubscription.service";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load this user. Please try again.";

export function useUserDetail(userId: string) {
  const router = useRouter();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Changes after every admin action, so the lists inside the detail load again
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchSubscriptionUserDetail(userId, token)
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
  }, [userId, version, router]);

  // Keeps the detail on screen while the new numbers come in
  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  const reload = () => {
    setIsLoading(true);
    refresh();
  };

  return { detail, isLoading, error, version, refresh, reload };
}
