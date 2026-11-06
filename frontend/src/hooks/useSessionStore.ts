"use client";

import { useSyncExternalStore } from "react";
import { ADMIN_SESSION_CHANGE_EVENT, getAdminToken } from "@/services/adminSession";
import type { Role } from "@/services/auth.service";
import { getRole, getToken, SESSION_CHANGE_EVENT } from "@/services/session";

const subscribeTo = (eventName: string) => (onChange: () => void) => {
  window.addEventListener(eventName, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(eventName, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const subscribeUser = subscribeTo(SESSION_CHANGE_EVENT);
const subscribeAdmin = subscribeTo(ADMIN_SESSION_CHANGE_EVENT);
const noSession = () => null;

// The session lives in localStorage, so it is read as an external store
export const useSessionToken = () => useSyncExternalStore(subscribeUser, getToken, noSession);
export const useSessionRole = () => useSyncExternalStore(subscribeUser, getRole, noSession) as Role | null;
export const useAdminSessionToken = () => useSyncExternalStore(subscribeAdmin, getAdminToken, noSession);
