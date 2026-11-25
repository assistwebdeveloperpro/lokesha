const bar = "animate-pulse rounded bg-slate-200/80";

const TILE_COUNT = 3;
const FACT_COUNT = 6;

// Mirrors the drawer body: hero image, stat tiles, location, facts and lister cards
export default function LeadPropertyDrawerSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-hidden>
      <div className="animate-pulse aspect-16/9 w-full rounded-2xl bg-slate-200/80" />

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: TILE_COUNT }, (_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
            <div className={`${bar} h-3 w-14`} />
            <div className={`${bar} mt-3 h-5 w-20`} />
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <span className={`${bar} h-10 w-10 shrink-0 rounded-xl`} />
        <div className="flex-1 space-y-2">
          <div className={`${bar} h-4 w-3/4`} />
          <div className={`${bar} h-3 w-1/2`} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <div className={`${bar} h-4 w-32`} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: FACT_COUNT }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className={`${bar} h-3 w-16`} />
              <div className={`${bar} h-4 w-24`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <span className={`${bar} h-11 w-11 shrink-0 rounded-2xl`} />
        <div className="flex-1 space-y-2">
          <div className={`${bar} h-4 w-1/2`} />
          <div className={`${bar} h-3 w-2/3`} />
        </div>
      </div>
    </div>
  );
}
