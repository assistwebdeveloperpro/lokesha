"use client";

import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { getAssetUrl } from "@/services/apiClient";
import { SAVED_CARD_IMAGE_ASPECT_CLASS } from "./savedPropertiesShared";

type SavedPropertyImageSliderProps = {
  images: string[];
  alt: string;
  href: string;
};

const ARROW_CLASS_NAME =
  "absolute top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100";

function SlideImage({ src, alt, href }: { src: string; alt: string; href: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <Link href={href} className="relative block h-full w-full shrink-0 snap-center" tabIndex={-1} aria-hidden>
      {hasError ? (
        <span className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-50 to-sky-100 text-indigo-600">
          <Building2 className="h-10 w-10" aria-hidden />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getAssetUrl(src)}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </Link>
  );
}

export default function SavedPropertyImageSlider({ images, alt, href }: SavedPropertyImageSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasControls = images.length > 1;

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={`group relative overflow-hidden ${SAVED_CARD_IMAGE_ASPECT_CLASS}`}>
      {images.length === 0 ? (
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-50 to-sky-100 text-indigo-600"
        >
          <Building2 className="h-10 w-10" aria-hidden />
        </Link>
      ) : (
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image) => (
            <SlideImage key={image} src={image} alt={alt} href={href} />
          ))}
        </div>
      )}

      {hasControls ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            disabled={activeIndex === 0}
            onClick={() => scrollToIndex(activeIndex - 1)}
            className={`${ARROW_CLASS_NAME} left-2 disabled:hidden`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next image"
            disabled={activeIndex === images.length - 1}
            onClick={() => scrollToIndex(activeIndex + 1)}
            className={`${ARROW_CLASS_NAME} right-2 disabled:hidden`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5" aria-hidden>
            {images.map((image, index) => (
              <span
                key={image}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
