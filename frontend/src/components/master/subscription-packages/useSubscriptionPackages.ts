"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import {
  fetchSubscriptionPackages,
  updateSubscriptionPackage,
  type SubscriptionPackage,
  type UpdateSubscriptionPackageInput,
} from "@/services/adminSubscription.service";
import { ApiError } from "@/services/apiClient";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the packages. Please try again.";
const SAVE_ERROR = "We could not save the package. Please try again.";

export type SavePackageResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fields?: Record<string, string> };

export function useSubscriptionPackages() {
  const router = useRouter();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const expireSession = useCallback(() => {
    clearAdminSession();
    router.push(LOGIN_PATH);
  }, [router]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchSubscriptionPackages(token)
      .then((response) => {
        if (cancelled) return;
        setPackages(response.items);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          expireSession();
          return;
        }
        setError(LOAD_ERROR);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, expireSession, router]);

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  const savePackage = async (id: string, input: UpdateSubscriptionPackageInput): Promise<SavePackageResult> => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return { ok: false, message: SAVE_ERROR };
    }

    try {
      const { message, package: updated } = await updateSubscriptionPackage(id, input, token);
      setPackages((current) => current.map((item) => (item.id === id ? updated : item)));
      return { ok: true, message };
    } catch (failure: unknown) {
      if (failure instanceof ApiError && failure.status === 401) {
        expireSession();
        return { ok: false, message: failure.message };
      }
      if (failure instanceof ApiError) {
        return { ok: false, message: failure.message, fields: failure.fields };
      }
      return { ok: false, message: SAVE_ERROR };
    }
  };

  return { packages, isLoading, error, reload, savePackage };
}
