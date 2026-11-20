"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchSubscriptionUsers, type AdminUserRow } from "@/services/adminSubscription.service";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";
import { DEFAULT_USER_FILTERS, toUsersQuery, type UserFilters } from "./usersShared";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the users. Please try again.";

export function useSubscriptionUsers() {
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
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
    fetchSubscriptionUsers(toUsersQuery(filters, page), token)
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setTotal(response.total);
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
  }, [filters, page, reloadToken, expireSession, router]);

  const applyFilters = (next: UserFilters) => {
    setIsLoading(true);
    setPage(1);
    setFilters(next);
  };

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const refresh = useCallback(() => setReloadToken((current) => current + 1), []);

  const reload = () => {
    setIsLoading(true);
    refresh();
  };

  return { items, total, page, filters, isLoading, error, applyFilters, changePage, reload, refresh };
}
