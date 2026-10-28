"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { PAGE_SIZE, type ManageListStatus } from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import {
  getManageProperties,
  type ManageListedBy,
  type ManageListItem,
  type ManageListQuery,
  type ManageOwner,
} from "@/services/adminManageProperties.service";
import { ApiError } from "@/services/apiClient";
import { closeProperty, deleteProperty, submitProperty } from "@/services/property.service";
import type { ListingModalAction } from "@/components/user/dashboard/manage-properties/ListingActionModal";

export type ListingStatusFilter = ManageListStatus | "all";

type PropertyViewTarget = Pick<ManageListItem, "id"> & { owner?: ManageOwner };

type UseManagePropertiesOptions = {
  source?: ManageListedBy["source"];
  initialStatus?: ListingStatusFilter;
  focusPropertyId?: string | null;
  onFocusPropertyOpened?: () => void;
};

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the properties. Please try again.";

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? (error.errors?.[0] ?? error.message) : "Something went wrong. Please try again.";
}

function toListQuery(page: number, status: ListingStatusFilter, source?: ManageListedBy["source"]): ManageListQuery {
  return {
    page,
    limit: PAGE_SIZE,
    ...(status === "all" ? {} : { status }),
    ...(source ? { source } : {}),
  };
}

export function useManageProperties({
  source,
  initialStatus = "published",
  focusPropertyId = null,
  onFocusPropertyOpened,
}: UseManagePropertiesOptions = {}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<ListingStatusFilter>(initialStatus);
  const [reloadToken, setReloadToken] = useState(0);
  const [properties, setProperties] = useState<ManageListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ManageListItem | null>(null);
  const [pendingListingAction, setPendingListingAction] = useState<{
    property: ManageListItem;
    action: ListingModalAction;
  } | null>(null);
  const [viewing, setViewing] = useState<PropertyViewTarget | null>(null);
  const nextPage = useRef(2);
  const openedFocusPropertyId = useRef<string | null>(null);

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
    getManageProperties(toListQuery(1, status, source), token)
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
  }, [status, source, reloadToken, expireSession, router]);

  useEffect(() => {
    if (!focusPropertyId) {
      openedFocusPropertyId.current = null;
      return;
    }
    if (isLoading || openedFocusPropertyId.current === focusPropertyId) return;

    openedFocusPropertyId.current = focusPropertyId;
    const match = properties.find((item) => item.id === focusPropertyId);
    setViewing({ id: focusPropertyId, owner: match?.owner });
    onFocusPropertyOpened?.();
  }, [focusPropertyId, isLoading, properties, onFocusPropertyOpened]);

  const changeStatus = (next: ListingStatusFilter) => {
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
      const response = await getManageProperties(toListQuery(nextPage.current, status, source), token);
      // A status change meanwhile can shift pages, so duplicates are dropped
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

  // The changed listing leaves the current tab, which only shows one status
  const removeFromList = (id: string) => {
    setProperties((current) => current.filter((item) => item.id !== id));
    setTotal((current) => Math.max(0, current - 1));
  };

  const changeListingStatus = async (
    property: ManageListItem,
    action: (token: string) => Promise<unknown>,
    successMessage: string,
  ) => {
    const token = getAdminToken();
    if (!token) {
      expireSession();
      return;
    }

    setBusyId(property.id);
    try {
      await action(token);
      removeFromList(property.id);
      showToast(successMessage, "success");
    } catch (failure) {
      handleFailure(failure);
    } finally {
      setBusyId(null);
    }
  };

  const publish = (property: ManageListItem) =>
    changeListingStatus(property, (token) => submitProperty(property.id, token, "admin"), "Property published.");

  const confirmListingAction = async () => {
    if (!pendingListingAction) return;

    const { property, action } = pendingListingAction;
    await (action === "close"
      ? changeListingStatus(property, (token) => closeProperty(property.id, token, "admin"), "Property closed.")
      : publish(property));
    setPendingListingAction(null);
  };

  const confirmDelete = async () => {
    const token = getAdminToken();
    if (!pendingDelete) return;
    if (!token) {
      expireSession();
      return;
    }

    const target = pendingDelete;
    setBusyId(target.id);
    try {
      await deleteProperty(target.id, token, "admin");
      removeFromList(target.id);
      setPendingDelete(null);
      showToast("Property deleted successfully.", "success");
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
    hasMore: properties.length < total,
    changeStatus,
    reload,
    loadMore,
    viewing,
    pendingDelete,
    pendingListingAction,
    viewProperty: (property: ManageListItem) => setViewing({ id: property.id, owner: property.owner }),
    closeView: () => setViewing(null),
    publish,
    requestDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    requestListingAction: (property: ManageListItem, action: ListingModalAction) =>
      setPendingListingAction({ property, action }),
    cancelListingAction: () => setPendingListingAction(null),
    confirmListingAction,
  };
}
