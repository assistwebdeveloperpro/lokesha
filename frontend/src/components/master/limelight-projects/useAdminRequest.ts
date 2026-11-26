"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";
import { ADMIN_LOGIN_PATH } from "./limelightShared";

// Resolves undefined once the session is gone, since empty responses already resolve null
export function useAdminRequest() {
  const router = useRouter();

  return useCallback(
    async <TResult>(request: (token: string) => Promise<TResult>): Promise<TResult | undefined> => {
      const token = getAdminToken();
      if (!token) {
        router.push(ADMIN_LOGIN_PATH);
        return undefined;
      }

      try {
        return await request(token);
      } catch (failure: unknown) {
        if (failure instanceof ApiError && failure.status === 401) {
          clearAdminSession();
          router.push(ADMIN_LOGIN_PATH);
          return undefined;
        }
        throw failure;
      }
    },
    [router],
  );
}
