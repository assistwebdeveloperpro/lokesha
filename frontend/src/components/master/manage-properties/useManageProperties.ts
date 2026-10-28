"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import type { ListedByRoleFilter } from "./managePropertiesFilterOptions";
import { ApiError } from "@/services/apiClient";
import { closeProperty, deleteProperty, submitProperty } from "@/services/property.service";
import type { ListingModalAction } from "@/components/user/dashboard/manage-properties/ListingActionModal";

export type ListingStatusFilter = ManageListStatus | "all";

export type ManagePropertyFilters = {
  projectName: string;
  role: ListedByRoleFilter;
  status: ListingStatusFilter;
};

type PropertyViewTarget = Pick<ManageListItem, "id"> & { owner?: ManageOwner };

type UseManagePropertiesOptions = {
  source?: ManageListedBy["source"];
  initialStatus?: ListingStatusFilter;
};

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the properties. Please try again.";

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? (error.errors?.[0] ?? error.message) : "Something went wrong. Please try again.";
}

function toListQuery(
  page: number,
  filters: ManagePropertyFilters,
  source?: ManageListedBy["source"],
): ManageListQuery {
  const projectName = filters.projectName.trim();
  return {
    page,
    limit: PAGE_SIZE,
    ...(filters.status === "all" ? {} : { status: filters.status }),
    ...(source ? { source } : {}),
    ...(projectName ? { projectName } : {}),
    ...(filters.role ? { role: filters.role } : {}),
  };
}

export function useManageProperties({ source, initialStatus = "published" }: UseManagePropertiesOptions = {}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<ManagePropertyFilters>({
    projectName: "",
    role: "",
    status: initialStatus,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [properties, setProperties] = useState<ManageListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ManageListItem | null>(null);
  const [pendingListingAction, setPendingListingAction] = useState<{
    property: ManageListItem;
    action: ListingModalAction;
  } | null>(null);
  const [viewing, setViewing] = useState<PropertyViewTarget | null>(null);

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
    let movedPage = false;
    getManageProperties(toListQuery(page, filters, source), token)
      .then((response) => {
        if (cancelled) return;
        const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
        if (page > lastPage) {
          movedPage = true;
          setPage(lastPage);
          return;
        }
        setProperties(response.items);
        setTotal(response.total);
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
        if (cancelled || movedPage) return;
        setIsLoading(false);
        setIsPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, source, page, reloadToken, expireSession, router]);

  const changeStatus = (next: ListingStatusFilter) => {
    if (next === filters.status) return;
    setIsLoading(true);
    setIsPageLoading(false);
    setPage(1);
    setFilters((current) => ({ ...current, status: next }));
  };

  const applyFilters = (next: ManagePropertyFilters) => {
    const normalized = { ...next, projectName: next.projectName.trim() };
    if (
      normalized.projectName === filters.projectName &&
      normalized.role === filters.role &&
      normalized.status === filters.status
    ) {
      return;
    }
    setIsLoading(true);
    setIsPageLoading(false);
    setPage(1);
    setFilters(normalized);
  };

  const reload = () => {
    setIsLoading(true);
    setIsPageLoading(false);
    setReloadToken((current) => current + 1);
  };

  const changePage = (next: number) => {
    if (next === page || next < 1) return;
    setIsPageLoading(true);
    setPage(next);
  };

  // The changed listing leaves the current tab, which only shows one status
  const removeFromList = (id: string) => {
    const remaining = properties.filter((item) => item.id !== id);
    if (remaining.length === 0 && page > 1) {
      setProperties(remaining);
      setTotal((current) => Math.max(0, current - 1));
      setIsPageLoading(true);
      setPage(page - 1);
      return;
    }

    setProperties(remaining);
    setTotal((current) => Math.max(0, current - 1));
    setIsPageLoading(true);
    setReloadToken((current) => current + 1);
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
    status: filters.status,
    filters,
    properties,
    total,
    page,
    pageSize: PAGE_SIZE,
    isLoading,
    isPageLoading,
    error,
    busyId,
    changeStatus,
    applyFilters,
    reload,
    changePage,
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
