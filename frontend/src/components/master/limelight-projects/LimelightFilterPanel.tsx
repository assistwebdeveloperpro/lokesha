"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import type { FormEvent } from "react";
import CustomDropdown, { type DropdownOption } from "@/components/shared/CustomDropdown";
import { getDropdownFilterStyle } from "@/components/shared/ui/filterWidth";
import {
  LAUNCH_PERIOD_OPTIONS,
  LISTED_BY_OPTIONS,
  POSSESSION_OPTIONS,
  type LimelightFilters,
} from "./limelightShared";
import type { ProjectSelectionConfig } from "./projectSelectionConfig";

type LimelightFilterPanelProps = {
  filters: LimelightFilters;
  isLoading: boolean;
  config: ProjectSelectionConfig;
  onChange: (filters: LimelightFilters) => void;
  onSearch: () => void;
  onReset: () => void;
};

type TextKey = "keyword" | "city" | "locality";
type SelectKey = "possessionStatus" | "listedBy" | "launchPeriod";

const inputClassName =
  "w-full min-h-11 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition placeholder:font-normal placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

const TEXT_FIELDS: { key: TextKey; label: string; placeholder: string }[] = [
  { key: "keyword", label: "Search", placeholder: " Search project name, builder or listing number" },
  { key: "city", label: "City", placeholder: "e.g. Ahmedabad" },
  { key: "locality", label: "Locality", placeholder: "e.g. Bopal" },
];

const SELECT_FIELDS: { key: SelectKey; label: string; options: DropdownOption[] }[] = [
  { key: "possessionStatus", label: "Possession status", options: POSSESSION_OPTIONS },
  { key: "listedBy", label: "Property listed by", options: LISTED_BY_OPTIONS },
  { key: "launchPeriod", label: "Launched within", options: LAUNCH_PERIOD_OPTIONS },
];

const isFieldEnabled = (key: SelectKey, config: ProjectSelectionConfig) => {
  if (key === "listedBy") return config.showListedByFilter;
  if (key === "launchPeriod") return Boolean(config.showLaunchPeriodFilter);
  return true;
};

export default function LimelightFilterPanel({
  filters,
  isLoading,
  config,
  onChange,
  onSearch,
  onReset,
}: LimelightFilterPanelProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50/80 to-sky-50/40 p-5 shadow-[0_1px_3px_rgba(15,23,42,.06),0_8px_24px_rgba(15,23,42,.04)]"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="bg-linear-to-r-navy-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
          <Filter className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">Find Projects</h2>
          <p className="text-sm text-slate-500">Only published projects can be added to {config.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        {TEXT_FIELDS.map(({ key, label, placeholder }) => (
          <div
            key={key}
            className={`min-w-0 w-full sm:w-auto ${key === "keyword" ? "sm:min-w-96 sm:flex-2" : "sm:min-w-52 sm:flex-1"}`}
          >
            <label htmlFor={`limelight-filter-${key}`} className="mb-1.5 block text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              id={`limelight-filter-${key}`}
              type="text"
              value={filters[key]}
              maxLength={150}
              autoComplete="off"
              placeholder={placeholder}
              onChange={(event) => onChange({ ...filters, [key]: event.target.value })}
              className={`${inputClassName} ${key === "keyword" ? "focus:border-slate-200/90! focus:ring-0!" : ""}`}
            />
          </div>
        ))}

        {SELECT_FIELDS.filter(({ key }) => isFieldEnabled(key, config)).map(({ key, label, options }) => (
          <div key={key} className="min-w-0" style={getDropdownFilterStyle(label, options)}>
            <CustomDropdown
              id={`limelight-filter-${key}`}
              label={label}
              staticLabel
              variant="boxed"
              value={filters[key]}
              options={options}
              onChange={(next) => onChange({ ...filters, [key]: next })}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset Filters
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-linear-to-r-navy-blue inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-4 w-4" aria-hidden />
          Search
        </button>
      </div>
    </form>
  );
}
