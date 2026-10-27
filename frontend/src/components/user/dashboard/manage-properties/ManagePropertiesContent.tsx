"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import PropertyFilterGrid, { PropertyFilterEmpty } from "@/components/shared/ui/PropertyFilterGrid";
import DeletePropertyModal from "./DeletePropertyModal";
import ManagePropertiesEmptyState from "./ManagePropertiesEmptyState";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import ListingActionModal from "./ListingActionModal";
import SubmitPropertyModal from "./SubmitPropertyModal";
import { MANAGE_TABS, PAGE_SIZE } from "./managePropertiesShared";
import { useManageProperties } from "./useManageProperties";

const SKELETON_COUNT = 6;

export default function ManagePropertiesContent() {
  const manager = useManageProperties();
  const { status, properties, total, isLoading, error, busyId } = manager;

  return (
    <div className="w-full px-4 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-800 lg:text-2xl">Manage Properties</h1>
          {!isLoading && !error ? (
            <p className="mt-1 text-sm text-slate-500">
              {total} {total === 1 ? "property" : "properties"}
            </p>
          ) : null}
        </div>
        <Link
          href="/post-property"
          className="bg-linear-to-r-navy-blue inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Post New Property
        </Link>
      </header>

      <div
        className="mt-5 flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1.5 shadow-inner shadow-slate-200/40 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Property status"
      >
        {MANAGE_TABS.map((tab) => {
          const isSelected = status === tab.status;
          return (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => manager.changeStatus(tab.status)}
              className={`min-h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? "bg-white text-navy-blue shadow-sm ring-1 ring-slate-200/90"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <section
        className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-100/60 p-4 sm:p-5"
        aria-live="polite"
      >
        {isLoading ? (
          <PropertyFilterGrid replayKey={`${status}-loading`} variant="skeleton" isBusy>
            {Array.from({ length: Math.min(SKELETON_COUNT, PAGE_SIZE) }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </PropertyFilterGrid>
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={manager.reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <PropertyFilterEmpty replayKey={`${status}-empty`}>
            <ManagePropertiesEmptyState status={status} />
          </PropertyFilterEmpty>
        ) : (
          <>
            <PropertyFilterGrid replayKey={`${status}-list`}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isBusy={busyId === property.id}
                  onDelete={manager.requestDelete}
                  onStatusAction={manager.runStatusAction}
                />
              ))}
            </PropertyFilterGrid>
            {manager.hasMore ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={manager.isLoadingMore}
                  onClick={manager.loadMore}
                  className="min-h-10 cursor-pointer rounded-xl border border-navy-blue px-6 text-sm font-semibold text-navy-blue transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {manager.isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {manager.pendingDelete ? (
        <DeletePropertyModal
          propertyTitle={manager.pendingDelete.title}
          isDeleting={busyId === manager.pendingDelete.id}
          onCancel={manager.cancelDelete}
          onConfirm={manager.confirmDelete}
        />
      ) : null}

      {manager.pendingSubmit ? (
        <SubmitPropertyModal
          propertyTitle={manager.pendingSubmit.title}
          isSubmitting={busyId === manager.pendingSubmit.id}
          onCancel={manager.cancelSubmit}
          onConfirm={manager.confirmSubmit}
        />
      ) : null}

      {manager.pendingListingAction ? (
        <ListingActionModal
          action={manager.pendingListingAction.action}
          propertyTitle={manager.pendingListingAction.property.title}
          isSubmitting={busyId === manager.pendingListingAction.property.id}
          onCancel={manager.cancelListingAction}
          onConfirm={manager.confirmListingAction}
        />
      ) : null}
    </div>
  );
}
