"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getPropertyById, type PropertyDetailResponse } from "@/services/property.service";
import { usePostPropertyMode } from "../config/postPropertyMode";

type LoadResult = { id: string; detail: PropertyDetailResponse | null; error: string };

type UseEditPropertyResult = {
  detail: PropertyDetailResponse | null;
  isLoading: boolean;
  error: string;
};

const NOT_FOUND_MESSAGE = "This property could not be found.";
const LOGIN_MESSAGE = "Please log in to edit your property.";

function toErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.status === 404 ? NOT_FOUND_MESSAGE : error.message;
  }
  return "Something went wrong. Please try again.";
}

// Loads the property being edited; only the owner can read it, others get a not found
export function useEditProperty(editId: string | null): UseEditPropertyResult {
  const { scope, getToken } = usePostPropertyMode();
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    if (!editId) return;

    let cancelled = false;
    const token = getToken();
    const request = token
      ? getPropertyById(editId, token, scope)
      : Promise.reject(new ApiError(LOGIN_MESSAGE, 401));

    request
      .then((detail) => {
        if (!cancelled) setResult({ id: editId, detail, error: "" });
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ id: editId, detail: null, error: toErrorMessage(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [editId, scope, getToken]);

  const current = editId && result?.id === editId ? result : null;

  return {
    detail: current?.detail ?? null,
    isLoading: Boolean(editId) && !current,
    error: current?.error ?? "",
  };
}
