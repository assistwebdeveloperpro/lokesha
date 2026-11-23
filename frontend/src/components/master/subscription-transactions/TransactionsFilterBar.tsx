"use client";

import { Download, Loader2, RotateCcw, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import CustomDropdown from "@/components/shared/CustomDropdown";
import {
  DEFAULT_TRANSACTION_FILTERS,
  STATUS_FILTER_OPTIONS,
  getRangeError,
  isFiltered,
  type TransactionFilters,
} from "./transactionsShared";

type TransactionsFilterBarProps = {
  applied: TransactionFilters;
  isLoading: boolean;
  isExporting: boolean;
  onApply: (filters: TransactionFilters) => void;
  onExport: () => void;
};

const fieldClassName =
  "w-full min-h-11 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function TransactionsFilterBar({ applied, isLoading, isExporting, onApply, onExport }: TransactionsFilterBarProps) {
  const [form, setForm] = useState<TransactionFilters>(applied);
  const rangeError = getRangeError(form);

  const change = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (rangeError) return;
    onApply({ ...form, search: form.search.trim() });
  };

  const handleReset = () => {
    setForm(DEFAULT_TRANSACTION_FILTERS);
    onApply(DEFAULT_TRANSACTION_FILTERS);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="min-w-0 sm:col-span-2 md:col-span-3 xl:col-span-1">
          <label htmlFor="transactions-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="transactions-search"
              type="search"
              value={form.search}
              onChange={(event) => change("search", event.target.value)}
              placeholder="Order no., name, mobile or Razorpay id"
              autoComplete="off"
              className={`${fieldClassName} pl-10`}
            />
          </div>
        </div>

        <div className="min-w-0 sm:col-span-2 md:col-span-1">
          <CustomDropdown
            id="transactions-status"
            label="Status"
            staticLabel
            variant="boxed"
            value={form.status}
            options={STATUS_FILTER_OPTIONS}
            onChange={(next) => change("status", next as TransactionFilters["status"])}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="transactions-from" className="mb-1.5 block text-sm font-medium text-slate-700">
            From
          </label>
          <input id="transactions-from" type="date" value={form.from} max={form.to || undefined} onChange={(event) => change("from", event.target.value)} className={fieldClassName} />
        </div>

        <div className="min-w-0">
          <label htmlFor="transactions-to" className="mb-1.5 block text-sm font-medium text-slate-700">
            To
          </label>
          <input id="transactions-to" type="date" value={form.to} min={form.from || undefined} onChange={(event) => change("to", event.target.value)} className={fieldClassName} />
        </div>
      </div>

      {rangeError ? (
        <p className="mt-3 text-xs font-medium text-red-500" role="alert">
          {rangeError}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={isExporting}
          onClick={onExport}
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl sm:w-auto border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isFiltered(applied) ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl sm:w-auto border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isLoading || Boolean(rangeError)}
            className="bg-linear-to-r-navy-blue inline-flex min-h-11 w-full cursor-pointer sm:w-auto items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden />
            Apply filters
          </button>
        </div>
      </div>
    </form>
  );
}
