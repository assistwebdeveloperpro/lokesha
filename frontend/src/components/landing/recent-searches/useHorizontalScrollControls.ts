"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ScrollState = { canScrollLeft: boolean; canScrollRight: boolean };

const INITIAL_STATE: ScrollState = { canScrollLeft: false, canScrollRight: false };
const SCROLL_STEP_RATIO = 0.8;
const EDGE_TOLERANCE_PX = 1;

// Arrows are needed only while the row overflows, so the state follows size and scroll
export function useHorizontalScrollControls<T extends HTMLElement>(itemCount: number) {
  const scrollerRef = useRef<T>(null);
  const [state, setState] = useState<ScrollState>(INITIAL_STATE);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const measure = () => {
      const next = {
        canScrollLeft: node.scrollLeft > EDGE_TOLERANCE_PX,
        canScrollRight:
          node.scrollLeft + node.clientWidth < node.scrollWidth - EDGE_TOLERANCE_PX,
      };
      setState((prev) =>
        prev.canScrollLeft === next.canScrollLeft &&
        prev.canScrollRight === next.canScrollRight
          ? prev
          : next,
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    node.addEventListener("scroll", measure, { passive: true });

    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", measure);
    };
  }, [itemCount]);

  const scrollByStep = useCallback((direction: 1 | -1) => {
    const node = scrollerRef.current;
    node?.scrollBy({ left: direction * node.clientWidth * SCROLL_STEP_RATIO, behavior: "smooth" });
  }, []);

  return { scrollerRef, ...state, scrollByStep };
}
