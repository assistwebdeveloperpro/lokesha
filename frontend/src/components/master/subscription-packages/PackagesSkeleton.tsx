const bar = "animate-pulse rounded bg-slate-200/80";

const PACKAGE_COUNT = 3;
const STAT_COUNT = 4;
const BENEFIT_COUNT = 3;

// Mirrors PackageCard: navy header, stat tiles, benefit list and the two actions
function PackageCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="bg-linear-to-r-navy-blue flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-white/15" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
            <div className="h-3 w-20 animate-pulse rounded bg-white/15" />
          </div>
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/20" />
      </div>

      <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-2">
          <div className={`${bar} h-3 w-full`} />
          <div className={`${bar} h-3 w-4/5`} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {Array.from({ length: STAT_COUNT }, (_, index) => (
            <div key={index} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-3.5">
              <div className={`${bar} h-3 w-20`} />
              <div className={`${bar} h-5 w-16`} />
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          <div className={`${bar} h-3 w-24`} />
          {Array.from({ length: BENEFIT_COUNT }, (_, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <span className={`${bar} h-4 w-4 shrink-0 rounded-full`} />
              <div className={`${bar} h-3 w-3/5`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className={`${bar} h-3 w-32`} />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <div className={`${bar} h-10 w-full rounded-xl sm:w-24`} />
          <div className={`${bar} h-10 w-full rounded-xl sm:w-28`} />
        </div>
      </div>
    </li>
  );
}

export default function PackagesSkeleton() {
  return (
    <ul className="grid gap-4 sm:gap-6 xl:grid-cols-2" aria-busy aria-hidden>
      {Array.from({ length: PACKAGE_COUNT }, (_, index) => (
        <PackageCardSkeleton key={index} />
      ))}
    </ul>
  );
}
