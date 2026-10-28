"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageToken = number | "ellipsis";

type ListPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  isDisabled?: boolean;
  onPageChange: (page: number) => void;
};

const focusClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1";

const pageButtonClassName =
  "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-semibold tabular-nums transition disabled:cursor-not-allowed";

const idleButtonClassName =
  "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-navy-blue disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700";

const activeButtonClassName = "border-transparent bg-linear-to-r-navy-blue text-white shadow-md";

const stepButtonClassName = cn(
  "inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-navy-blue disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700",
  focusClassName,
);

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPageTokens(current: number, totalPages: number): PageToken[] {
  const siblingCount = 1;
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) return range(1, totalPages);

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, totalPages);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + siblingCount * 2), "ellipsis", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const count = 3 + siblingCount * 2;
    return [1, "ellipsis", ...range(totalPages - count + 1, totalPages)];
  }

  return [1, "ellipsis", ...range(left, right), "ellipsis", totalPages];
}

export default function ListPagination({
  page,
  pageSize,
  total,
  isDisabled = false,
  onPageChange,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const tokens = getPageTokens(page, totalPages);

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="inline-flex h-7 items-center rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs font-semibold tabular-nums text-slate-700">
          {from}–{to}
        </span>{" "}
        of <span className="font-semibold tabular-nums text-slate-800">{total}</span>
      </p>

      <nav className="flex min-w-0 items-center gap-1.5" aria-label="Property pages">
        <button
          type="button"
          className={stepButtonClassName}
          aria-label="Previous page"
          disabled={isDisabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex min-w-0 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {tokens.map((token, index) =>
            token === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-9 w-7 shrink-0 items-center justify-center text-sm font-semibold text-slate-400"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={token}
                type="button"
                className={cn(
                  pageButtonClassName,
                  focusClassName,
                  token === page ? activeButtonClassName : idleButtonClassName,
                )}
                aria-label={`Page ${token}`}
                aria-current={token === page ? "page" : undefined}
                disabled={isDisabled}
                onClick={() => onPageChange(token)}
              >
                {token}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className={stepButtonClassName}
          aria-label="Next page"
          disabled={isDisabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </nav>
    </div>
  );
}
