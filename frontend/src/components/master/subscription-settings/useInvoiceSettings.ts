"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  fetchInvoiceSettings,
  updateInvoiceSettings,
  type InvoiceSettings,
  type UpdateInvoiceSettingsInput,
} from "@/services/adminSubscription.service";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the settings. Please try again.";
const SAVE_ERROR = "We could not save the settings. Please try again.";

export type SaveSettingsResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fields?: Record<string, string> };

export function useInvoiceSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
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
    fetchInvoiceSettings(token)
      .then((response) => {
        if (cancelled) return;
        setSettings(response);
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

  const save = async (input: UpdateInvoiceSettingsInput): Promise<SaveSettingsResult> => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return { ok: false, message: SAVE_ERROR };
    }

    try {
      const { message, settings: saved } = await updateInvoiceSettings(input, token);
      setSettings(saved);
      return { ok: true, message };
    } catch (failure: unknown) {
      if (failure instanceof ApiError && failure.status === 401) {
        expireSession();
        return { ok: false, message: failure.message };
      }
      if (failure instanceof ApiError) return { ok: false, message: failure.message, fields: failure.fields };
      return { ok: false, message: SAVE_ERROR };
    }
  };

  return { settings, isLoading, error, reload, save };
}
