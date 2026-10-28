"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import {
  closeProperty,
  deleteProperty,
  getMyProperties,
  submitProperty,
  type PropertyListItem,
} from "@/services/property.service";
import { getToken } from "@/services/session";
import { PAGE_SIZE, type ManageListFilter, type StatusAction } from "./managePropertiesShared";

const LOAD_ERROR = "We could not load your properties. Please try again.";

const STATUS_ACTION_MESSAGES: Record<StatusAction, string> = {
  submit: "Your property has been submitted for review.",
  close: "Your listing has been closed.",
  reopen: "Your listing is live again.",
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? (error.errors?.[0] ?? error.message) : "Something went wrong. Please try again.";
}

const DEFAULT_STATUS: ManageListFilter = "all";

export function useManageProperties() {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<ManageListFilter>(DEFAULT_STATUS);
  const [reloadToken, setReloadToken] = useState(0);
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PropertyListItem | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<PropertyListItem | null>(null);
  const [pendingListingAction, setPendingListingAction] = useState<{
    property: PropertyListItem;
    action: "close" | "reopen";
  } | null>(null);
  const nextPage = useRef(2);

  const handleFailure = useCallback(
    (failure: unknown) => {
      if (failure instanceof ApiError && failure.status === 401) {
        router.push("/login");
        return;
      }
      showToast(getErrorMessage(failure), "error");
    },
    [router, showToast],
  );

  const loadPage = useCallback(
    async (page: number, listStatus: ManageListFilter) => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return null;
      }
      return getMyProperties(
        { page, limit: PAGE_SIZE, status: listStatus === "all" ? undefined : listStatus },
        token,
      );
    },
    [router],
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    let cancelled = false;
    loadPage(1, status)
      .then((response) => {
        if (cancelled || !response) return;
        setProperties(response.items);
        setTotal(response.total);
        setError("");
        nextPage.current = 2;
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          router.push("/login");
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
  }, [status, reloadToken, loadPage, router]);

  const changeStatus = (next: ManageListFilter) => {
    if (next === status) return;
    setIsLoading(true);
    setStatus(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  const applyStatusChange = (id: string, nextStatus: PropertyListItem["status"]) => {
    if (status !== "all" && nextStatus !== status) {
      setProperties((current) => current.filter((item) => item.id !== id));
      setTotal((current) => Math.max(0, current - 1));
      return;
    }
    setProperties((current) =>
      current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)),
    );
  };

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await loadPage(nextPage.current, status);
      if (!response) return;
      // Deleting or posting meanwhile can shift pages, so duplicates are dropped
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

  const confirmDelete = async () => {
    const token = getToken();
    if (!pendingDelete || !token) return;

    const target = pendingDelete;
    setBusyId(target.id);
    try {
      await deleteProperty(target.id, token);
      setProperties((current) => current.filter((item) => item.id !== target.id));
      setTotal((current) => Math.max(0, current - 1));
      setPendingDelete(null);
      showToast("Property deleted successfully.", "success");
    } catch (failure) {
      handleFailure(failure);
    } finally {
      setBusyId(null);
    }
  };

  const runStatusAction = (property: PropertyListItem, action: StatusAction) => {
    if (action === "submit") {
      setPendingSubmit(property);
      return;
    }
    if (action === "close" || action === "reopen") {
      setPendingListingAction({ property, action });
    }
  };

  const confirmListingAction = async () => {
    const token = getToken();
    if (!pendingListingAction || !token) return;

    const { property, action } = pendingListingAction;
    setBusyId(property.id);
    try {
      const result =
        action === "close" ? await closeProperty(property.id, token) : await submitProperty(property.id, token);
      applyStatusChange(property.id, result.status);
      setPendingListingAction(null);
      const message =
        action === "reopen" && result.status === "pending"
          ? STATUS_ACTION_MESSAGES.submit
          : STATUS_ACTION_MESSAGES[action];
      showToast(message, "success");
    } catch (failure) {
      handleFailure(failure);
    } finally {
      setBusyId(null);
    }
  };

  const confirmSubmit = async () => {
    const token = getToken();
    if (!pendingSubmit || !token) return;

    const target = pendingSubmit;
    setBusyId(target.id);
    try {
      const result = await submitProperty(target.id, token);
      applyStatusChange(target.id, result.status);
      setPendingSubmit(null);
      showToast(STATUS_ACTION_MESSAGES.submit, "success");
    } catch (failure) {
      handleFailure(failure);
    } finally {
      setBusyId(null);
    }
  };

  return {
    status,
    properties,
    total,
    isLoading,
    isLoadingMore,
    error,
    busyId,
    pendingDelete,
    pendingSubmit,
    pendingListingAction,
    hasMore: properties.length < total,
    changeStatus,
    reload,
    loadMore,
    requestDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    cancelSubmit: () => setPendingSubmit(null),
    confirmSubmit,
    cancelListingAction: () => setPendingListingAction(null),
    confirmListingAction,
    runStatusAction,
  };
}
