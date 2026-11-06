import { LEAD_GRID_CLASS, LEAD_TABLE_COLUMNS, LEAD_TABLE_MIN_WIDTH_CLASS } from "./leadsShared";

const SKELETON_ROW_COUNT = 6;

const bar = "animate-pulse rounded bg-slate-200/80";

function SkeletonRow() {
  return (
    <li
      className={`grid gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5 ${LEAD_GRID_CLASS}`}
    >
      <div className="flex items-start gap-3">
        <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200/80" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`${bar} h-4 w-3/4`} />
          <div className={`${bar} h-3 w-1/2`} />
          <div className={`${bar} h-3 w-2/3`} />
        </div>
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-4 w-4/5`} />
        <div className={`${bar} h-3 w-1/3`} />
        <div className="flex gap-1.5">
          <div className={`${bar} h-4 w-16 rounded-full`} />
          <div className={`${bar} h-4 w-12 rounded-full`} />
        </div>
        <div className={`${bar} h-3 w-2/3`} />
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-4 w-3/4`} />
        <div className={`${bar} h-3 w-1/2`} />
        <div className={`${bar} h-4 w-20 rounded-full`} />
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-5 w-16 rounded-full`} />
        <div className={`${bar} h-3 w-20`} />
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-4 w-16`} />
        <div className={`${bar} h-3 w-24`} />
      </div>

      <div className={`${bar} h-6 w-24 rounded-full`} />
    </li>
  );
}

export default function LeadsTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm" aria-busy>
      <div className={LEAD_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${LEAD_GRID_CLASS}`}
          aria-hidden
        >
          {LEAD_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul aria-hidden>
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <SkeletonRow key={index} />
          ))}
        </ul>
      </div>
    </div>
  );
}
