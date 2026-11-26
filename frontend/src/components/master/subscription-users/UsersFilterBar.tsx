"use client";

import { RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import CustomDropdown from "@/components/shared/CustomDropdown";
import { getDropdownFilterStyle } from "@/components/shared/ui/filterWidth";
import { DEFAULT_USER_FILTERS, PACKAGE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS, isFiltered, type UserFilters } from "./usersShared";

type UsersFilterBarProps = {
  applied: UserFilters;
  onApply: (filters: UserFilters) => void;
};

const SEARCH_DEBOUNCE_MS = 400;

const fieldClassName =
  "w-full min-h-11 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 pl-10 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function UsersFilterBar({ applied, onApply }: UsersFilterBarProps) {
  const [search, setSearch] = useState(applied.search);

  // Applies the typed search once the admin pauses
  useEffect(() => {
    const next = search.trim();
    if (next === applied.search) return;

    const timer = setTimeout(() => onApply({ ...applied, search: next }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, applied, onApply]);

  const changeSelect = <K extends "package" | "status">(key: K, value: UserFilters[K]) => onApply({ ...applied, search: search.trim(), [key]: value });

  const handleReset = () => {
    setSearch("");
    onApply(DEFAULT_USER_FILTERS);
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 w-full sm:w-auto sm:min-w-64 sm:flex-1">
          <label htmlFor="users-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="users-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or mobile number"
              autoComplete="off"
              className={`${fieldClassName} focus:border-slate-200/90! focus:ring-0!`}
            />
          </div>
        </div>

        <div className="min-w-0" style={getDropdownFilterStyle("Package", PACKAGE_FILTER_OPTIONS)}>
          <CustomDropdown
            id="users-package"
            label="Package"
            staticLabel
            variant="boxed"
            value={applied.package}
            options={PACKAGE_FILTER_OPTIONS}
            onChange={(next) => changeSelect("package", next as UserFilters["package"])}
          />
        </div>

        <div className="min-w-0" style={getDropdownFilterStyle("Subscription status", STATUS_FILTER_OPTIONS)}>
          <CustomDropdown
            id="users-status"
            label="Subscription status"
            staticLabel
            variant="boxed"
            value={applied.status}
            options={STATUS_FILTER_OPTIONS}
            onChange={(next) => changeSelect("status", next as UserFilters["status"])}
          />
        </div>

        {isFiltered(applied) || search ? (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
