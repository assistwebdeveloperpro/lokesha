"use client";

import { useEffect } from "react";
import { getToken, SESSION_CHANGE_EVENT } from "@/services/session";
import { syncGuestSeenHistory } from "./syncGuestSeenHistory";

function syncWhenLoggedIn() {
  const token = getToken();
  if (token) void syncGuestSeenHistory(token);
}

// Renders nothing; merges guest history into the account after any login
export function SeenHistorySync() {
  useEffect(() => {
    syncWhenLoggedIn();
    window.addEventListener(SESSION_CHANGE_EVENT, syncWhenLoggedIn);

    return () => window.removeEventListener(SESSION_CHANGE_EVENT, syncWhenLoggedIn);
  }, []);

  return null;
}
