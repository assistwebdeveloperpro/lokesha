import {
  RECENT_SEARCH_ROW_CLASS,
  RECENT_SEARCHES_LIST_CLASS,
  RECENT_SEARCHES_SKELETON_COUNT,
} from "./recentSearchesShared";

const bar = "animate-pulse rounded bg-slate-200/80";

export default function RecentSearchesSkeleton() {
  return (
    <ul className={RECENT_SEARCHES_LIST_CLASS} aria-busy aria-hidden>
      {Array.from({ length: RECENT_SEARCHES_SKELETON_COUNT }, (_, index) => (
        <li key={index} className={`${RECENT_SEARCH_ROW_CLASS} border-slate-200/90 bg-white`}>
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`${bar} h-4 w-2/3 max-w-sm`} />
            <div className={`${bar} h-3.5 w-1/4 max-w-40`} />
          </div>
          <span className={`${bar} h-4 w-4 shrink-0`} />
          <span className={`${bar} h-8 w-8 shrink-0 rounded-full`} />
        </li>
      ))}
    </ul>
  );
}
