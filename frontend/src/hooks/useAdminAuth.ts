"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminMe } from "@/services/adminAuth.service";
import {
  ADMIN_SESSION_CHANGE_EVENT,
  clearAdminSession,
  getAdminToken,
} from "@/services/adminSession";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [isAuthReady, setIsAuthReady] = useState(false);

  const refresh = useCallback(() => {
    setToken(getAdminToken());
  }, []);

  useEffect(() => {
    refresh();
    setIsAuthReady(true);

    window.addEventListener(ADMIN_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(ADMIN_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (!token) {
      setAdminName("Admin");
      return;
    }

    let cancelled = false;

    async function loadAdminName() {
      try {
        const { admin } = await getAdminMe(token!);
        if (!cancelled) setAdminName(admin.name || "Admin");
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

  const logout = useCallback(() => {
    clearAdminSession();
  }, []);

  return {
    isLoggedIn: Boolean(token),
    token,
    adminName,
    isAuthReady,
    logout,
  };
}
