"use client";

import { Fragment } from "react";
import {
  CATEGORIES,
  CATEGORY_TAB_DEFAULT,
  FILTER_TAB_ACTIVE,
  FILTER_TAB_ACTIVE_FIRST,
  FILTER_TAB_ACTIVE_LAST,
  FOCUS_RING,
  TAB_LIST_CLASS,
  type PropertyCategory,
} from "./heroBanner.shared";

type HeroCategoryTabsProps = {
  activeCategory: PropertyCategory;
  onSelect: (category: PropertyCategory) => void;
};

export function HeroCategoryTabs({
  activeCategory,
  onSelect,
}: HeroCategoryTabsProps) {
  return (
    <div
      className={`${TAB_LIST_CLASS} border-b border-slate-200`}
      role="tablist"
      aria-label="Property categories"
    >
      {CATEGORIES.map((category, index) => {
        const isActive = activeCategory === category.id;
        const isFirst = index === 0;
        const isLast = index === CATEGORIES.length - 1;
        const tabClass = isActive
          ? isFirst
            ? FILTER_TAB_ACTIVE_FIRST
            : isLast
              ? FILTER_TAB_ACTIVE_LAST
              : FILTER_TAB_ACTIVE
          : CATEGORY_TAB_DEFAULT;
        return (
          <Fragment key={category.id}>
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(category.id)}
              className={`relative min-w-max flex-1 shrink-0 whitespace-nowrap hover:cursor-pointer border-b-2 px-4 py-3 text-center text-[0.9375rem] font-semibold transition ${FOCUS_RING} ${
                index < CATEGORIES.length - 1
                  ? "border-r border-slate-200"
                  : ""
              } ${tabClass}`}
            >
              {category.id === "new-projects" ? (
                <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                  <span className="new-projects-badge inline-flex items-center whitespace-nowrap rounded bg-amber-400 px-1.5 py-0.75 text-[10px] font-bold uppercase leading-none tracking-wide text-slate-900">
                    New
                  </span>
                </span>
              ) : null}
              {category.label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
