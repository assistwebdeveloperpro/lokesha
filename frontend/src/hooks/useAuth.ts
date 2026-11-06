"use client";

import { useCallback, useEffect, useState } from "react";
import { getMe, type Role } from "@/services/auth.service";
import { clearSession } from "@/services/session";
import { useIsClient } from "./useIsClient";
import { useSessionRole, useSessionToken } from "./useSessionStore";

export type AuthState = {
  isLoggedIn: boolean;
  token: string | null;
  role: Role | null;
  userName: string;
  displayInitial: string;
  isAuthReady: boolean;
};

const DEFAULT_USER_NAME = "User";

export function useAuth() {
  const token = useSessionToken();
  const role = useSessionRole();
  const isAuthReady = useIsClient();
  const [fetchedName, setFetchedName] = useState(DEFAULT_USER_NAME);
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadUserName() {
      try {
        const { user } = await getMe(token!);
        if (!cancelled) setFetchedName(user.name || DEFAULT_USER_NAME);
      } catch {
        if (!cancelled) setFetchedName(DEFAULT_USER_NAME);
      }
    }

    void loadUserName();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const logout = useCallback(() => clearSession(), []);

  const userName = isLoggedIn ? fetchedName : DEFAULT_USER_NAME;
  const displayInitial = userName.charAt(0).toUpperCase();

  return { isLoggedIn, token, role, userName, displayInitial, isAuthReady, logout };
}
