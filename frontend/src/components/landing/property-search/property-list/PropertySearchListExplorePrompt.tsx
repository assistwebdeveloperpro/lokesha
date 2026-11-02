"use client";

import { MapPin, Sparkles } from "lucide-react";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { getTopLocalities } from "../search-filter-bar/searchTopLocalities";

type PropertySearchListExplorePromptProps = {
  criteria: PropertySearchCriteria;
  total: number;
  onPickLocality: (locality: string) => void;
  onClearLocalities: () => void;
};

export function PropertySearchListExplorePrompt({
  criteria,
  total,
  onPickLocality,
  onClearLocalities,
}: PropertySearchListExplorePromptProps) {
  const active = new Set(criteria.localities.map((name) => name.toLowerCase()));
  const suggestions = getTopLocalities(criteria.cityName)
    .filter((name) => !active.has(name.toLowerCase()))
    .slice(0, 5);

  if (suggestions.length === 0 && criteria.localities.length === 0) return null;

  return (
    <li className="list-none">
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-linear-to-br from-sky-50 via-white to-slate-50 p-4 shadow-sm sm:p-5">
        <Sparkles
          className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-sky-200/80"
          aria-hidden
        />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
              Discover more
            </p>
            <h3 className="mt-0.5 font-display text-base font-bold text-slate-900 sm:text-lg">
              {criteria.localities.length > 0
                ? "Explore nearby localities"
                : `${total.toLocaleString("en-IN")}+ properties waiting for you`}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {criteria.localities.length > 0
                ? "Similar homes in other areas — one tap to refresh your list."
                : "Narrow by locality or keep browsing to compare more options."}
            </p>
          </div>
          {criteria.localities.length > 0 ? (
            <button
              type="button"
              onClick={onClearLocalities}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-navy-blue hover:cursor-pointer"
            >
              View all in {criteria.cityName ?? "city"}
            </button>
          ) : null}
        </div>
        {suggestions.length > 0 ? (
          <ul className="relative mt-4 flex flex-wrap gap-2">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onPickLocality(name)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:cursor-pointer transition hover:border-sky-300 hover:bg-sky-50 hover:text-navy-blue"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
