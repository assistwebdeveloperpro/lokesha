"use client";

import { Eye } from "lucide-react";
import { SavePropertyButton } from "@/components/landing/saved-properties/SavePropertyButton";
import ListPagination from "@/components/shared/ui/ListPagination";
import PropertyActivityCard from "../saved-properties/PropertyActivityCard";
import SavedPropertiesSkeleton from "../saved-properties/SavedPropertiesSkeleton";
import { SAVED_GRID_CLASS } from "../saved-properties/savedPropertiesShared";
import SeenPropertiesEmptyState from "./SeenPropertiesEmptyState";
import { SEEN_PAGE_SIZE } from "./seenPropertiesShared";
import { useSeenProperties } from "./useSeenProperties";

export default function SeenPropertiesContent() {
  const { page, items, total, isLoading, error, changePage, reload } = useSeenProperties();

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md sm:h-11 sm:w-11">
            <Eye className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold text-slate-800 lg:text-xl">
              Recently Viewed Properties
            </h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">Properties you opened recently</p>
          </div>
        </div>
        {!isLoading && !error && (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm sm:px-4 sm:text-sm"
            aria-label={`${total} recently viewed properties`}
          >
            <span className="bg-linear-to-r-navy-blue flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white sm:h-6 sm:min-w-6 sm:text-xs">
              {total}
            </span>
            <span className="hidden sm:inline">Viewed</span>
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
          <SeenPropertiesEmptyState />
        ) : (
          <>
            <ul className={SAVED_GRID_CLASS}>
              {items.map((item) => (
                <PropertyActivityCard
                  key={item.id}
                  item={item}
                  action={<SavePropertyButton propertyId={item.propertyId} size="sm" />}
                />
              ))}
            </ul>
            <ListPagination page={page} pageSize={SEEN_PAGE_SIZE} total={total} onPageChange={changePage} />
          </>
        )}
      </section>
    </div>
  );
}
