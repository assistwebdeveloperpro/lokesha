"use client";

import { Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import CustomDropdown, { type DropdownOption } from "@/components/shared/CustomDropdown";
import { getDropdownFilterStyle } from "@/components/shared/ui/filterWidth";
import {
  DEFAULT_LEAD_FILTERS,
  LEAD_LISTED_BY_OPTIONS,
  LEAD_LISTING_TYPE_OPTIONS,
  LEAD_PHONE_OPTIONS,
  LEAD_PROPERTY_TYPE_OPTIONS,
  LEAD_SEARCH_MIN_CHARS,
  LEAD_VERIFICATION_OPTIONS,
  type LeadFilters,
  type LeadPhoneFilter,
} from "./leadsShared";

type LeadsFilterBarProps = {
  applied: LeadFilters;
  onApply: (filters: LeadFilters) => void;
};

const SEARCH_DEBOUNCE_MS = 400;
const SEARCH_PLACEHOLDER = "Search Lead, Property, Property Listed By";

const fieldClassName =
  "w-full min-h-11 appearance-none rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 pl-10 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

type SelectFilterKey = "phone" | "verification" | "listedBy" | "propertyType" | "listingType";

const SELECT_FILTERS: { key: SelectFilterKey; label: string; options: DropdownOption[] }[] = [
  { key: "verification", label: "Lead status", options: LEAD_VERIFICATION_OPTIONS },
  { key: "phone", label: "Phone status", options: LEAD_PHONE_OPTIONS },
  { key: "listedBy", label: "Property listed by", options: LEAD_LISTED_BY_OPTIONS },
  { key: "propertyType", label: "Property type", options: LEAD_PROPERTY_TYPE_OPTIONS },
  { key: "listingType", label: "Listing type", options: LEAD_LISTING_TYPE_OPTIONS },
];

export default function LeadsFilterBar({ applied, onApply }: LeadsFilterBarProps) {
  const [searchText, setSearchText] = useState(applied.search);
  const trimmedSearch = searchText.trim();
  const isTooShort = trimmedSearch.length > 0 && trimmedSearch.length < LEAD_SEARCH_MIN_CHARS;
  const isFiltered =
    searchText !== "" ||
    Object.keys(DEFAULT_LEAD_FILTERS).some(
      (key) => applied[key as keyof LeadFilters] !== DEFAULT_LEAD_FILTERS[key as keyof LeadFilters],
    );

  useEffect(() => {
    const canApply = trimmedSearch === "" || trimmedSearch.length >= LEAD_SEARCH_MIN_CHARS;
    if (!canApply || trimmedSearch === applied.search) return;

    const timer = setTimeout(() => onApply({ ...applied, search: trimmedSearch }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmedSearch, applied, onApply]);

  const handleClear = () => {
    setSearchText("");
    onApply(DEFAULT_LEAD_FILTERS);
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50/80 to-sky-50/40 p-5 shadow-[0_1px_3px_rgba(15,23,42,.06),0_8px_24px_rgba(15,23,42,.04)]">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="bg-linear-to-r-navy-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
          <Filter className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">Filters</h2>
          <p className="text-sm text-slate-500">Narrow leads by status, phone, property, or listing type</p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 w-full sm:w-auto sm:min-w-72 sm:flex-1">
          <label htmlFor="leads-filter-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              id="leads-filter-search"
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={SEARCH_PLACEHOLDER}
              className={`${fieldClassName} focus:border-slate-200/90! focus:ring-0!`}
              autoComplete="off"
            />
          </div>
          {isTooShort ? (
            <p className="mt-1.5 text-xs text-slate-500">Type at least {LEAD_SEARCH_MIN_CHARS} characters to search.</p>
          ) : null}
        </div>

        {SELECT_FILTERS.map(({ key, label, options }) => (
          <div key={key} className="min-w-0" style={getDropdownFilterStyle(label, options)}>
            <CustomDropdown
              id={`leads-filter-${key}`}
              label={label}
              staticLabel
              variant="boxed"
              value={applied[key]}
              options={options}
              onChange={(next) => onApply({ ...applied, [key]: key === "phone" ? (next as LeadPhoneFilter) : next })}
            />
          </div>
        ))}
      </div>

      {isFiltered ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" aria-hidden />
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
