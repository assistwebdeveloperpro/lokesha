const bar = "animate-pulse rounded bg-slate-200/80";

const TILE_COUNT = 4;

function SubscriptionCardSkeleton() {
  return (
    <li className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`${bar} h-11 w-11 rounded-xl`} />
          <div className="space-y-2">
            <div className={`${bar} h-4 w-36`} />
            <div className={`${bar} h-3 w-24`} />
          </div>
        </div>
        <div className={`${bar} h-6 w-20 rounded-full`} />
      </div>
      <div className="mt-5 space-y-2">
        <div className="flex justify-between">
          <div className={`${bar} h-4 w-24`} />
          <div className={`${bar} h-4 w-20`} />
        </div>
        <div className={`${bar} h-2.5 w-full rounded-full`} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className={`${bar} h-14 rounded-xl`} />
        <div className={`${bar} h-14 rounded-xl`} />
      </div>
    </li>
  );
}

export default function SubscribedServicesSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-hidden>
      <div className={`${bar} h-16 w-full rounded-2xl`} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: TILE_COUNT }, (_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`${bar} h-3 w-20`} />
              <div className={`${bar} h-8 w-8 rounded-lg`} />
            </div>
            <div className={`${bar} mt-3 h-7 w-16`} />
            <div className={`${bar} mt-2 h-3 w-24`} />
          </div>
        ))}
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        <SubscriptionCardSkeleton />
        <SubscriptionCardSkeleton />
      </ul>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="bg-linear-to-r-navy-blue flex items-center gap-3 px-5 py-4 sm:px-6">
          <span className="h-11 w-11 animate-pulse rounded-xl bg-white/15" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-white/20" />
            <div className="h-3 w-56 animate-pulse rounded bg-white/15" />
          </div>
        </div>
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className={`${bar} h-3 w-full`} />
              <div className={`${bar} h-3 w-4/5`} />
            </div>
            <div className={`${bar} h-16 w-full rounded-xl`} />
            <div className={`${bar} h-16 w-full rounded-xl`} />
            <div className="space-y-2.5">
              <div className={`${bar} h-3 w-24`} />
              <div className={`${bar} h-4 w-2/3`} />
              <div className={`${bar} h-4 w-1/2`} />
              <div className={`${bar} h-4 w-3/5`} />
            </div>
          </div>
          <div className="space-y-4 rounded-2xl bg-slate-50/70 p-5 ring-1 ring-slate-100">
            <div className={`${bar} h-5 w-48`} />
            <div className={`${bar} h-28 w-full rounded-xl`} />
            <div className={`${bar} h-12 w-full rounded-xl`} />
          </div>
        </div>
      </div>
    </div>
  );
}
