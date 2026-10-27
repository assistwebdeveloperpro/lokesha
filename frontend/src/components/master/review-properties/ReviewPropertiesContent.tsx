"use client";

import PropertyFilterGrid, { PropertyFilterEmpty } from "@/components/shared/ui/PropertyFilterGrid";
import PropertyCardSkeleton from "@/components/user/dashboard/manage-properties/PropertyCardSkeleton";
import ReviewDetailModal from "./ReviewDetailModal";
import RejectPropertyModal from "./RejectPropertyModal";
import ReviewPropertiesEmptyState from "./ReviewPropertiesEmptyState";
import ReviewPropertyCard from "./ReviewPropertyCard";
import { REVIEW_TABS } from "./reviewPropertiesShared";
import { useReviewProperties } from "./useReviewProperties";

const SKELETON_COUNT = 6;

export default function ReviewPropertiesContent() {
  const review = useReviewProperties();
  const { status, properties, total, isLoading, error, busyId } = review;

  return (
    <div className="w-full px-4 py-0 sm:px-6 lg:px-6">
      <header>
        <h1 className="font-display text-xl font-bold text-slate-800 lg:text-2xl">Review Properties</h1>
        {!isLoading && !error ? (
          <p className="mt-1 text-sm text-slate-500">
            {total} {total === 1 ? "property" : "properties"}
          </p>
        ) : null}
      </header>

      <div
        className="mt-5 flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1.5 shadow-inner shadow-slate-200/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Property status"
      >
        {REVIEW_TABS.map((tab) => {
          const isSelected = status === tab.status;
          return (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => review.changeStatus(tab.status)}
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
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
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
              onClick={review.reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <PropertyFilterEmpty replayKey={`${status}-empty`}>
            <ReviewPropertiesEmptyState status={status} />
          </PropertyFilterEmpty>
        ) : (
          <>
            <PropertyFilterGrid replayKey={`${status}-list`}>
              {properties.map((property) => (
                <ReviewPropertyCard
                  key={property.id}
                  property={property}
                  isBusy={busyId === property.id}
                  onView={review.viewProperty}
                  onApprove={review.approve}
                  onReject={review.requestReject}
                />
              ))}
            </PropertyFilterGrid>
            {review.hasMore ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={review.isLoadingMore}
                  onClick={review.loadMore}
                  className="min-h-10 cursor-pointer rounded-xl border border-navy-blue px-6 text-sm font-semibold text-navy-blue transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {review.isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {review.rejecting ? (
        <RejectPropertyModal
          propertyTitle={review.rejecting.title}
          isSaving={busyId === review.rejecting.id}
          onCancel={review.cancelReject}
          onConfirm={review.confirmReject}
        />
      ) : null}

      {review.viewingId ? <ReviewDetailModal propertyId={review.viewingId} onClose={review.closeView} /> : null}
    </div>
  );
}
