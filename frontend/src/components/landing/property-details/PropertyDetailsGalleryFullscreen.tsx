"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  orderGalleryImagesForCategory,
  resolveGalleryCategoryForImage,
  type PropertyDetailsGalleryCategory,
} from "./propertyDetailsGallery.utils";

const TAB_SCROLLER =
  "flex w-full gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const IMAGE_STAGE =
  "mx-auto flex h-[clamp(11rem,48vh,42rem)] w-full min-w-0 max-w-full items-center justify-center sm:h-[clamp(13rem,54vh,42rem)] lg:h-[clamp(18rem,62vh,48rem)] xl:h-[clamp(20rem,68vh,52rem)] 2xl:h-[clamp(22rem,72vh,56rem)]";

type PropertyDetailsGalleryFullscreenProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  categories: PropertyDetailsGalleryCategory[];
  fallbackImages: string[];
  initialImageUrl: string;
};

// The content mounts per open (and per opened image), so its state always starts from the opened photo
export function PropertyDetailsGalleryFullscreen({ open, ...props }: PropertyDetailsGalleryFullscreenProps) {
  if (!open) return null;

  return <GalleryFullscreenContent key={props.initialImageUrl} {...props} />;
}

function GalleryFullscreenContent({
  onClose,
  title,
  subtitle,
  categories,
  fallbackImages,
  initialImageUrl,
}: Omit<PropertyDetailsGalleryFullscreenProps, "open">) {
  const hasCategories = categories.length > 0;

  const buildSlides = (categoryId: string | null) =>
    hasCategories ? orderGalleryImagesForCategory(categories, categoryId) : fallbackImages;

  const initialCategoryId = hasCategories
    ? resolveGalleryCategoryForImage(categories, initialImageUrl)
    : null;

  const [slides, setSlides] = useState(() => buildSlides(initialCategoryId));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [slideIndex, setSlideIndex] = useState(() => Math.max(0, buildSlides(initialCategoryId).indexOf(initialImageUrl)));
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const activeImage = slides[slideIndex];
  const activeCategoryId =
    hasCategories && activeImage
      ? (resolveGalleryCategoryForImage(categories, activeImage) ?? selectedCategoryId)
      : selectedCategoryId;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const goPrev = useCallback(() => {
    if (slides.length === 0) return;
    setSlideIndex((index) => (index - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    if (slides.length === 0) return;
    setSlideIndex((index) => (index + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onClose]);

  const selectCategory = (categoryId: string) => {
    setSlides(buildSlides(categoryId));
    setSelectedCategoryId(categoryId);
    setSlideIndex(0);
    setImageErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-linear-to-b from-(--color-navy-deep) via-navy-blue to-(--color-navy-sidebar-active) text-white">
      <div className="shrink-0 space-y-3 px-3 pb-3 pt-3 sm:space-y-4 sm:px-6 sm:pb-4 sm:pt-5 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="font-display truncate text-lg font-bold text-sky-300 sm:text-xl lg:text-2xl">
              {title}
            </h2>
            <p className="line-clamp-2 text-xs text-slate-300 sm:text-sm lg:text-base">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-500/20 hover:text-white sm:h-10 sm:w-10"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasCategories ? (
          <div className={TAB_SCROLLER} role="tablist" aria-label="Photo categories">
            {categories.map((category) => {
              const isActive = category.id === activeCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  onClick={() => selectCategory(category.id)}
                  className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                    isActive
                      ? "border-sky-400/50 bg-sky-600 text-white shadow-md shadow-sky-950/50"
                      : "border-white/15 bg-white/10 text-slate-200 hover:border-sky-400/35 hover:bg-white/15 hover:text-white"
                  }`}
                  aria-selected={isActive}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <div className={`${IMAGE_STAGE} px-2 sm:px-3 lg:px-4 xl:px-6`}>
          {activeImage && !imageErrors[slideIndex] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={activeImage}
              src={activeImage}
              alt={`${title} – photo ${slideIndex + 1}`}
              className="mx-auto block max-h-full max-w-full object-contain"
              onError={() => setImageErrors((prev) => ({ ...prev, [slideIndex]: true }))}
            />
          ) : (
            <p className="text-center text-sm text-slate-400">Unable to load this photo.</p>
          )}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-1 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/95 text-navy-blue shadow-lg shadow-black/30 transition hover:bg-white sm:left-2 sm:h-11 sm:w-11"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-1 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/95 text-navy-blue shadow-lg shadow-black/30 transition hover:bg-white sm:right-2 sm:h-11 sm:w-11"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <p className="shrink-0 pb-4 text-center text-xs font-medium sm:pb-5 sm:text-sm">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sky-100/90">
            {slideIndex + 1} / {slides.length}
          </span>
        </p>
      ) : (
        <div className="h-5 shrink-0" />
      )}
    </div>
  );
}
