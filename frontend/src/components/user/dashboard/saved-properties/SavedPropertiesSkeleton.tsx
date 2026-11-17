import { SAVED_CARD_IMAGE_ASPECT_CLASS, SAVED_GRID_CLASS, SAVED_PAGE_SIZE } from "./savedPropertiesShared";

const bar = "animate-pulse rounded bg-slate-200/80";

function SkeletonCard() {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className={`animate-pulse bg-slate-200/80 ${SAVED_CARD_IMAGE_ASPECT_CLASS}`} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`${bar} h-4 w-3/4`} />
            <div className={`${bar} h-3.5 w-1/2`} />
          </div>
          <div className="flex shrink-0 gap-2">
            <span className="h-9 w-9 animate-pulse rounded-xl bg-slate-200/80" />
            <span className="h-9 w-9 animate-pulse rounded-xl bg-slate-200/80" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
          <span className={`${bar} h-4 w-4 shrink-0 rounded-full`} />
          <div className={`${bar} h-3.5 w-2/3`} />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className={`${bar} h-4 w-1/3`} />
          <div className={`${bar} h-5 w-24`} />
        </div>

        <div className={`${bar} mt-4 h-3 w-28`} />
      </div>
    </li>
  );
}

export default function SavedPropertiesSkeleton() {
  return (
    <ul className={SAVED_GRID_CLASS} aria-busy aria-hidden>
      {Array.from({ length: SAVED_PAGE_SIZE }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </ul>
  );
}
