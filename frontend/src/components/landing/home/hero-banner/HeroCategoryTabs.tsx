"use client";

import { Fragment, useEffect, useRef } from "react";
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
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = list.scrollLeft;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      list.scrollLeft = startScroll - delta;
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onClickCapture = (event: MouseEvent) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    };
    const onWheel = (event: WheelEvent) => {
      if (list.scrollWidth <= list.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      list.scrollLeft += event.deltaY;
    };

    list.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    list.addEventListener("click", onClickCapture, true);
    list.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      list.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      list.removeEventListener("click", onClickCapture, true);
      list.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={listRef}
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
              className={`relative min-w-max flex-1 shrink-0 whitespace-nowrap hover:cursor-pointer border-b-2 px-4 py-3 text-center text-[0.8375rem] sm:text-[0.9375rem] font-semibold transition ${FOCUS_RING} ${
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
