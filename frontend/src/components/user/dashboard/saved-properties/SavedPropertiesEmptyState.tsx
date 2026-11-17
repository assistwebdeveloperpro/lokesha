import { Heart } from "lucide-react";
import Link from "next/link";
import { SAVED_EMPTY_STATE } from "./savedPropertiesShared";

export default function SavedPropertiesEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center sm:py-20">
      <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-rose-50 shadow-sm ring-1 ring-black/5">
        <Heart className="h-9 w-9 text-rose-500" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="font-display mt-6 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
        {SAVED_EMPTY_STATE.title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{SAVED_EMPTY_STATE.description}</p>
      <Link
        href="/property-search"
        className="bg-linear-to-r-navy-blue mt-6 inline-flex min-h-10 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
      >
        Explore properties
      </Link>
    </div>
  );
}
