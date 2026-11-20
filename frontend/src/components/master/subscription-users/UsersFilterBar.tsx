"use client";

import { RotateCcw, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import CustomDropdown from "@/components/shared/CustomDropdown";
import {
  DEFAULT_USER_FILTERS,
  PACKAGE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  isFiltered,
  type UserFilters,
} from "./usersShared";

type UsersFilterBarProps = {
  applied: UserFilters;
  isLoading: boolean;
  onApply: (filters: UserFilters) => void;
};

const fieldClassName =
  "w-full min-h-11 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 pl-10 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function UsersFilterBar({ applied, isLoading, onApply }: UsersFilterBarProps) {
  const [form, setForm] = useState<UserFilters>(applied);

  const change = <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply({ ...form, search: form.search.trim() });
  };

  const handleReset = () => {
    setForm(DEFAULT_USER_FILTERS);
    onApply(DEFAULT_USER_FILTERS);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label htmlFor="users-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="users-search"
              type="search"
              value={form.search}
              onChange={(event) => change("search", event.target.value)}
              placeholder="Name or mobile number"
              autoComplete="off"
              className={fieldClassName}
            />
          </div>
        </div>

        <div className="min-w-0">
          <CustomDropdown
            id="users-package"
            label="Package"
            staticLabel
            variant="boxed"
            value={form.package}
            options={PACKAGE_FILTER_OPTIONS}
            onChange={(next) => change("package", next as UserFilters["package"])}
          />
        </div>

        <div className="min-w-0">
          <CustomDropdown
            id="users-status"
            label="Subscription status"
            staticLabel
            variant="boxed"
            value={form.status}
            options={STATUS_FILTER_OPTIONS}
            onChange={(next) => change("status", next as UserFilters["status"])}
          />
        </div>

        <div className="flex gap-3 sm:col-span-2 lg:col-span-1">
          {isFiltered(applied) ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-linear-to-r-navy-blue inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
