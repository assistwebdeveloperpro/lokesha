"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";

const LOGIN_PATH = "/backend/login";
const GENERIC_ERROR = "Something went wrong. Please try again.";

// Runs one admin request with the login token and keeps its error, field errors and busy state
export function useAdminActionRunner() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearError = () => {
    setError("");
    setFieldErrors({});
  };

  const run = async <TResult>(action: (token: string) => Promise<TResult>): Promise<TResult | null> => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return null;
    }

    setIsRunning(true);
    clearError();
    try {
      return await action(token);
    } catch (failure: unknown) {
      if (failure instanceof ApiError && failure.status === 401) {
        clearAdminSession();
        router.push(LOGIN_PATH);
        return null;
      }
      if (failure instanceof ApiError) {
        setError(failure.message);
        setFieldErrors(failure.fields ?? {});
      } else {
        setError(GENERIC_ERROR);
      }
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  return { run, isRunning, error, fieldErrors, clearError };
}
