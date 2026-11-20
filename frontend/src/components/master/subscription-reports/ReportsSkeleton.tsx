const bar = "animate-pulse rounded bg-slate-200/80";

// Mirrors the three groups of tiles: 3, 2 and 2
const GROUP_TILE_COUNTS = [3, 2, 2];

export default function ReportsSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-hidden>
      {GROUP_TILE_COUNTS.map((count, groupIndex) => (
        <section key={groupIndex}>
          <div className="mb-3 space-y-2">
            <div className={`${bar} h-5 w-40`} />
            <div className={`${bar} h-3 w-56`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }, (_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className={`${bar} h-3 w-28`} />
                  <div className={`${bar} h-9 w-9 rounded-xl`} />
                </div>
                <div className={`${bar} mt-4 h-8 w-32`} />
                <div className={`${bar} mt-3 h-3 w-44`} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
