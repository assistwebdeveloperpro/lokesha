"use client";

import { Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import CustomDropdown from "@/components/shared/CustomDropdown";
import {
  MANAGE_ROLE_FILTER_OPTIONS,
  MANAGE_STATUS_FILTER_OPTIONS,
  type ListedByRoleFilter,
} from "./managePropertiesFilterOptions";
import type { ManagePropertyFilters } from "./useManageProperties";

type ManagePropertiesFilterPanelProps = {
  applied: ManagePropertyFilters;
  onApply: (filters: ManagePropertyFilters) => void;
  isLoading?: boolean;
};

const fieldClassName =
  "w-full min-h-11 appearance-none rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function ManagePropertiesFilterPanel({
  applied,
  onApply,
  isLoading = false,
}: ManagePropertiesFilterPanelProps) {
  const [projectName, setProjectName] = useState(applied.projectName);
  const [role, setRole] = useState<ListedByRoleFilter>(applied.role);
  const [status, setStatus] = useState(applied.status);

  useEffect(() => {
    setProjectName(applied.projectName);
    setRole(applied.role);
    setStatus(applied.status);
  }, [applied]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onApply({ projectName: projectName.trim(), role, status });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50/80 to-sky-50/40 p-4 shadow-[0_1px_3px_rgba(15,23,42,.06),0_8px_24px_rgba(15,23,42,.04)] sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="bg-linear-to-r-navy-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
          <Filter className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 sm:text-lg">Filters</h2>
          <p className="text-xs text-slate-500 sm:text-sm">Narrow listings by project, role, or status</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label htmlFor="manage-filter-project" className="mb-1.5 block text-sm font-medium text-slate-700">
            Project name
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              id="manage-filter-project"
              type="search"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Search society, building, or project"
              className={`${fieldClassName} pl-10`}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="min-w-0">
          <CustomDropdown
            id="manage-filter-role"
            label="Role"
            staticLabel
            variant="boxed"
            value={role}
            options={MANAGE_ROLE_FILTER_OPTIONS}
            onChange={(next) => setRole(next as ListedByRoleFilter)}
          />
        </div>

        <div className="min-w-0">
          <CustomDropdown
            id="manage-filter-status"
            label="Status"
            staticLabel
            variant="boxed"
            value={status}
            options={MANAGE_STATUS_FILTER_OPTIONS}
            onChange={(next) => setStatus(next as ManagePropertyFilters["status"])}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1 lg:flex lg:justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 text-sm font-semibold text-white shadow-md shadow-sky-900/15 transition hover:bg-sky-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-34"
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filter
          </button>
        </div>
      </div>
    </form>
  );
}
