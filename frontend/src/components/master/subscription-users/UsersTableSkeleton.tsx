import { USER_GRID_CLASS, USER_TABLE_COLUMNS, USER_TABLE_MIN_WIDTH_CLASS } from "./usersShared";

const ROW_COUNT = 6;

const bar = "animate-pulse rounded bg-slate-200/80";

function SkeletonRow() {
  return (
    <li className={`border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5 ${USER_GRID_CLASS}`}>
      <div className="flex items-center gap-3">
        <div className={`${bar} h-10 w-10 shrink-0 rounded-full`} />
        <div className="w-full space-y-2">
          <div className={`${bar} h-4 w-3/4`} />
          <div className={`${bar} h-3 w-1/2`} />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className={`${bar} h-5 w-12 rounded-full`} />
        <div className={`${bar} h-5 w-16 rounded-full`} />
      </div>
      <div className="space-y-2">
        <div className={`${bar} h-4 w-20`} />
        <div className={`${bar} h-1.5 w-full rounded-full`} />
        <div className={`${bar} h-3 w-12`} />
      </div>
      <div className="space-y-2">
        <div className={`${bar} h-4 w-24`} />
        <div className={`${bar} h-3 w-28`} />
      </div>
      <div className={`${bar} h-4 w-16`} />
      <div className={`${bar} h-6 w-16 rounded-full`} />
      <div className={`${bar} h-6 w-20 rounded-full`} />
      <div className="flex justify-end">
        <div className={`${bar} h-9 w-16 rounded-lg`} />
      </div>
    </li>
  );
}

export default function UsersTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm scrollbar-hidden" aria-busy>
      <div className={USER_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${USER_GRID_CLASS}`}
          aria-hidden
        >
          {USER_TABLE_COLUMNS.map((column, index) => (
            <span key={index}>{column}</span>
          ))}
        </div>
        <ul aria-hidden>
          {Array.from({ length: ROW_COUNT }, (_, index) => (
            <SkeletonRow key={index} />
          ))}
        </ul>
      </div>
    </div>
  );
}
