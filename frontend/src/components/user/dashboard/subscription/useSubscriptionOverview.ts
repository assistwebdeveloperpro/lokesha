"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import {
  fetchPackages,
  fetchSubscriptionOverview,
  type PurchasablePackage,
  type SubscriptionOverview,
} from "@/services/userSubscription.service";

const LOGIN_PATH = "/login";
const LOAD_ERROR = "We could not load your subscription. Please try again.";

export function useSubscriptionOverview() {
  const router = useRouter();
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [standardPackage, setStandardPackage] = useState<PurchasablePackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    Promise.all([fetchSubscriptionOverview(token), fetchPackages(token)])
      .then(([overviewResponse, packagesResponse]) => {
        if (cancelled) return;
        setOverview(overviewResponse);
        setStandardPackage(packagesResponse.items.find((item) => item.code === "standard") ?? null);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
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
  }, [reloadToken, router]);

  // Keeps the page on screen while the numbers refresh after a payment
  const refresh = useCallback(() => setReloadToken((current) => current + 1), []);

  const reload = () => {
    setIsLoading(true);
    refresh();
  };

  return { overview, standardPackage, isLoading, error, reload, refresh };
}
