"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import PropertyFilterGrid, { PropertyFilterEmpty } from "@/components/shared/ui/PropertyFilterGrid";
import PropertyCardSkeleton from "@/components/user/dashboard/manage-properties/PropertyCardSkeleton";
import { useHighlightProperty } from "@/components/master/manage-properties/useHighlightProperty";
import ReviewDetailModal from "./ReviewDetailModal";
import RejectPropertyModal from "./RejectPropertyModal";
import ReviewPropertiesEmptyState from "./ReviewPropertiesEmptyState";
import ReviewPropertyCard from "./ReviewPropertyCard";
import { useReviewProperties } from "./useReviewProperties";

const SKELETON_COUNT = 6;
const MANAGE_PROPERTIES_PATH = "/backend/properties/manage-properties";

export default function ReviewPropertiesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const focusPropertyId = searchParams.get("property");

  const review = useReviewProperties();
  const { properties, total, isLoading, error, busyId } = review;

  // A property no longer pending has moved to manage properties
  const handleFocusResolved = useCallback(
    (isListed: boolean) => {
      if (isListed) {
        router.replace(pathname);
        return;
      }
      router.replace(`${MANAGE_PROPERTIES_PATH}?property=${encodeURIComponent(focusPropertyId ?? "")}`);
    },
    [focusPropertyId, pathname, router],
  );

  const highlightedId = useHighlightProperty({
    focusId: focusPropertyId,
    isLoading,
    isListed: properties.some((item) => item.id === focusPropertyId),
    onResolved: handleFocusResolved,
  });

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

      <section
        className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-100/60 p-4 sm:p-5"
        aria-live="polite"
      >
        {isLoading ? (
          <PropertyFilterGrid replayKey="loading" variant="skeleton" isBusy>
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
          <PropertyFilterEmpty replayKey="empty">
            <ReviewPropertiesEmptyState status="pending" />
          </PropertyFilterEmpty>
        ) : (
          <>
            <PropertyFilterGrid replayKey="list">
              {properties.map((property) => (
                <ReviewPropertyCard
                  key={property.id}
                  property={property}
                  isBusy={busyId === property.id}
                  isHighlighted={highlightedId === property.id}
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

      {review.viewing ? (
        <ReviewDetailModal propertyId={review.viewing.id} owner={review.viewing.owner} onClose={review.closeView} />
      ) : null}
    </div>
  );
}
