import {
  STRIP_ARROW_SLOT_CLASS,
  STRIP_CARD_SIZE_CLASS,
  STRIP_LABEL_CLASS,
  STRIP_LIST_CLASS,
  STRIP_ROW_CLASS,
  STRIP_SCROLLER_ROW_CLASS,
  STRIP_SKELETON_CARD_CLASS,
  STRIP_SKELETON_COUNT,
  STRIP_WRAPPER_CLASS,
} from "./recentSearchesStrip.shared";

export function RecentSearchesStripSkeleton() {
  return (
    <div className={STRIP_WRAPPER_CLASS} aria-hidden>
      <div className={STRIP_ROW_CLASS}>
        <span className={`${STRIP_LABEL_CLASS} h-5 w-28 animate-pulse rounded bg-white/40`} />
        <div className={STRIP_SCROLLER_ROW_CLASS}>
          <span className={STRIP_ARROW_SLOT_CLASS} />
          <ul className={`${STRIP_LIST_CLASS} min-w-0 flex-1 overflow-hidden`}>
            {Array.from({ length: STRIP_SKELETON_COUNT }, (_, index) => (
              <li key={index} className={`${STRIP_CARD_SIZE_CLASS} ${STRIP_SKELETON_CARD_CLASS} animate-pulse bg-white/60`} />
            ))}
          </ul>
          <span className={STRIP_ARROW_SLOT_CLASS} />
        </div>
      </div>
    </div>
  );
}
