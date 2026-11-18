"use client";

import { ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { getRecentSearchHref } from "@/components/landing/recent-searches/recentSearchRestore";
import type { RecentSearch } from "@/services/recentSearches.service";
import { RECENT_SEARCH_ROW_CLASS } from "./recentSearchesShared";

type RecentSearchCardProps = {
  item: RecentSearch;
  onRemove: (id: string) => void;
};

export default function RecentSearchCard({ item, onRemove }: RecentSearchCardProps) {
  return (
    <li
      className={`${RECENT_SEARCH_ROW_CLASS} group border-slate-200/90 bg-white transition-colors hover:border-sky-400 focus-within:border-sky-400`}
    >
      <Link
        href={getRecentSearchHref(item)}
        className="flex min-w-0 flex-1 items-center gap-3 focus-visible:outline-none"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-sky-600 group-focus-within:text-sky-600">
            {item.title}
          </span>
          {item.subtitle && (
            <span className="mt-1 block truncate text-xs text-slate-500 sm:text-sm">{item.subtitle}</span>
          )}
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-sky-600 group-focus-within:text-sky-600"
          aria-hidden
        />
      </Link>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove search ${item.title}`}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
}
