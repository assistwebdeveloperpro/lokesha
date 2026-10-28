"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_SESSION_CHANGE_EVENT, getAdminToken } from "@/services/adminSession";
import type { PropertyScope } from "@/services/property.service";
import { getToken } from "@/services/session";

export type PostPropertyMode = {
  scope: PropertyScope;
  basePath: string;
  managePath: string;
  createdPath: string;
  getToken: () => string | null;
};

export const USER_POST_PROPERTY_MODE: PostPropertyMode = {
  scope: "user",
  basePath: "/post-property",
  managePath: "/user/properties/manage-properties",
  createdPath: "/user/properties/manage-properties",
  getToken,
};

export const USER_DASHBOARD_POST_PROPERTY_MODE: PostPropertyMode = {
  ...USER_POST_PROPERTY_MODE,
  basePath: "/user/properties/post-new-properties",
};

export const ADMIN_POST_PROPERTY_MODE: PostPropertyMode = {
  scope: "admin",
  basePath: "/backend/properties/post-property",
  managePath: "/backend/properties/manage-properties",
  createdPath: "/backend/properties/our-listings",
  getToken: getAdminToken,
};

const PostPropertyModeContext = createContext<PostPropertyMode>(USER_POST_PROPERTY_MODE);

export function PostPropertyModeProvider({
  mode,
  children,
}: {
  mode: PostPropertyMode;
  children: ReactNode;
}) {
  return <PostPropertyModeContext.Provider value={mode}>{children}</PostPropertyModeContext.Provider>;
}

export function usePostPropertyMode() {
  return useContext(PostPropertyModeContext);
}

function subscribeToAdminSession(onChange: () => void) {
  window.addEventListener(ADMIN_SESSION_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ADMIN_SESSION_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const subscribeToNothing = () => () => undefined;

// Reads the admin token without loading the admin profile, which the form does not need
function useAdminSessionToken() {
  const token = useSyncExternalStore(subscribeToAdminSession, getAdminToken, () => null);
  // False while rendering on the server and during hydration, true once the browser has taken over
  const isReady = useSyncExternalStore(subscribeToNothing, () => true, () => false);

  return { token, isReady };
}

// The role is null for admins; they are told apart by isAdmin
export function usePostPropertyAuth() {
  const { scope } = usePostPropertyMode();
  const userAuth = useAuth();
  const adminSession = useAdminSessionToken();

  if (scope === "admin") {
    return { role: null, token: adminSession.token, isAuthReady: adminSession.isReady, isAdmin: true };
  }

  return { role: userAuth.role, token: userAuth.token, isAuthReady: userAuth.isAuthReady, isAdmin: false };
}
