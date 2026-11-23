import type { ReactNode } from "react";

const bar ="animate-pulse rounded bg-slate-200/80";

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

function SectionPanelSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 border-l-4 border-l-slate-200 bg-white px-4 py-4 sm:px-6">
        <span className={`${bar} h-10 w-10 shrink-0 rounded-xl`} />
        <div className="space-y-2">
          <div className={`${bar} h-4 w-40`} />
          <div className={`${bar} h-3 w-80 max-w-full`} />
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export default function SubscribedServicesSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-hidden>
      <div className={`${bar} h-16 w-full rounded-2xl`} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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

      <SectionPanelSkeleton>
        <ul className="grid gap-4 xl:grid-cols-2">
          <SubscriptionCardSkeleton />
          <SubscriptionCardSkeleton />
        </ul>
      </SectionPanelSkeleton>

      <SectionPanelSkeleton>
        <div className="grid items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="bg-linear-to-r-navy-blue flex items-center justify-between gap-3 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 animate-pulse rounded-xl bg-white/15" />
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded-full bg-white/15" />
                <div className="h-4 w-40 animate-pulse rounded bg-white/20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="ml-auto h-6 w-20 animate-pulse rounded bg-white/20" />
              <div className="h-3 w-36 animate-pulse rounded bg-white/15" />
            </div>
          </div>
          <div className="space-y-6 p-5 sm:p-6">
            <div className="space-y-2">
              <div className={`${bar} h-3 w-full`} />
              <div className={`${bar} h-3 w-4/5`} />
            </div>
            <div className="space-y-3">
              <div className={`${bar} h-3 w-36`} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={`${bar} h-24 rounded-xl`} />
                <div className={`${bar} h-24 rounded-xl`} />
              </div>
            </div>
            <div className="space-y-3">
              <div className={`${bar} h-3 w-24`} />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`${bar} h-16 rounded-xl`} />
                <div className={`${bar} h-16 rounded-xl`} />
                <div className={`${bar} h-16 rounded-xl`} />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className={`${bar} h-10 w-10 rounded-xl`} />
            <div className={`${bar} h-4 w-32`} />
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            <div className={`${bar} h-16 w-full rounded-xl`} />
            <div className={`${bar} h-28 w-full rounded-xl`} />
            <div className={`${bar} h-12 w-full rounded-xl`} />
          </div>
        </div>
        </div>
      </SectionPanelSkeleton>
    </div>
  );
}
