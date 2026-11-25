"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { RecentSearchesStripSkeleton } from "./RecentSearchesStripSkeleton";
import { getRecentSearchHref } from "./recentSearchRestore";
import { useRecentSearchesStore } from "./recentSearchesStore";
import {
  STRIP_ARROW_CLASS,
  STRIP_CARD_CLASS,
  STRIP_LABEL,
  STRIP_LABEL_CLASS,
  STRIP_LIMIT,
  STRIP_LIST_CLASS,
  STRIP_ROW_CLASS,
  STRIP_SCROLLER_ROW_CLASS,
  STRIP_WRAPPER_CLASS,
} from "./recentSearchesStrip.shared";
import { useHorizontalScrollControls } from "./useHorizontalScrollControls";

export function RecentSearchesStrip() {
  const { items, isLoading } = useRecentSearchesStore(STRIP_LIMIT);
  const { scrollerRef, canScrollLeft, canScrollRight, scrollByStep } =
    useHorizontalScrollControls<HTMLUListElement>(items.length);
  const hasOverflow = canScrollLeft || canScrollRight;

  if (isLoading) return <RecentSearchesStripSkeleton />;
  if (items.length === 0) return null;

  return (
    <section className={STRIP_WRAPPER_CLASS} aria-label="Recent searches">
      <div className={STRIP_ROW_CLASS}>
        <h2 className={STRIP_LABEL_CLASS}>{STRIP_LABEL}</h2>

        <div className={STRIP_SCROLLER_ROW_CLASS}>
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll recent searches left"
            className={`${STRIP_ARROW_CLASS} ${hasOverflow ? "" : "invisible"}`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          <ul ref={scrollerRef} className={`${STRIP_LIST_CLASS} min-w-0 flex-1`}>
            {items.map((item) => (
              <li key={item.id} className="shrink-0">
                <Link href={getRecentSearchHref(item)} title={item.title} className={STRIP_CARD_CLASS}>
                  <span className="lg:line-clamp-2">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => scrollByStep(1)}
            disabled={!canScrollRight}
            aria-label="Scroll recent searches right"
            className={`${STRIP_ARROW_CLASS} ${hasOverflow ? "" : "invisible"}`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
