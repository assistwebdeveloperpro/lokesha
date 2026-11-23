const bar = "animate-pulse rounded bg-slate-200/80";

// Mirrors the modal body: property summary, quantity stepper and price breakdown
export default function BuyMoreLeadsModalSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-hidden>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <span className={`${bar} h-11 w-11 shrink-0 rounded-xl`} />
          <div className="space-y-2">
            <div className={`${bar} h-4 w-40`} />
            <div className={`${bar} h-3 w-24`} />
          </div>
        </div>
        <div className="space-y-2">
          <div className={`${bar} h-3 w-16`} />
          <div className={`${bar} h-4 w-12`} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <div className={`${bar} h-4 w-24`} />
          <div className={`${bar} h-3 w-14`} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className={`${bar} h-11 w-11 shrink-0 rounded-xl`} />
          <div className={`${bar} h-11 flex-1 rounded-xl`} />
          <div className={`${bar} h-11 w-11 shrink-0 rounded-xl`} />
        </div>
        <div className={`${bar} mt-2 h-3 w-28`} />
      </div>

      <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div className={`${bar} h-4 w-20`} />
          <div className={`${bar} h-4 w-16`} />
        </div>
        <div className="flex items-center justify-between">
          <div className={`${bar} h-4 w-24`} />
          <div className={`${bar} h-4 w-14`} />
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <div className={`${bar} h-5 w-24`} />
          <div className={`${bar} h-6 w-20`} />
        </div>
      </div>
    </div>
  );
}
