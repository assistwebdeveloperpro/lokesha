"use client";

import { Heart } from "lucide-react";
import ListPagination from "@/components/shared/ui/ListPagination";
import SavedPropertiesEmptyState from "./SavedPropertiesEmptyState";
import SavedPropertiesSkeleton from "./SavedPropertiesSkeleton";
import SavedPropertyCard from "./SavedPropertyCard";
import { SAVED_GRID_CLASS, SAVED_PAGE_SIZE } from "./savedPropertiesShared";
import { useSavedProperties } from "./useSavedProperties";

export default function SavedPropertiesContent() {
  const { page, items, total, isLoading, error, changePage, reload, remove } = useSavedProperties();

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md sm:h-11 sm:w-11">
            <Heart className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold text-slate-800 lg:text-xl">Shortlisted Properties</h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">Properties you have shortlisted</p>
          </div>
        </div>
        {!isLoading && !error && (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm sm:px-4 sm:text-sm"
            aria-label={`${total} Shortlisted properties`}
          >
            <span className="bg-linear-to-r-navy-blue flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white sm:h-6 sm:min-w-6 sm:text-xs">
              {total}
            </span>
            <span className="hidden sm:inline">Saved</span>
          </span>
        )}
      </header>

      <section className="mt-6" aria-live="polite">
        {isLoading ? (
          <SavedPropertiesSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
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
          <SavedPropertiesEmptyState />
        ) : (
          <>
            <ul className={SAVED_GRID_CLASS}>
              {items.map((item) => (
                <SavedPropertyCard key={item.id} item={item} onRemove={remove} />
              ))}
            </ul>
            <ListPagination page={page} pageSize={SAVED_PAGE_SIZE} total={total} onPageChange={changePage} />
          </>
        )}
      </section>
    </div>
  );
}
