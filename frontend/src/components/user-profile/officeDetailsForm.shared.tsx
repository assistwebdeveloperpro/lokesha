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
    <div className="flex items-start gap-2 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p>{children}</p>
    </div>
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

  const scrollCarousel = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const offset = direction === "left" ? -220 : 220;
    container.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold text-slate-700">
        Office Photos (Upload upto 10) (jpeg, jpg, png, gif format)
      </p>

      <div className="relative rounded-xl bg-slate-100/80 px-2 py-4">
        {photos.length < MAX_OFFICE_PHOTOS && (
          <button
            type="button"
            onClick={() => scrollCarousel("left")}
            className="absolute top-1/2 left-1 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700"
            aria-label="Scroll photos left"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-8 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {slots.map((photo, index) => (
            <div key={photo?.id ?? `empty-${index}`} className="w-28 shrink-0">
              {photo ? (
                <div className="relative">
                  <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt={`Office photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(photo.id)}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm transition hover:bg-slate-700"
                    aria-label={`Remove office photo ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={remainingSlots === 0}
                  className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-sky-400 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ImagePlus className="h-7 w-7" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={remainingSlots === 0 && !photo}
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Photo
              </button>
            </div>
          ))}
        </div>

        {photos.length < MAX_OFFICE_PHOTOS && (
          <button
            type="button"
            onClick={() => scrollCarousel("right")}
            className="absolute top-1/2 right-1 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700"
            aria-label="Scroll photos right"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

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
