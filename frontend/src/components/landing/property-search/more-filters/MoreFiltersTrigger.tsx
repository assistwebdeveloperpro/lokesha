"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { FOCUS_RING } from "../../home/hero-banner/heroBanner.shared";

type MoreFiltersTriggerProps = {
  open: boolean;
  count: number;
  onToggle: () => void;
  onClear?: () => void;
};

export function MoreFiltersTrigger({
  open,
  count,
  onToggle,
  onClear,
}: MoreFiltersTriggerProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 ${FOCUS_RING} ${
        open ? "bg-slate-100" : "bg-white hover:bg-slate-50"
      }`}
    >
      {count > 0 ? (
        <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-slate-900">
          {count}
        </span>
      ) : null}
      <span className="whitespace-nowrap">More Filters</span>
      {open ? (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-navy-blue text-white">
          <X className="h-3 w-3" aria-hidden />
        </span>
      ) : onClear ? (
        <span
          role="button"
          tabIndex={0}
          aria-label="Clear more filters"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onClear();
            }
          }}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-blue text-white hover:bg-navy-blue/90 ${FOCUS_RING}`}
        >
          <X className="h-3 w-3" aria-hidden />
        </span>
      ) : null}
      {open ? (
        <ChevronUp className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      ) : (
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      )}
    </button>
  );
}
