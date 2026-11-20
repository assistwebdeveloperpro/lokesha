"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import {
  exportAdminTransactions,
  fetchAdminTransactions,
  type AdminTransaction,
} from "@/services/adminSubscription.service";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { ApiError } from "@/services/apiClient";
import {
  DEFAULT_TRANSACTION_FILTERS,
  toFilterParams,
  toTransactionsQuery,
  type TransactionFilters,
} from "./transactionsShared";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the transactions. Please try again.";
const EXPORT_ERROR = "We could not export the transactions. Please try again.";

export function useTransactions() {
  const router = useRouter();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_TRANSACTION_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

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
    fetchAdminTransactions(toTransactionsQuery(filters, page), token)
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
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
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page, reloadToken, expireSession, router]);

  const applyFilters = (next: TransactionFilters) => {
    setIsLoading(true);
    setPage(1);
    setFilters(next);
  };

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  // Exports everything the filters match, not just the page on screen
  const exportCsv = async () => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    setIsExporting(true);
    try {
      const { search, status, from, to } = toFilterParams(filters);
      const url = URL.createObjectURL(await exportAdminTransactions({ search, status, from, to }, token));
      const link = document.createElement("a");
      link.href = url;
      link.download = `subscription-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (failure: unknown) {
      if (failure instanceof ApiError && failure.status === 401) {
        expireSession();
        return;
      }
      showToast(EXPORT_ERROR, "error");
    } finally {
      setIsExporting(false);
    }
  };

  return { items, total, page, filters, isLoading, error, isExporting, applyFilters, changePage, reload, exportCsv };
}
