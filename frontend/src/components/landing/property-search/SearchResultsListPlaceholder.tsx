import { Building2 } from "lucide-react";

export function SearchResultsListPlaceholder() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
        <Building2 className="h-5 w-5 text-sky-600" aria-hidden />
      </span>
      <h2 className="mt-4 text-base font-bold text-slate-800">
        Matching properties will appear here
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-600">
        Your filters are saved in the page address, so you can share or bookmark
        this search.
      </p>
    </div>
  );
}
