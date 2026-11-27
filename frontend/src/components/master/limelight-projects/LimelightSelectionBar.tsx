import { pluralizeProjects } from "./limelightShared";

type LimelightSelectionBarProps = {
  count: number;
  addLabel: string;
  isAdding: boolean;
  onAdd: () => void;
  onClear: () => void;
};

export default function LimelightSelectionBar({
  count,
  addLabel,
  isAdding,
  onAdd,
  onClear,
}: LimelightSelectionBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-label="Selected projects"
      className="sticky bottom-4 z-20 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
    >
      <p className="text-sm font-semibold text-slate-800" aria-live="polite">
        {pluralizeProjects(count)} selected
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClear}
          disabled={isAdding}
          className="min-h-10 cursor-pointer rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear Selection
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={isAdding}
          className="bg-linear-to-r-navy-blue min-h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}
