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
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
          <Heart className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-800 lg:text-2xl">
            Saved Properties{isLoading || error ? "" : ` (${total})`}
          </h1>
          <p className="text-sm text-slate-500">Properties you have shortlisted</p>
        </div>
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
