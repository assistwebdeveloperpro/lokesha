"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ProjectSliderProps = {
  label: string;
  children: ReactNode;
  slideClassName?: string;
};

const arrowClassName =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 opacity-0 shadow-md transition hover:bg-slate-50 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-navy-blue group-hover/slider:enabled:opacity-100 disabled:pointer-events-none md:flex";

const DRAG_THRESHOLD = 5;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ProjectSlider({ label, children, slideClassName }: ProjectSliderProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const dragRef = useRef<{ startX: number; startScroll: number; active: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const slides = Children.toArray(children);

  const getStride = useCallback(() => {
    const [first, second] = Array.from(trackRef.current?.children ?? []) as HTMLElement[];
    return first && second ? second.offsetLeft - first.offsetLeft : (first?.offsetWidth ?? 1);
  }, []);

  const syncPosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 1);
    setCanScrollNext(track.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncPosition();
    const observer = new ResizeObserver(syncPosition);
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncPosition]);

  const scrollByDirection = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;

      const stride = getStride();
      const maxScroll = track.scrollWidth - track.clientWidth;
      const index =
        direction === 1 ? Math.floor((track.scrollLeft + 1) / stride) + 1 : Math.ceil((track.scrollLeft - 1) / stride) - 1;

      track.scrollTo({
        left: Math.min(Math.max(index * stride, 0), maxScroll),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [getStride],
  );

  const handlePointerDown = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = { startX: event.clientX, startScroll: event.currentTarget.scrollLeft, active: false };
  };

  const handlePointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const delta = event.clientX - drag.startX;
    if (!drag.active) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      drag.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }
    event.currentTarget.scrollLeft = drag.startScroll - delta;
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    scrollByDirection(event.key === "ArrowRight" ? 1 : -1);
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} onKeyDown={handleKeyDown}>
      <div className="group/slider relative">
        <ul
          ref={trackRef}
          onScroll={syncPosition}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(event) => event.preventDefault()}
          className={cn(
            "flex scroll-px-2 gap-4 overflow-x-auto overscroll-x-contain px-2 py-3 scrollbar-none motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden",
            isDragging
              ? "cursor-grabbing select-none"
              : "cursor-grab snap-x snap-mandatory scroll-smooth",
          )}
        >
          {slides.map((slide, index) => (
            <li
              key={index}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              className={cn(
                "shrink-0 snap-start",
                slideClassName ?? (slides.length === 1 ? "w-full" : "w-[90%] lg:w-[80%]"),
              )}
            >
              {slide}
            </li>
          ))}
        </ul>

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-5 hidden w-20 bg-linear-to-l from-white via-white/80 to-transparent transition-opacity sm:block",
            canScrollNext ? "opacity-100" : "opacity-0",
          )}
        />

        <button
          type="button"
          aria-label="Previous project"
          disabled={!canScrollPrev}
          onClick={() => scrollByDirection(-1)}
          className={cn(arrowClassName, "left-2")}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next project"
          disabled={!canScrollNext}
          onClick={() => scrollByDirection(1)}
          className={cn(arrowClassName, "right-2")}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </section>
  );
}
