"use client";

import { ChevronLeft, ChevronRight, Expand, FileDown, ImageIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { PropertyDetailsGalleryFullscreen } from "./PropertyDetailsGalleryFullscreen";
import type { PropertyDetailsImageCategory } from "./propertyDetails.types";

const HERO_THUMB_SLOTS = 5;

type PropertyDetailsGalleryProps = {
  images: string[];
  imageCategories?: PropertyDetailsImageCategory[];
  title: string;
  subtitle: string;
  showBrochure?: boolean;
  layout?: "hero" | "full";
};

export function PropertyDetailsGallery({
  images,
  imageCategories = [],
  title,
  subtitle,
  showBrochure = false,
  layout = "full",
}: PropertyDetailsGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const safeImages = images.length > 0 ? images : [];
  const activeImage = safeImages[activeIndex];
  const remaining = Math.max(0, safeImages.length - 1);

  const goPrev = useCallback(() => {
    if (safeImages.length === 0) return;
    setActiveIndex((index) => (index - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const goNext = useCallback(() => {
    if (safeImages.length === 0) return;
    setActiveIndex((index) => (index + 1) % safeImages.length);
  }, [safeImages.length]);

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-16/10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
        <ImageIcon className="h-10 w-10" aria-hidden />
      </div>
    );
  }

  const isHero = layout === "hero";
  const thumbSlotCount = Math.min(safeImages.length, HERO_THUMB_SLOTS);
  const heroExtraCount = Math.max(0, safeImages.length - HERO_THUMB_SLOTS);

  const galleryBody = (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-md shadow-slate-900/10 ring-1 ring-slate-900/5">
      <div
        className={`relative w-full ${
          isHero ? "aspect-4/3 sm:aspect-16/10" : "aspect-16/10 sm:aspect-21/9 lg:aspect-5/2"
        }`}
      >
        {!imageErrors[activeIndex] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage}
            alt={`${title} – photo ${activeIndex + 1}`}
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={() => setImageErrors((prev) => ({ ...prev, [activeIndex]: true }))}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageIcon className="h-10 w-10" aria-hidden />
          </div>
        )}

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-navy-blue shadow-md transition hover:bg-white sm:left-3"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-navy-blue shadow-md transition hover:bg-white sm:right-3"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        <div className="absolute right-2 top-2 flex gap-2 sm:right-3 sm:top-3">
          {showBrochure && !isHero ? (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy-blue shadow-sm transition hover:bg-white"
            >
              <FileDown className="h-3.5 w-3.5" aria-hidden />
              Brochure
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/95 text-navy-blue shadow-sm transition hover:bg-white"
            aria-label="Enter fullscreen"
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>

        {!isHero && remaining > 0 ? (
          <div className="absolute bottom-3 right-3 rounded-md bg-slate-900/75 px-2.5 py-1 text-xs font-semibold text-white">
            + {remaining} More
          </div>
        ) : null}
      </div>

      {safeImages.length > 1 && isHero ? (
        <div className="grid grid-cols-5 gap-1.5 border-t border-slate-200 bg-white p-2 sm:gap-2 sm:p-2.5">
          {Array.from({ length: thumbSlotCount }).map((_, slotIndex) => {
            const isMoreSlot = heroExtraCount > 0 && slotIndex === HERO_THUMB_SLOTS - 1;
            const imageIndex = isMoreSlot ? HERO_THUMB_SLOTS - 1 : slotIndex;
            const image = safeImages[imageIndex];

            return (
              <button
                key={`hero-thumb-${slotIndex}`}
                type="button"
                onClick={() => {
                  if (isMoreSlot) setIsFullscreen(true);
                  else setActiveIndex(imageIndex);
                }}
                className={`relative aspect-4/3 cursor-pointer overflow-hidden rounded-md border transition ${
                  !isMoreSlot && imageIndex === activeIndex
                    ? "border-sky-500 ring-2 ring-sky-200"
                    : "border-slate-200 hover:border-sky-300"
                }`}
                aria-label={isMoreSlot ? `Show ${heroExtraCount} more photos` : `Show photo ${imageIndex + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                {isMoreSlot ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/55 text-xs font-bold text-white sm:text-sm">
                    + {heroExtraCount} More
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {safeImages.length > 1 && !isHero ? (
        <div className="grid grid-cols-4 gap-1 border-t border-slate-200 bg-white p-1 sm:grid-cols-6 lg:grid-cols-8">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-4/3 cursor-pointer overflow-hidden rounded-md border transition ${
                index === activeIndex
                  ? "border-sky-500 ring-2 ring-sky-200"
                  : "border-slate-200 hover:border-sky-300"
              }`}
              aria-label={`Show photo ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      {galleryBody}
      <PropertyDetailsGalleryFullscreen
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={title}
        subtitle={subtitle}
        categories={imageCategories}
        fallbackImages={safeImages}
        initialImageUrl={activeImage}
      />
    </>
  );
}
