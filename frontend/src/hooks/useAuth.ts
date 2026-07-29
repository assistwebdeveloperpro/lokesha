"use client";

import { useCallback, useEffect, useState } from "react";
import { getMe, type Role } from "@/services/auth.service";
import {
  clearSession,
  getRole,
  getToken,
  SESSION_CHANGE_EVENT,
} from "@/services/session";

export type AuthState = {
  isLoggedIn: boolean;
  token: string | null;
  role: Role | null;
  userName: string;
  displayInitial: string;
};

type SessionState = {
  isLoggedIn: boolean;
  token: string | null;
  role: Role | null;
};

const INITIAL_SESSION: SessionState = {
  isLoggedIn: false,
  token: null,
  role: null,
};

function readSessionState(): SessionState {
  const token = getToken();
  const role = getRole();

  return {
    isLoggedIn: Boolean(token),
    token,
    role,
  };
}

export function useAuth() {
  // Start with a stable guest state so SSR and the first client render match.
  // Session is read from localStorage only after mount; name always comes from API.
  const [session, setSession] = useState<SessionState>(INITIAL_SESSION);
  const [userName, setUserName] = useState("User");

  const refresh = useCallback(() => {
    setSession(readSessionState());
  }, []);

  useEffect(() => {
    refresh();

    const handleSessionChange = () => refresh();
    window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
    window.addEventListener("storage", handleSessionChange);

    return () => {
      window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
      window.removeEventListener("storage", handleSessionChange);
    };
  }, [refresh]);

  useEffect(() => {
    if (!session.isLoggedIn || !session.token) {
      setUserName("User");
      return;
    }

    let cancelled = false;

    async function loadUserName() {
      try {
        const { user } = await getMe(session.token!);
        if (cancelled) return;
        setUserName(user.name || "User");
      } catch {
        if (!cancelled) {
          setUserName("User");
        }
      }
    }

    void loadUserName();

    return () => {
      cancelled = true;
    };
  }, [session.isLoggedIn, session.token]);

  const logout = useCallback(() => {
    clearSession();
    refresh();
  }, [refresh]);

  const displayInitial = userName.charAt(0).toUpperCase();

  return {
    ...session,
    userName,
    displayInitial,
    logout,
    refresh,
  };
}
