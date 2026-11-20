"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchReportsOverview, type ReportsOverview } from "@/services/adminSubscription.service";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the report. Please try again.";

export type ReportRange = { from: string; to: string };

export const ALL_TIME: ReportRange = { from: "", to: "" };

export function useSubscriptionReports() {
  const router = useRouter();
  const [range, setRange] = useState<ReportRange>(ALL_TIME);
  const [reloadToken, setReloadToken] = useState(0);
  const [overview, setOverview] = useState<ReportsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const expireSession = useCallback(() => {
    clearAdminSession();
    router.push(LOGIN_PATH);
  }, [router]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchReportsOverview({ from: range.from || undefined, to: range.to || undefined }, token)
      .then((response) => {
        if (cancelled) return;
        setOverview(response);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          expireSession();
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
  }, [range, reloadToken, expireSession, router]);

  const applyRange = (next: ReportRange) => {
    setIsLoading(true);
    setRange(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  return { range, overview, isLoading, error, applyRange, reload };
}
