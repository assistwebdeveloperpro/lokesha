"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { useRef } from "react";

export const MAX_OFFICE_PHOTOS = 10;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
export const ACCEPTED_PHOTO_EXTENSIONS = ".jpeg,.jpg,.png,.gif";

export type OfficePhoto = {
  id: string;
  previewUrl: string;
  file?: File;
  storedPath?: string;
};

export type FormErrors = {
  state?: string;
  city?: string;
  locality?: string;
  contactPersonName?: string;
  agencyCompanyName?: string;
  officePhotos?: string;
};

export function createOfficePhotoFromFile(file: File): OfficePhoto {
  return {
    id: `photo-${Date.now()}-${file.name}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function createOfficePhotoFromStoredPath(
  storedPath: string,
  previewUrl: string,
): OfficePhoto {
  return { id: `existing-${storedPath}`, storedPath, previewUrl };
}

export function KycWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-900 sm:rounded-md sm:px-3 sm:py-2.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

function PhotoRemoveButton({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white shadow-sm backdrop-blur-sm transition hover:bg-slate-900"
      aria-label={`Remove office photo ${index + 1}`}
    >
      <X className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

export function OfficePhotoUpload({
  photos,
  onAdd,
  onRemove,
  error,
}: {
  photos: OfficePhoto[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
  error?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const remainingSlots = MAX_OFFICE_PHOTOS - photos.length;
  const slots = Array.from({ length: MAX_OFFICE_PHOTOS }, (_, index) => photos[index] ?? null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const scrollCarousel = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const offset = Math.round(container.clientWidth * 0.72) * (direction === "left" ? -1 : 1);
    container.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-3 space-y-1 sm:mb-2.5 sm:space-y-0">
        <p className="text-xs leading-relaxed text-slate-500 sm:text-sm sm:font-semibold sm:text-slate-700">
          <span className="sm:hidden">
            Upload up to {MAX_OFFICE_PHOTOS} photos (jpeg, jpg, png, gif).
          </span>
          <span className="hidden sm:inline">
            Office Photos (Upload upto {MAX_OFFICE_PHOTOS}) (jpeg, jpg, png, gif format)
          </span>
        </p>
      </div>

      <div className="relative rounded-xl bg-slate-100/80 px-1 py-3.5 sm:px-2 sm:py-4">
        <button
          type="button"
          onClick={() => scrollCarousel("left")}
          className="absolute top-[calc(50%-0.75rem)] left-0.5 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700 sm:top-1/2 sm:left-1 sm:h-8 sm:w-8"
          aria-label="Scroll photos left"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-10 [-ms-overflow-style:none] scrollbar-none sm:gap-3 sm:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {slots.map((photo, index) => (
            <div
              key={photo?.id ?? `empty-${index}`}
              className="w-[7.25rem] shrink-0 snap-start sm:w-28"
            >
              {photo ? (
                <div className="relative">
                  <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt={`Office photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <PhotoRemoveButton index={index} onRemove={() => onRemove(photo.id)} />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={remainingSlots === 0}
                  className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-sky-400 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50 sm:h-24"
                >
                  <ImagePlus className="h-7 w-7" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={openFilePicker}
                disabled={remainingSlots === 0 && !photo}
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-1.5"
              >
                Add Photo
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollCarousel("right")}
          className="absolute top-[calc(50%-0.75rem)] right-0.5 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700 sm:top-1/2 sm:right-1 sm:h-8 sm:w-8"
          aria-label="Scroll photos right"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500 sm:hidden">
        {photos.length} of {MAX_OFFICE_PHOTOS} photos uploaded · swipe or use arrows to browse
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_PHOTO_EXTENSIONS}
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            onAdd(event.target.files);
            event.target.value = "";
          }
        }}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
