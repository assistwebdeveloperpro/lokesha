import { Search } from "lucide-react";
import Link from "next/link";
import { RECENT_SEARCHES_EMPTY_STATE } from "./recentSearchesShared";

export default function RecentSearchesEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center sm:py-20">
      <span className="flex h-185rem] items-center justify-center rounded-2xl bg-sky-50 shadow-sm">
        <Search className="h-9 w-9 text-sky-600" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="font-display mt-6 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
        {RECENT_SEARCHES_EMPTY_STATE.title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {RECENT_SEARCHES_EMPTY_STATE.description}
      </p>
      <Link
        href="/"
        className="bg-linear-to-r-navy-blue mt-6 inline-flex min-h-10 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
      >
        {RECENT_SEARCHES_EMPTY_STATE.action}
      </Link>
    </div>
  );
}
