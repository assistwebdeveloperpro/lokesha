import { Sparkles } from "lucide-react";
import type { PublicAmenityItem } from "@/services/propertySearch.service";

type PropertyDetailsAmenityGridProps = {
  items: PublicAmenityItem[];
  emptyMessage?: string;
};

export function PropertyDetailsAmenityGrid({
  items,
  emptyMessage = "No amenities have been listed for this property.",
}: PropertyDetailsAmenityGridProps) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:min-h-52"
      >
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 ring-1 ring-sky-100"
          aria-hidden
        >
          <Sparkles className="h-6 w-6 text-sky-600" />
        </span>
        <p className="max-w-sm text-sm font-medium text-slate-500 sm:text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(({ name, imagePath }) => (
        <li
          key={name}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm shadow-slate-900/3 transition hover:border-sky-200/80 hover:shadow-md hover:shadow-sky-100/50"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePath} alt="" className="h-9 w-9 object-contain" aria-hidden />
          </span>
          <span className="text-xs font-semibold text-slate-700 sm:text-sm">{name}</span>
        </li>
      ))}
    </ul>
  );
}
