"use client";

import { Save } from "lucide-react";
import type { LimelightEntry } from "@/services/adminLimelightProjects.service";
import LimelightCurrentCard from "./LimelightCurrentCard";
import { LIMELIGHT_GRID_CLASS, LimelightEntriesSkeleton } from "./LimelightSkeletons";
import { pluralizeProjects } from "./limelightShared";
import type { ProjectSelectionConfig } from "./projectSelectionConfig";
import type { useLimelightEntries } from "./useLimelightEntries";

type LimelightCurrentGridProps = {
  config: ProjectSelectionConfig;
  entriesState: ReturnType<typeof useLimelightEntries>;
  onRequestRemove: (entry: LimelightEntry) => void;
};

export default function LimelightCurrentGrid({ config, entriesState, onRequestRemove }: LimelightCurrentGridProps) {
  const { entries, isLoading, error, isSaving, isOrderChanged, move, saveOrder, reload } = entriesState;
  const { name, currentTitle, icon: Icon } = config;

  return (
    <section
      aria-labelledby="limelight-current-heading"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 border-l-4 border-l-sky-500 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="limelight-current-heading" className="font-display text-base font-bold text-slate-800 lg:text-lg">
              {currentTitle}
            </h2>
            <p className="text-sm text-slate-500">Use the arrows on each card to set the display order</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && !error ? (
            <span className="inline-flex items-center rounded-full bg-sky-50 px-3.5 py-1.5 text-sm font-semibold text-sky-700 ring-1 ring-sky-200">
              {pluralizeProjects(entries.length)} in {name}
            </span>
          ) : null}
          <button
            type="button"
            onClick={saveOrder}
            disabled={!isOrderChanged || isSaving}
            className="bg-linear-to-r-navy-blue inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden />
            {isSaving ? "Saving..." : "Save Order"}
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6" aria-live="polite">
        {isLoading ? (
          <LimelightEntriesSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-sm">
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
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
            No projects in {name} yet. Use the filters above to find and add projects.
          </div>
        ) : (
          <ul className={LIMELIGHT_GRID_CLASS}>
            {entries.map((entry, index) => (
              <LimelightCurrentCard
                key={entry.projectId}
                entry={entry}
                position={index + 1}
                isFirst={index === 0}
                isLast={index === entries.length - 1}
                onMove={(offset) => move(index, index + offset)}
                onRemove={onRequestRemove}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
