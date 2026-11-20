"use client";

import { ArrowRight, History, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ListPagination from "@/components/shared/ui/ListPagination";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { fetchPackageAuditLogs, type PackageAuditLog, type SubscriptionPackage } from "@/services/adminSubscription.service";
import { ApiError } from "@/services/apiClient";
import { AUDIT_PAGE_SIZE, formatChangeValue, formatDateTime, getFieldLabel } from "./subscriptionPackagesShared";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the history. Please try again.";
const SKELETON_COUNT = 3;

const bar = "animate-pulse rounded bg-slate-200/80";

function HistorySkeleton() {
  return (
    <ul className="space-y-3" aria-busy aria-hidden>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <li key={index} className="rounded-xl border border-slate-200/90 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className={`${bar} h-9 w-9 shrink-0 rounded-full`} />
            <div className="flex-1 space-y-2">
              <div className={`${bar} h-3.5 w-32`} />
              <div className={`${bar} h-3 w-24`} />
            </div>
          </div>
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            <div className={`${bar} h-3 w-4/5`} />
            <div className={`${bar} h-3 w-3/5`} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function HistoryEntry({ log }: { log: PackageAuditLog }) {
  const adminName = log.admin?.name ?? "Removed admin";

  return (
    <li className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-700 ring-1 ring-sky-200">
          {adminName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{adminName}</p>
          <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        {Object.entries(log.changes).map(([field, { from, to }]) => (
          <li key={field} className="text-sm">
            <span className="font-medium text-slate-500">{getFieldLabel(field)}</span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 line-through decoration-red-300">
                {formatChangeValue(field, from)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {formatChangeValue(field, to)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function PackageHistoryModal({ pkg, onClose }: { pkg: SubscriptionPackage; onClose: () => void }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<PackageAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const expireSession = useCallback(() => {
    clearAdminSession();
    router.push(LOGIN_PATH);
  }, [router]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchPackageAuditLogs(pkg.id, { page, limit: AUDIT_PAGE_SIZE }, token)
      .then((response) => {
        if (cancelled) return;
        setLogs(response.items);
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
  }, [pkg.id, page, reloadToken, expireSession, router]);

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const retry = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close history" className="absolute inset-0 cursor-pointer bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-history-heading"
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-xl"
      >
        <header className="bg-linear-to-r-navy-blue flex items-start justify-between gap-4 px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <History className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 id="package-history-heading" className="font-display text-base font-bold">
                {pkg.name} package history
              </h2>
              <p className="text-xs font-medium text-slate-300">Every change, with who made it</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6" aria-live="polite">
          {isLoading ? (
            <HistorySkeleton />
          ) : error ? (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
              <button
                type="button"
                onClick={retry}
                className="bg-linear-to-r-navy-blue mt-4 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
              >
                Try again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-slate-500">No changes have been made to this package yet.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {logs.map((log) => (
                  <HistoryEntry key={log.id} log={log} />
                ))}
              </ul>
              <ListPagination page={page} pageSize={AUDIT_PAGE_SIZE} total={total} onPageChange={changePage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
