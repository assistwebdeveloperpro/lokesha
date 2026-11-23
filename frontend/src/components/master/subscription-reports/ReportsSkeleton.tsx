const bar = "animate-pulse rounded bg-slate-200/80";

// Mirrors the three groups of tiles: 3, 2 and 2
const GROUP_TILE_COUNTS = [3, 2, 2];

export default function ReportsSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-hidden>
      {GROUP_TILE_COUNTS.map((count, groupIndex) => (
        <section key={groupIndex} className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="space-y-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
            <div className={`${bar} h-4 w-32`} />
            <div className={`${bar} h-3 w-48`} />
          </div>
          <div className={`grid divide-y divide-slate-100 sm:divide-x sm:divide-y-0 ${count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            {Array.from({ length: count }, (_, index) => (
              <div key={index} className="p-5">
                <div className="flex items-center gap-2.5">
                  <div className={`${bar} h-8 w-8 rounded-lg`} />
                  <div className={`${bar} h-3 w-28`} />
                </div>
                <div className={`${bar} mt-3 h-6 w-28`} />
                <div className={`${bar} mt-2 h-3 w-40`} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
