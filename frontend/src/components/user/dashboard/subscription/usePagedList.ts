"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import type { PagedResponse, PagingQuery } from "@/services/userSubscription.service";
import { SUBSCRIPTION_PAGE_SIZE } from "./subscriptionShared";

const LOGIN_PATH = "/login";

type Fetcher<TItem> = (query: PagingQuery, token: string) => Promise<PagedResponse<TItem>>;

export function usePagedList<TItem>(fetcher: Fetcher<TItem>, loadError: string) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetcher({ page, limit: SUBSCRIPTION_PAGE_SIZE }, token)
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setTotal(response.total);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
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
  }, [fetcher, loadError, page, reloadToken, router]);

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
