const ROW_COUNT = 4;

const bar = "animate-pulse rounded bg-slate-200/80";

export default function SubscriptionHistorySkeleton() {
  return (
    <ul className="space-y-3" aria-busy aria-hidden>
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <li key={index} className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:px-5">
          <div className="flex min-w-[200px] flex-1 items-center gap-3">
            <span className={`${bar} h-11 w-11 shrink-0 rounded-xl`} />
            <div className="flex-1 space-y-2">
              <div className={`${bar} h-4 w-32`} />
              <div className={`${bar} h-3 w-24`} />
            </div>
          </div>
          <div className="min-w-[150px] space-y-2">
            <div className={`${bar} h-4 w-32`} />
            <div className={`${bar} h-3 w-20`} />
          </div>
          <div className="min-w-[170px] space-y-2">
            <div className={`${bar} h-4 w-24`} />
            <div className={`${bar} h-3 w-28`} />
          </div>
          <div className={`${bar} h-6 w-16 rounded-full`} />
        </li>
      ))}
    </ul>
  );
}
