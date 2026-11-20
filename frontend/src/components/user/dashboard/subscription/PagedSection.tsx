import type { ReactNode } from "react";
import ListPagination from "@/components/shared/ui/ListPagination";
import { SUBSCRIPTION_PAGE_SIZE } from "./subscriptionShared";

type PagedSectionProps = {
  isLoading: boolean;
  error: string;
  total: number;
  page: number;
  skeleton: ReactNode;
  emptyTitle: string;
  emptyText: string;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  children: ReactNode;
};

// Loading, error, empty and paging look the same on every list of the subscription pages
export default function PagedSection({
  isLoading,
  error,
  total,
  page,
  skeleton,
  emptyTitle,
  emptyText,
  onRetry,
  onPageChange,
  children,
}: PagedSectionProps) {
  if (isLoading) return <div aria-live="polite">{skeleton}</div>;

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
        >
          Try again
        </button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="font-display text-base font-bold text-slate-700">{emptyTitle}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div aria-live="polite">
      {children}
      <ListPagination page={page} pageSize={SUBSCRIPTION_PAGE_SIZE} total={total} onPageChange={onPageChange} />
    </div>
  );
}
