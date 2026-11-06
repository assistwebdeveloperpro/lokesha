"use client";

import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { PublicAmenityItem } from "@/services/propertySearch.service";

const COLLAPSED_ITEM_COUNT = 11;

type PropertyDetailsAmenityGridProps = {
  items: PublicAmenityItem[];
  emptyMessage?: string;
};

const amenityTileClass =
  "flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm shadow-slate-900/3 transition hover:border-sky-200/80 hover:shadow-md hover:shadow-sky-100/50";

const toggleTileClass =
  "flex h-full min-h-[3.25rem] w-full cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/30 px-3 py-2.5 transition hover:border-sky-300 hover:bg-sky-50/60 sm:min-h-[3.5rem]";

export function PropertyDetailsAmenityGrid({
  items,
  emptyMessage = "No amenities have been listed for this property.",
}: PropertyDetailsAmenityGridProps) {
  // Expansion is tied to the list it was opened for, so a new list starts collapsed
  const [expandedItems, setExpandedItems] = useState<PublicAmenityItem[] | null>(null);
  const expanded = expandedItems === items;
  const hasOverflow = items.length > COLLAPSED_ITEM_COUNT;
  const visibleItems =
    expanded || !hasOverflow ? items : items.slice(0, COLLAPSED_ITEM_COUNT);

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
      {visibleItems.map(({ name, imagePath }) => (
        <li key={name} className={amenityTileClass}>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50">
            <Image
              src={imagePath}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              sizes="36px"
              aria-hidden
            />
          </span>
          <span className="text-xs font-semibold text-slate-700 sm:text-sm">{name}</span>
        </li>
      ))}

      {hasOverflow ? (
        <li>
          <button
            type="button"
            onClick={() => setExpandedItems(expanded ? null : items)}
            className={toggleTileClass}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <span className="text-xs font-semibold text-sky-700 sm:text-sm">Show Less</span>
                <ChevronUp className="h-4 w-4 shrink-0 text-sky-600" strokeWidth={2} aria-hidden />
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-sky-700 sm:text-sm">Show More</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-sky-600" strokeWidth={2} aria-hidden />
              </>
            )}
          </button>
        </li>
      ) : null}
    </ul>
  );
}
