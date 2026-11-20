const bar = "animate-pulse rounded bg-slate-200/80";

const STAT_COUNT = 4;
const BENEFIT_COUNT = 3;

// Mirrors PackageCard: navy header, stat tiles, benefit list and the two actions
function PackageCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="bg-linear-to-r-navy-blue flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-white/15" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
            <div className="h-3 w-20 animate-pulse rounded bg-white/15" />
          </div>
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/20" />
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="space-y-2">
          <div className={`${bar} h-3 w-full`} />
          <div className={`${bar} h-3 w-4/5`} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: STAT_COUNT }, (_, index) => (
            <div key={index} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
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

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
        <div className={`${bar} h-3 w-32`} />
        <div className="flex gap-2">
          <div className={`${bar} h-10 w-24 rounded-xl`} />
          <div className={`${bar} h-10 w-28 rounded-xl`} />
        </div>
      </div>
    </li>
  );
}

export default function PackagesSkeleton() {
  return (
    <ul className="grid gap-6 lg:grid-cols-2" aria-busy aria-hidden>
      <PackageCardSkeleton />
      <PackageCardSkeleton />
    </ul>
  );
}
