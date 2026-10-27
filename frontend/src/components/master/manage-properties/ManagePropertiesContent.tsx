"use client";

import Link from "next/link";
import PropertyFilterGrid, { PropertyFilterEmpty } from "@/components/shared/ui/PropertyFilterGrid";
import PropertyCardSkeleton from "@/components/user/dashboard/manage-properties/PropertyCardSkeleton";
import { MANAGE_TABS } from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import ManagePropertiesEmptyState from "./ManagePropertiesEmptyState";
import ManagePropertyCard from "./ManagePropertyCard";
import { useManageProperties, type ListingStatusFilter } from "./useManageProperties";

export const OUR_LISTING_TABS: { status: ListingStatusFilter; label: string }[] = [
  { status: "all", label: "All" },
  { status: "draft", label: "Draft" },
  { status: "published", label: "Published" },
  { status: "closed", label: "Closed" },
];

type ManagePropertiesContentProps = {
  title?: string;
  description?: string;
  source?: "admin";
  tabs?: { status: ListingStatusFilter; label: string }[];
  initialStatus?: ListingStatusFilter;
  showSourceBadge?: boolean;
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
  showSourceBadge = true,
  showPropertyCount = true,
}: ManagePropertiesContentProps) {
  const manage = useManageProperties({ source, initialStatus });
  const { status, properties, total, isLoading, error, busyId } = manage;

  return (
    <div className="w-full px-4 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
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
          className="bg-linear-to-r-navy-blue inline-flex min-h-10 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-md"
        >
          Post Property
        </Link>
      </header>

      <div
        className="mt-5 flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1.5 shadow-inner shadow-slate-200/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              onClick={manage.reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <PropertyFilterEmpty replayKey={`${status}-empty`}>
            <ManagePropertiesEmptyState status={status} scope={source === "admin" ? "admin" : "manage"} />
          </PropertyFilterEmpty>
        ) : (
          <>
            <PropertyFilterGrid replayKey={`${status}-list`}>
              {properties.map((property) => (
                <ManagePropertyCard
                  key={property.id}
                  property={property}
                  isBusy={busyId === property.id}
                  showSourceBadge={showSourceBadge}
                  onPublish={manage.publish}
                  onClose={manage.close}
                />
              ))}
            </PropertyFilterGrid>
            {manage.hasMore ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={manage.isLoadingMore}
                  onClick={manage.loadMore}
                  className="min-h-10 cursor-pointer rounded-xl border border-navy-blue px-6 text-sm font-semibold text-navy-blue transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {manage.isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
