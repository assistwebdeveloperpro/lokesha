"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  clearAllRecentSearches,
  refreshRecentSearches,
  removeRecentSearch,
  useRecentSearchesStore,
} from "@/components/landing/recent-searches/recentSearchesStore";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { getToken } from "@/services/session";
import {
  RECENT_SEARCHES_CLEAR_ERROR,
  RECENT_SEARCHES_DELETE_ERROR,
} from "./recentSearchesShared";

const LOGIN_PATH = "/login";

export function useRecentSearches() {
  const router = useRouter();
  const { showToast } = useToast();
  const { items, isLoading, hasLoaded, hasError, isUnauthorized } = useRecentSearchesStore();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!getToken() || isUnauthorized) router.push(LOGIN_PATH);
  }, [isUnauthorized, router]);

  // The store rolls back a failed delete, so only the message is left to show
  const remove = useCallback(
    async (id: string) => {
      try {
        await removeRecentSearch(id);
      } catch {
        showToast(RECENT_SEARCHES_DELETE_ERROR, "error");
      }
    },
    [showToast],
  );

  const clearAll = useCallback(async (): Promise<boolean> => {
    setIsClearing(true);
    try {
      await clearAllRecentSearches();
      return true;
    } catch {
      showToast(RECENT_SEARCHES_CLEAR_ERROR, "error");
      return false;
    } finally {
      setIsClearing(false);
    }
  }, [showToast]);

  return {
    items,
    total: items.length,
    isLoading: isLoading || !hasLoaded,
    hasError,
    isClearing,
    remove,
    clearAll,
    reload: refreshRecentSearches,
  };
}
