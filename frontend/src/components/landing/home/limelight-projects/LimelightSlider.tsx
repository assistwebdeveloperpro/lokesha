"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type LimelightSliderProps = {
  label: string;
  children: ReactNode;
};

const arrowClassName =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 opacity-0 shadow-lg transition hover:bg-slate-50 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-navy-blue group-hover/slider:enabled:opacity-100 disabled:pointer-events-none md:flex";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function LimelightSlider({ label, children }: LimelightSliderProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
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
    setActiveIndex(track.scrollLeft >= maxScroll - 1 ? slides.length - 1 : Math.round(track.scrollLeft / getStride()));
  }, [getStride, slides.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncPosition();
    const observer = new ResizeObserver(syncPosition);
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncPosition]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const target = Math.min(Math.max(index, 0), slides.length - 1);
      trackRef.current?.scrollTo({
        left: target * getStride(),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [getStride, slides.length],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    scrollToIndex(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} onKeyDown={handleKeyDown}>
      <div className="group/slider relative">
        <ul
          ref={trackRef}
          onScroll={syncPosition}
          className="flex snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-2 py-3 scrollbar-none motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, index) => (
            <li
              key={index}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              className={cn(
                "shrink-0 snap-start",
                slides.length === 1 ? "w-full" : "w-[90%] lg:w-[80%]",
              )}
            >
              {slide}
            </li>
          ))}
        </ul>

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-linear-to-l from-white via-white/80 to-transparent transition-opacity sm:w-20",
            canScrollNext ? "opacity-100" : "opacity-0",
          )}
        />

        <button
          type="button"
          aria-label="Previous project"
          disabled={!canScrollPrev}
          onClick={() => scrollToIndex(activeIndex - 1)}
          className={cn(arrowClassName, "left-2")}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next project"
          disabled={!canScrollNext}
          onClick={() => scrollToIndex(activeIndex + 1)}
          className={cn(arrowClassName, "right-2")}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </section>
  );
}
