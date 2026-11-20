const bar = "animate-pulse rounded bg-slate-200/80";

const LIST_ROW_COUNT = 3;
const TILE_COUNT = 4;

export function PaymentsListSkeleton() {
  return (
    <ul className="space-y-3" aria-busy aria-hidden>
      {Array.from({ length: LIST_ROW_COUNT }, (_, index) => (
        <li key={index} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className={`${bar} h-4 w-40`} />
              <div className={`${bar} h-3 w-28`} />
            </div>
            <div className={`${bar} h-6 w-16 rounded-full`} />
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="space-y-2">
              <div className={`${bar} h-4 w-36`} />
              <div className={`${bar} h-3 w-52`} />
            </div>
            <div className="flex gap-2">
              <div className={`${bar} h-9 w-20 rounded-lg`} />
              <div className={`${bar} h-9 w-20 rounded-lg`} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ActionsListSkeleton() {
  return (
    <ul className="space-y-3" aria-busy aria-hidden>
      {Array.from({ length: LIST_ROW_COUNT }, (_, index) => (
        <li key={index} className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className={`${bar} h-10 w-10 shrink-0 rounded-xl`} />
          <div className="flex-1 space-y-2">
            <div className={`${bar} h-4 w-40`} />
            <div className={`${bar} h-3 w-3/4`} />
            <div className={`${bar} h-3 w-2/3`} />
            <div className={`${bar} h-3 w-32`} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Mirrors the drawer body: summary tiles, a current plan card and the tab bar
export function UserDetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-hidden>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: TILE_COUNT }, (_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <div className={`${bar} h-3 w-20`} />
            <div className={`${bar} mt-3 h-7 w-14`} />
            <div className={`${bar} mt-2 h-3 w-24`} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`${bar} h-11 w-11 rounded-xl`} />
          <div className="space-y-2">
            <div className={`${bar} h-4 w-36`} />
            <div className={`${bar} h-3 w-24`} />
          </div>
        </div>
        <div className={`${bar} mt-5 h-2.5 w-full rounded-full`} />
      </div>
      <div className={`${bar} h-11 w-full rounded-xl`} />
    </div>
  );
}
