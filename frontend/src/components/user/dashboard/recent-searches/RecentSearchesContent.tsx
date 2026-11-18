"use client";

import { History } from "lucide-react";
import { useState } from "react";
import ConfirmDeleteModal from "@/components/shared/ui/ConfirmDeleteModal";
import RecentSearchCard from "./RecentSearchCard";
import RecentSearchesEmptyState from "./RecentSearchesEmptyState";
import RecentSearchesSkeleton from "./RecentSearchesSkeleton";
import {
  getRecentSearchesCountLabel,
  RECENT_SEARCHES_CLEAR_CONFIRM,
  RECENT_SEARCHES_LIST_CLASS,
  RECENT_SEARCHES_LOAD_ERROR,
  RECENT_SEARCHES_SUBTITLE,
  RECENT_SEARCHES_TITLE,
} from "./recentSearchesShared";
import { useRecentSearches } from "./useRecentSearches";

export default function RecentSearchesContent() {
  const { items, total, isLoading, hasError, isClearing, remove, clearAll, reload } = useRecentSearches();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirmClear = async () => {
    if (await clearAll()) setIsConfirmOpen(false);
  };

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md sm:h-11 sm:w-11">
            <History className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold text-slate-800 lg:text-xl">
              {RECENT_SEARCHES_TITLE}
              {!isLoading && !hasError && (
                <span className="ml-2 text-sm font-medium text-slate-500">{getRecentSearchesCountLabel(total)}</span>
              )}
            </h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">{RECENT_SEARCHES_SUBTITLE}</p>
          </div>
        </div>
        {!isLoading && !hasError && total > 0 && (
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="min-h-10 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Clear All
          </button>
        )}
      </header>

      <section className="mt-6" aria-live="polite">
        {isLoading ? (
          <RecentSearchesSkeleton />
        ) : hasError ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {RECENT_SEARCHES_LOAD_ERROR}
            </p>
            <button
              type="button"
              onClick={reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <RecentSearchesEmptyState />
        ) : (
          <ul className={RECENT_SEARCHES_LIST_CLASS}>
            {items.map((item) => (
              <RecentSearchCard key={item.id} item={item} onRemove={remove} />
            ))}
          </ul>
        )}
      </section>

      {isConfirmOpen && (
        <ConfirmDeleteModal
          title={RECENT_SEARCHES_CLEAR_CONFIRM.title}
          isDeleting={isClearing}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmClear}
        >
          {RECENT_SEARCHES_CLEAR_CONFIRM.description}
        </ConfirmDeleteModal>
      )}
    </div>
  );
}
