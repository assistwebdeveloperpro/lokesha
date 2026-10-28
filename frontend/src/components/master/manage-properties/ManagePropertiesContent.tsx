"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import ListPagination from "@/components/shared/ui/ListPagination";
import PropertyFilterGrid, { PropertyFilterEmpty } from "@/components/shared/ui/PropertyFilterGrid";
import { useToast } from "@/components/shared/ui/ToastProvider";
import PropertyCardSkeleton from "@/components/user/dashboard/manage-properties/PropertyCardSkeleton";
import DeletePropertyModal from "@/components/user/dashboard/manage-properties/DeletePropertyModal";
import ListingActionModal from "@/components/user/dashboard/manage-properties/ListingActionModal";
import { MANAGE_TABS } from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import ReviewDetailModal from "@/components/master/review-properties/ReviewDetailModal";
import ManagePropertiesEmptyState from "./ManagePropertiesEmptyState";
import ManagePropertiesFilterPanel from "./ManagePropertiesFilterPanel";
import ManagePropertyCard from "./ManagePropertyCard";
import { useHighlightProperty } from "./useHighlightProperty";
import { useManageProperties, type ListingStatusFilter } from "./useManageProperties";

export const OUR_LISTING_TABS: { status: ListingStatusFilter; label: string }[] = [
  { status: "all", label: "All" },
  { status: "draft", label: "Draft" },
  { status: "published", label: "Published" },
  { status: "closed", label: "Closed" },
];

export const MASTER_MANAGE_TABS: { status: ListingStatusFilter; label: string }[] = [
  { status: "all", label: "All" },
  { status: "published", label: "Published" },
  { status: "rejected", label: "Rejected" },
  { status: "closed", label: "Closed" },
];

type ManagePropertiesContentProps = {
  title?: string;
  description?: string;
  source?: "admin";
  tabs?: { status: ListingStatusFilter; label: string }[];
  initialStatus?: ListingStatusFilter;
  filterLayout?: "tabs" | "panel";
  showSourceBadge?: boolean;
  showOwnerDetails?: boolean;
  allowListingActions?: boolean;
  showPropertyCount?: boolean;
};

const SKELETON_COUNT = 6;
const POST_PROPERTY_PATH = "/backend/properties/post-property";

export default function ManagePropertiesContent({
  title = "Manage Properties",
  description,
  source,
  tabs = MANAGE_TABS,
  initialStatus = "published",
  filterLayout = "tabs",
  showSourceBadge = true,
  showOwnerDetails = true,
  allowListingActions = true,
  showPropertyCount = true,
}: ManagePropertiesContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const focusPropertyId = searchParams.get("property");

  const manage = useManageProperties({ source, initialStatus });
  const { status, filters, properties, total, page, pageSize, isLoading, isPageLoading, error, busyId } = manage;
  const listReplayKey = `${status}-${filters.projectName}-${filters.role}-${properties[0]?.id ?? "none"}`;
  const resultsRef = useRef<HTMLElement>(null);
  const previousPage = useRef(page);

  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
    const node = resultsRef.current;
    if (!node) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [page]);

  const handleFocusResolved = useCallback(
    (isListed: boolean) => {
      if (!isListed) showToast("We could not find that property in this list.", "error");
      const next = new URLSearchParams(searchParams.toString());
      next.delete("property");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams, showToast],
  );

  const highlightedId = useHighlightProperty({
    focusId: focusPropertyId,
    isLoading,
    isListed: properties.some((item) => item.id === focusPropertyId),
    onResolved: handleFocusResolved,
  });

  return (
    <div className="w-full px-4 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-800 lg:text-2xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          {showPropertyCount && !isLoading && !error ? (
            <p className={`${description ? "mt-0.5" : "mt-1"} text-sm text-slate-500`}>
              {total} {total === 1 ? "property" : "properties"}
            </p>
          ) : null}
        </div>
        <Link
          href={POST_PROPERTY_PATH}
          className="bg-linear-to-r-navy-blue inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Post New Property
        </Link>
      </header>

      {filterLayout === "panel" ? (
        <ManagePropertiesFilterPanel
          applied={filters}
          onApply={manage.applyFilters}
          isLoading={isLoading}
        />
      ) : (
        <div
          className="mt-5 flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1.5 shadow-inner shadow-slate-200/40 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Property status"
        >
          {tabs.map((tab) => {
            const isSelected = status === tab.status;
            return (
              <button
                key={tab.status}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => manage.changeStatus(tab.status)}
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
      )}

      <section
        ref={resultsRef}
        className="mt-6 scroll-mt-4 rounded-2xl border border-slate-200/70 bg-slate-100/60 p-4 sm:p-5"
        aria-live="polite"
        aria-busy={isPageLoading || undefined}
      >
        {isLoading || (isPageLoading && properties.length === 0) ? (
          <PropertyFilterGrid replayKey={`${listReplayKey}-loading`} variant="skeleton" isBusy>
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
              onClick={manage.reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <PropertyFilterEmpty replayKey={`${listReplayKey}-empty`}>
            <ManagePropertiesEmptyState status={status} scope={source === "admin" ? "admin" : "manage"} />
          </PropertyFilterEmpty>
        ) : (
          <>
            <div className={isPageLoading ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
              <PropertyFilterGrid replayKey={`${listReplayKey}-list`}>
                {properties.map((property) => (
                  <ManagePropertyCard
                    key={property.id}
                    property={property}
                    isBusy={busyId === property.id}
                    isHighlighted={highlightedId === property.id}
                    showSourceBadge={showSourceBadge}
                    showOwnerDetails={showOwnerDetails}
                    allowListingActions={allowListingActions}
                    onView={manage.viewProperty}
                    onPublish={manage.publish}
                    onDelete={manage.requestDelete}
                    onListingAction={manage.requestListingAction}
                  />
                ))}
              </PropertyFilterGrid>
            </div>
            <ListPagination
              page={page}
              pageSize={pageSize}
              total={total}
              isDisabled={isPageLoading}
              onPageChange={manage.changePage}
            />
          </>
        )}
      </section>

      {manage.viewing ? (
        <ReviewDetailModal propertyId={manage.viewing.id} owner={manage.viewing.owner} onClose={manage.closeView} />
      ) : null}
      {manage.pendingDelete ? (
        <DeletePropertyModal
          propertyTitle={manage.pendingDelete.title}
          isDeleting={busyId === manage.pendingDelete.id}
          onCancel={manage.cancelDelete}
          onConfirm={manage.confirmDelete}
        />
      ) : null}
      {manage.pendingListingAction ? (
        <ListingActionModal
          action={manage.pendingListingAction.action}
          propertyTitle={manage.pendingListingAction.property.title}
          isSubmitting={busyId === manage.pendingListingAction.property.id}
          onCancel={manage.cancelListingAction}
          onConfirm={manage.confirmListingAction}
        />
      ) : null}
    </div>
  );
}
