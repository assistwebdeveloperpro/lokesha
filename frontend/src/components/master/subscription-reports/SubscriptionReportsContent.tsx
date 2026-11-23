"use client";

import { AlertCircle, BadgeIndianRupee, CalendarRange, Clock, Gift, Percent, RotateCcw, Search, TrendingUp, Undo2, UserCheck, type LucideIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import ReportsSkeleton from "./ReportsSkeleton";
import { buildReportGroups, describeRange, type ReportTone } from "./reportsShared";
import { ALL_TIME, useSubscriptionReports, type ReportRange } from "./useSubscriptionReports";

const TILE_ICONS: Record<string, LucideIcon> = {
  revenue: BadgeIndianRupee,
  gst: Percent,
  refunded: Undo2,
  active: UserCheck,
  exhausted: Gift,
  failed: AlertCircle,
  pending: Clock,
};

const TONE_CLASSES: Record<ReportTone, string> = {
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
};

const fieldClassName =
  "w-full min-h-11 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

function RangeForm({ applied, isLoading, onApply }: { applied: ReportRange; isLoading: boolean; onApply: (range: ReportRange) => void }) {
  const [form, setForm] = useState<ReportRange>(applied);
  const rangeError = form.from && form.to && form.from > form.to ? "From date cannot be after the to date" : "";
  const isApplied = applied.from !== "" || applied.to !== "";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!rangeError) onApply(form);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
          <CalendarRange className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold text-slate-800">Filter by date</h2>
          <p className="text-xs text-slate-500">Leave both empty to see all time</p>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="reports-from" className="mb-1.5 block text-xs font-medium text-slate-600">
            From
          </label>
          <input id="reports-from" type="date" value={form.from} max={form.to || undefined} onChange={(event) => setForm({ ...form, from: event.target.value })} className={fieldClassName} />
        </div>
        <div>
          <label htmlFor="reports-to" className="mb-1.5 block text-xs font-medium text-slate-600">
            To
          </label>
          <input id="reports-to" type="date" value={form.to} min={form.from || undefined} onChange={(event) => setForm({ ...form, to: event.target.value })} className={fieldClassName} />
        </div>
        <div className="flex gap-3">
          {isApplied ? (
            <button
              type="button"
              onClick={() => {
                setForm(ALL_TIME);
                onApply(ALL_TIME);
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              All time
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isLoading || Boolean(rangeError)}
            className="bg-linear-to-r-navy-blue inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden />
            Apply
          </button>
        </div>
        {rangeError ? (
          <p className="text-xs font-medium text-red-500 sm:col-span-3" role="alert">
            {rangeError}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export default function SubscriptionReportsContent() {
  const { range, overview, isLoading, error, applyRange, reload } = useSubscriptionReports();
  const groups = overview ? buildReportGroups(overview) : [];

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
            <TrendingUp className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Subscription Reports</h1>
            <p className="text-sm text-slate-500">How the packages are doing</p>
          </div>
        </div>
        {overview && !isLoading ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3.5 py-1.5 text-sm font-semibold text-sky-700 ring-1 ring-sky-200">
            {describeRange(overview.range)}
          </span>
        ) : null}
      </header>

      <RangeForm applied={range} isLoading={isLoading} onApply={applyRange} />

      <section className="mt-6" aria-live="polite">
        {isLoading ? (
          <ReportsSkeleton />
        ) : error || !overview ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <section
                key={group.title}
                aria-labelledby={`report-${group.title}`}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                  <h2 id={`report-${group.title}`} className="font-display texe-base font-semibold text-slate-800">
                    {group.title}
                  </h2>
                  <p className="text-xs text-slate-500">{group.text}</p>
                </div>
                <dl className={cn("grid divide-y divide-slate-100 sm:divide-x sm:divide-y-0", group.tiles.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
                  {group.tiles.map((tile) => {
                    const Icon = TILE_ICONS[tile.key];

                    return (
                      <div key={tile.key} className="p-5">
                        <div className="flex items-center gap-2.5">
                          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[tile.tone])}>
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <dt className="text-xs font-medium text-slate-500">{tile.label}</dt>
                        </div>
                        <dd className="mt-3 font-display text-xl font-semibold text-slate-800">{tile.value}</dd>
                        <p className="mt-1 text-xs text-slate-500">{tile.hint}</p>
                      </div>
                    );
                  })}
                </dl>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
