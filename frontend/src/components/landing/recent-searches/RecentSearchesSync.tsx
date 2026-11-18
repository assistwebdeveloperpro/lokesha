"use client";

import { useEffect } from "react";
import { getToken, SESSION_CHANGE_EVENT } from "@/services/session";
import { syncGuestRecentSearches } from "./syncGuestRecentSearches";

function syncWhenLoggedIn() {
  const token = getToken();
  if (token) void syncGuestRecentSearches(token);
}

// Renders nothing; merges guest searches into the account after any login
export function RecentSearchesSync() {
  useEffect(() => {
    syncWhenLoggedIn();
    window.addEventListener(SESSION_CHANGE_EVENT, syncWhenLoggedIn);

    return () => window.removeEventListener(SESSION_CHANGE_EVENT, syncWhenLoggedIn);
  }, []);

  return null;
}
