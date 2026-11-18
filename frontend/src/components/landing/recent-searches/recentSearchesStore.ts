"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ApiError } from "@/services/apiClient";
import {
  clearRecentSearches as clearRecentSearchesRequest,
  deleteRecentSearch as deleteRecentSearchRequest,
  fetchRecentSearches,
  type RecentSearch,
} from "@/services/recentSearches.service";
import { getToken, SESSION_CHANGE_EVENT } from "@/services/session";
import {
  clearGuestSearches,
  MAX_GUEST_RECENT_SEARCHES,
  readGuestSearches,
  removeGuestSearch,
  toRecentSearch,
} from "./guestRecentSearches";

type Listener = () => void;

export type RecentSearchesState = {
  items: readonly RecentSearch[];
  isLoading: boolean;
  hasLoaded: boolean;
  hasError: boolean;
  isUnauthorized: boolean;
};

const INITIAL_STATE: RecentSearchesState = {
  items: [],
  isLoading: false,
  hasLoaded: false,
  hasError: false,
  isUnauthorized: false,
};

const listeners = new Set<Listener>();
let state: RecentSearchesState = INITIAL_STATE;
let loadedToken: string | null = null;
// Bumped on every write so an older response never overwrites newer data
let version = 0;

function setState(next: Partial<RecentSearchesState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => INITIAL_STATE;

function readGuestItems(): RecentSearch[] {
  return readGuestSearches().map(toRecentSearch);
}

// Re-reads the list of the current visitor: the account history or the browser history
export async function refreshRecentSearches(): Promise<void> {
  const token = getToken();
  const requestVersion = ++version;

  if (!token) {
    loadedToken = null;
    setState({
      items: readGuestItems(),
      isLoading: false,
      hasLoaded: true,
      hasError: false,
      isUnauthorized: false,
    });
    return;
  }

  // Cached items stay visible while the same account reloads
  if (token !== loadedToken) {
    setState({ items: [], isLoading: true, hasError: false, isUnauthorized: false });
  }

  try {
    const { items } = await fetchRecentSearches({ limit: MAX_GUEST_RECENT_SEARCHES }, token);
    if (requestVersion !== version || getToken() !== token) return;

    loadedToken = token;
    setState({ items, isLoading: false, hasLoaded: true, hasError: false, isUnauthorized: false });
  } catch (error) {
    if (requestVersion !== version) return;
    setState({
      isLoading: false,
      hasLoaded: true,
      hasError: true,
      isUnauthorized: error instanceof ApiError && error.status === 401,
    });
  }
}

// Mounted views re-read after a record; otherwise the next mount does it anyway
export function notifyRecentSearchRecorded(): void {
  if (listeners.size > 0) void refreshRecentSearches();
}

// Optimistic update; restores the previous list and rethrows when the request fails
async function mutateOptimistically(
  nextItems: (items: readonly RecentSearch[]) => readonly RecentSearch[],
  request: (token: string) => Promise<unknown>,
): Promise<void> {
  const token = getToken();
  const previous = state.items;
  version += 1;
  setState({ items: nextItems(previous), hasError: false });

  if (!token) return;

  try {
    await request(token);
  } catch (error) {
    version += 1;
    setState({ items: previous });
    throw error;
  }
}

export async function removeRecentSearch(id: string): Promise<void> {
  if (!getToken()) {
    removeGuestSearch(id);
    return refreshRecentSearches();
  }

  return mutateOptimistically(
    (items) => items.filter((item) => item.id !== id),
    (token) => deleteRecentSearchRequest(id, token),
  );
}

export async function clearAllRecentSearches(): Promise<void> {
  if (!getToken()) {
    clearGuestSearches();
    return refreshRecentSearches();
  }

  return mutateOptimistically(() => [], clearRecentSearchesRequest);
}

// Shared list for the landing strip and the user panel; reloads on mount and on login or logout
export function useRecentSearchesStore(limit: number = MAX_GUEST_RECENT_SEARCHES) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const reload = () => void refreshRecentSearches();
    reload();
    window.addEventListener(SESSION_CHANGE_EVENT, reload);

    return () => window.removeEventListener(SESSION_CHANGE_EVENT, reload);
  }, []);

  const items = useMemo(() => current.items.slice(0, limit), [current.items, limit]);

  return {
    items,
    isLoading: current.isLoading,
    hasLoaded: current.hasLoaded,
    hasError: current.hasError,
    isUnauthorized: current.isUnauthorized,
  };
}
