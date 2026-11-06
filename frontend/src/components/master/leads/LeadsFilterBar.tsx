"use client";

import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import CustomDropdown from "@/components/shared/CustomDropdown";
import {
  LEAD_PHONE_OPTIONS,
  LEAD_ROLE_OPTIONS,
  type LeadFilters,
  type LeadPhoneFilter,
  type LeadRoleFilter,
} from "./leadsShared";

type LeadsFilterBarProps = {
  applied: LeadFilters;
  onApply: (filters: LeadFilters) => void;
  isLoading?: boolean;
};

const fieldClassName =
  "w-full min-h-11 appearance-none rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 pl-10 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function LeadsFilterBar({ applied, onApply, isLoading = false }: LeadsFilterBarProps) {
  const [search, setSearch] = useState(applied.search);
  const [role, setRole] = useState<LeadRoleFilter>(applied.role);
  const [phone, setPhone] = useState<LeadPhoneFilter>(applied.phone);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply({ search: search.trim(), role, phone });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-2xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50/80 to-sky-50/40 p-4 shadow-[0_1px_3px_rgba(15,23,42,.06),0_8px_24px_rgba(15,23,42,.04)] sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, mobile, email, lister or listing no."
              className={fieldClassName}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="min-w-0">
          <CustomDropdown
            id="leads-filter-role"
            label="Contacted as"
            staticLabel
            variant="boxed"
            value={role}
            options={LEAD_ROLE_OPTIONS}
            onChange={(next) => setRole(next as LeadRoleFilter)}
          />
        </div>

        <div className="min-w-0">
          <CustomDropdown
            id="leads-filter-phone"
            label="Phone"
            staticLabel
            variant="boxed"
            value={phone}
            options={LEAD_PHONE_OPTIONS}
            onChange={(next) => setPhone(next as LeadPhoneFilter)}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1 lg:flex lg:justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-linear-to-r-navy-blue inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-34"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
