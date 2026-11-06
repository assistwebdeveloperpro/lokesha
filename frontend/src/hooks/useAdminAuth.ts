"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminMe } from "@/services/adminAuth.service";
import { clearAdminSession } from "@/services/adminSession";
import { useIsClient } from "./useIsClient";
import { useAdminSessionToken } from "./useSessionStore";

const DEFAULT_ADMIN_NAME = "Admin";

export function useAdminAuth() {
  const token = useAdminSessionToken();
  const isAuthReady = useIsClient();
  const [fetchedName, setFetchedName] = useState(DEFAULT_ADMIN_NAME);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadAdminName() {
      try {
        const { admin } = await getAdminMe(token!);
        if (!cancelled) setFetchedName(admin.name || DEFAULT_ADMIN_NAME);
      } catch {
        // Expired or invalid token ends the session
        if (!cancelled) clearAdminSession();
      }
    }

    void loadAdminName();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const logout = useCallback(() => clearAdminSession(), []);

  return {
    isLoggedIn: Boolean(token),
    token,
    adminName: token ? fetchedName : DEFAULT_ADMIN_NAME,
    isAuthReady,
    logout,
  };
}
