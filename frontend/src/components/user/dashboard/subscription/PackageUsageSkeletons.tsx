const bar = "animate-pulse rounded bg-slate-200/80";

const TILE_COUNT = 4;
const USAGE_ROW_COUNT = 3;
const LEDGER_ROW_COUNT = 5;

export function CreditSummaryTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy aria-hidden>
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
  );
}

export function PropertyLeadUsageSkeleton() {
  return (
    <ul className="space-y-4" aria-busy aria-hidden>
      {Array.from({ length: USAGE_ROW_COUNT }, (_, index) => (
        <li key={index} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`${bar} h-11 w-11 shrink-0 rounded-xl`} />
              <div className="space-y-2">
                <div className={`${bar} h-4 w-44`} />
                <div className={`${bar} h-3 w-32`} />
              </div>
            </div>
            <div className={`${bar} h-6 w-16 rounded-full`} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 3 }, (_, statIndex) => (
              <div key={statIndex} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                <div className={`${bar} h-8 w-8 shrink-0 rounded-lg`} />
                <div className="space-y-1.5">
                  <div className={`${bar} h-3 w-12`} />
                  <div className={`${bar} h-4 w-8`} />
                </div>
              </div>
            ))}
          </div>
          <div className={`${bar} mt-4 h-2.5 w-full rounded-full`} />
        </li>
      ))}
    </ul>
  );
}

export function CreditLedgerSkeleton() {
  return (
    <ul className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm" aria-busy aria-hidden>
      {Array.from({ length: LEDGER_ROW_COUNT }, (_, index) => (
        <li key={index} className="flex items-center gap-5 border-b border-slate-100 px-4 py-3.5 last:border-b-0 sm:px-5">
          <span className={`${bar} h-10 w-12 shrink-0 rounded-lg`} />
          <div className="flex-1 space-y-2">
            <div className={`${bar} h-4 w-2/3`} />
            <div className={`${bar} h-3 w-32`} />
          </div>
          <div className={`${bar} h-6 w-24 rounded-full`} />
        </li>
      ))}
    </ul>
  );
}
