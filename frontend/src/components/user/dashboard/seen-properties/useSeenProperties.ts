"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { fetchSeenProperties, type SeenProperty } from "@/services/seenProperties.service";
import { getToken } from "@/services/session";
import { getLastPage, SEEN_PAGE_SIZE } from "./seenPropertiesShared";

const LOGIN_PATH = "/login";
const LOAD_ERROR = "We could not load your recently viewed properties. Please try again.";

export function useSeenProperties() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<SeenProperty[]>([]);
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
    fetchSeenProperties({ page, limit: SEEN_PAGE_SIZE }, token)
      .then((response) => {
        if (cancelled) return;
        // Properties can become unavailable, so the requested page may no longer exist
        if (response.items.length === 0 && response.total > 0 && page > 1) {
          setIsLoading(true);
          setPage(getLastPage(response.total));
          return;
        }
        setItems(response.items);
        setTotal(response.total);
        setError("");
        setIsLoading(false);
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          router.push(LOGIN_PATH);
          return;
        }
        setError(LOAD_ERROR);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, reloadToken, router]);

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
