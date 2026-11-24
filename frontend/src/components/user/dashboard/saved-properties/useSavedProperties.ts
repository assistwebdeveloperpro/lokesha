"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { markSaved, markUnsaved } from "@/components/landing/saved-properties/savedPropertiesStore";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import {
  fetchSavedProperties,
  unsavePropertyRequest,
  type SavedProperty,
} from "@/services/savedProperties.service";
import { getToken } from "@/services/session";
import { getPageAfterRemoval, SAVED_PAGE_SIZE } from "./savedPropertiesShared";

const LOGIN_PATH = "/login";
const LOAD_ERROR = "We could not load your Shortlisted properties. Please try again.";
const REMOVE_SUCCESS = "Property removed from Shortlisted properties.";
const REMOVE_ERROR = "Unable to remove the property. Please try again.";

export function useSavedProperties() {
  const router = useRouter();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<SavedProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchSavedProperties({ page, limit: SAVED_PAGE_SIZE }, token)
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setTotal(response.total);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          router.push(LOGIN_PATH);
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
  }, [page, reloadToken, router]);

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  const remove = async (item: SavedProperty) => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    const previousItems = items;
    const previousTotal = total;
    setItems(items.filter(({ id }) => id !== item.id));
    setTotal(total - 1);
    markUnsaved(item.propertyId);

    try {
      await unsavePropertyRequest(item.propertyId, token);
      showToast(REMOVE_SUCCESS);
      // Silent refetch keeps the later pages in sync without a skeleton flash
      setPage(getPageAfterRemoval(page, previousItems.length));
      setReloadToken((current) => current + 1);
    } catch (failure) {
      setItems(previousItems);
      setTotal(previousTotal);
      markSaved(item.propertyId);
      if (failure instanceof ApiError && failure.status === 401) {
        router.push(LOGIN_PATH);
        return;
      }
      showToast(REMOVE_ERROR, "error");
    }
  };

  return { page, items, total, isLoading, error, changePage, reload, remove };
}
