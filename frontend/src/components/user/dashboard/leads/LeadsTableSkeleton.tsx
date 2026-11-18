import { LEADS_GRID_CLASS, LEADS_TABLE_COLUMNS, LEADS_TABLE_MIN_WIDTH_CLASS } from "./leadsShared";

const SKELETON_ROW_COUNT = 6;

const bar = "animate-pulse rounded bg-slate-200/80";

function SkeletonRow() {
  return (
    <li className={`grid gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 ${LEADS_GRID_CLASS}`}>
      <div className="flex items-start gap-3">
        <span className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-200/80" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`${bar} h-4 w-4/5`} />
          <div className="flex gap-1.5">
            <div className={`${bar} h-5 w-14 rounded-md`} />
            <div className={`${bar} h-5 w-16 rounded-md`} />
            <div className={`${bar} h-5 w-12 rounded-md`} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`${bar} h-5 w-5 shrink-0 rounded-full`} />
            <div className={`${bar} h-3 w-2/3`} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-4 w-24`} />
        <div className={`${bar} h-3 w-28`} />
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-4 w-3/4`} />
        <div className="flex items-center gap-2">
          <span className={`${bar} h-5 w-5 shrink-0 rounded-full`} />
          <div className={`${bar} h-3 w-1/2`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`${bar} h-5 w-5 shrink-0 rounded-full`} />
          <div className={`${bar} h-3 w-2/3`} />
        </div>
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-4 w-20`} />
        <div className={`${bar} h-3 w-28`} />
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-5 w-16 rounded-full`} />
        <div className={`${bar} h-3 w-20`} />
      </div>

      <div className={`${bar} h-9 w-28 rounded-xl`} />
    </li>
  );
}

export default function LeadsTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm" aria-busy>
      <div className={LEADS_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${LEADS_GRID_CLASS}`}
          aria-hidden
        >
          {LEADS_TABLE_COLUMNS.map((column) => (
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
