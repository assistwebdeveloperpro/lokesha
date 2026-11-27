"use client";

import { SearchX } from "lucide-react";
import ListPagination from "@/components/shared/ui/ListPagination";
import LimelightFilterPanel from "./LimelightFilterPanel";
import LimelightResultCard from "./LimelightResultCard";
import LimelightSelectionBar from "./LimelightSelectionBar";
import { LIMELIGHT_GRID_CLASS, LimelightResultsSkeleton } from "./LimelightSkeletons";
import { LIMELIGHT_SEARCH_PAGE_SIZE } from "./limelightShared";
import type { ProjectSelectionConfig } from "./projectSelectionConfig";
import type { useLimelightSearch } from "./useLimelightSearch";

type LimelightFindProjectsProps = {
  config: ProjectSelectionConfig;
  search: ReturnType<typeof useLimelightSearch>;
  onRequestAdd: () => void;
};

export default function LimelightFindProjects({ config, search, onRequestAdd }: LimelightFindProjectsProps) {
  const {
    draft,
    setDraft,
    page,
    items,
    total,
    isLoading,
    error,
    selected,
    isAdding,
    toggleSelected,
    clearSelection,
  } = search;

  return (
    <section aria-label="Find projects">
      <LimelightFilterPanel
        filters={draft}
        isLoading={isLoading}
        config={config}
        onChange={setDraft}
        onSearch={search.search}
        onReset={search.reset}
      />

      <div className="mt-5" aria-live="polite">
        {isLoading ? (
          <LimelightResultsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={search.reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <SearchX className="h-9 w-9 text-slate-400" aria-hidden />
            <h3 className="font-display mt-4 text-lg font-bold text-slate-800">No projects found</h3>
            <p className="mt-1.5 text-sm text-slate-500">Try changing the filters to find more builder projects.</p>
          </div>
        ) : (
          <>
            <ul className={LIMELIGHT_GRID_CLASS}>
              {items.map((project) => (
                <LimelightResultCard
                  key={project.projectId}
                  project={project}
                  isSelected={selected.has(project.projectId)}
                  onToggle={toggleSelected}
                />
              ))}
            </ul>
            <ListPagination
              page={page}
              pageSize={LIMELIGHT_SEARCH_PAGE_SIZE}
              total={total}
              onPageChange={search.changePage}
            />
          </>
        )}
      </div>

      <LimelightSelectionBar
        count={selected.size}
        addLabel={`Add to ${config.name}`}
        isAdding={isAdding}
        onAdd={onRequestAdd}
        onClear={clearSelection}
      />
    </section>
  );
}
