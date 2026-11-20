"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SUBSCRIPTION_PAGE_SIZE } from "@/components/user/dashboard/subscription/subscriptionShared";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";
import type { PagedResponse, PagingQuery } from "@/services/userSubscription.service";

const LOGIN_PATH = "/backend/login";

type Fetcher<TItem> = (userId: string, query: PagingQuery, token: string) => Promise<PagedResponse<TItem>>;

// One paged list of a user's detail; the fetcher must be a stable module-level function
// refreshKey makes the list load again after an admin action changed the data
export function useAdminPagedList<TItem>(fetcher: Fetcher<TItem>, userId: string, loadError: string, refreshKey: number) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetcher(userId, { page, limit: SUBSCRIPTION_PAGE_SIZE }, token)
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setTotal(response.total);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          clearAdminSession();
          router.push(LOGIN_PATH);
          return;
        }
        setError(loadError);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, userId, loadError, page, reloadToken, refreshKey, router]);

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  return { page, items, total, isLoading, error, changePage, reload };
}
