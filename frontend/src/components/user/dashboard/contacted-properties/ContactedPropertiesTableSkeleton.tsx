import { CONTACTED_GRID_CLASS, CONTACTED_TABLE_COLUMNS, CONTACTED_TABLE_MIN_WIDTH_CLASS } from "./contactedPropertiesShared";

const SKELETON_ROW_COUNT = 6;

const bar = "animate-pulse rounded bg-slate-200/80";

function SkeletonRow() {
  return (
    <li className={`grid gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 ${CONTACTED_GRID_CLASS}`}>
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
        <div className={`${bar} h-5 w-16 rounded-full`} />
        <div className={`${bar} h-3 w-24`} />
      </div>

      <div className="space-y-2">
        <div className={`${bar} h-4 w-20`} />
        <div className={`${bar} h-3 w-28`} />
      </div>

      <div className={`${bar} h-6 w-20 rounded-full flex justify-center`} />

      <div className={`${bar} h-9 w-28 rounded-xl`} />
    </li>
  );
}

export default function ContactedPropertiesTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 scrollbar-hidden bg-white shadow-sm" aria-busy>
      <div className={CONTACTED_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[11px] scrollbar-hidden font-bold uppercase tracking-wider text-slate-500 ${CONTACTED_GRID_CLASS}`}
          aria-hidden
        >
          {CONTACTED_TABLE_COLUMNS.map((column) => (
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
