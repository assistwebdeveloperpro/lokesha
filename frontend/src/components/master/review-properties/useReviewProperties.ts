"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";
import {
  approveReviewProperty,
  getReviewProperties,
  rejectReviewProperty,
  type ReviewListItem,
  type ReviewStatus,
} from "@/services/propertyReview.service";
import { PAGE_SIZE } from "./reviewPropertiesShared";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the properties. Please try again.";

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? (error.errors?.[0] ?? error.message) : "Something went wrong. Please try again.";
}

export function useReviewProperties() {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const [reloadToken, setReloadToken] = useState(0);
  const [properties, setProperties] = useState<ReviewListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<ReviewListItem | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const nextPage = useRef(2);

  const expireSession = useCallback(() => {
    clearAdminSession();
    router.push(LOGIN_PATH);
  }, [router]);

  const handleFailure = useCallback(
    (failure: unknown) => {
      if (failure instanceof ApiError && failure.status === 401) {
        expireSession();
        return;
      }
      showToast(getErrorMessage(failure), "error");
    },
    [expireSession, showToast],
  );

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    getReviewProperties({ page: 1, limit: PAGE_SIZE, status }, token)
      .then((response) => {
        if (cancelled) return;
        setProperties(response.items);
        setTotal(response.total);
        setError("");
        nextPage.current = 2;
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
  }, [status, reloadToken, expireSession, router]);

  const changeStatus = (next: ReviewStatus) => {
    if (next === status) return;
    setIsLoading(true);
    setStatus(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  const loadMore = async () => {
    const token = getAdminToken();
    if (!token || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await getReviewProperties({ page: nextPage.current, limit: PAGE_SIZE, status }, token);
      // A decision meanwhile can shift pages, so duplicates are dropped
      setProperties((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...response.items.filter((item) => !known.has(item.id))];
      });
      setTotal(response.total);
      nextPage.current += 1;
    } catch (failure) {
      handleFailure(failure);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // The decided listing leaves the current tab, which only shows one status
  const removeFromList = (id: string) => {
    setProperties((current) => current.filter((item) => item.id !== id));
    setTotal((current) => Math.max(0, current - 1));
  };

  const decide = async (id: string, action: (token: string) => Promise<unknown>, successMessage: string) => {
    const token = getAdminToken();
    if (!token) {
      expireSession();
      return false;
    }

    setBusyId(id);
    try {
      await action(token);
      removeFromList(id);
      showToast(successMessage, "success");
      return true;
    } catch (failure) {
      handleFailure(failure);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const approve = (property: ReviewListItem) =>
    decide(property.id, (token) => approveReviewProperty(property.id, token), "Property approved and published.");

  const confirmReject = async (reason: string) => {
    if (!rejecting) return;

    const isRejected = await decide(
      rejecting.id,
      (token) => rejectReviewProperty(rejecting.id, reason, token),
      "Property rejected. The owner can see the reason.",
    );
    if (isRejected) setRejecting(null);
  };

  return {
    status,
    properties,
    total,
    isLoading,
    isLoadingMore,
    error,
    busyId,
    rejecting,
    viewingId,
    hasMore: properties.length < total,
    changeStatus,
    reload,
    loadMore,
    approve,
    requestReject: setRejecting,
    cancelReject: () => setRejecting(null),
    confirmReject,
    viewProperty: setViewingId,
    closeView: () => setViewingId(null),
  };
}
