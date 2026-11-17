import { Handshake } from "lucide-react";
import Link from "next/link";
import { CONTACTED_EMPTY_STATES } from "./contactedPropertiesShared";

type ContactedPropertiesEmptyStateProps = {
  isFiltered: boolean;
};

export default function ContactedPropertiesEmptyState({ isFiltered }: ContactedPropertiesEmptyStateProps) {
  const { title, description } = CONTACTED_EMPTY_STATES[isFiltered ? "filtered" : "all"];

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center sm:py-20">
      <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-sky-50 shadow-sm ring-1 ring-black/5">
        <Handshake className="h-9 w-9 text-sky-600" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="font-display mt-6 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      {isFiltered ? null : (
        <Link
          href="/property-search"
          className="bg-linear-to-r-navy-blue mt-6 inline-flex min-h-10 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          Search properties
        </Link>
      )}
    </div>
  );
}
