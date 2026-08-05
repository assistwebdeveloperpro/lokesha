"use client";

import { AlertTriangle, ImagePlus, Play, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ACCEPTED_BROCHURE_EXTENSIONS,
  ACCEPTED_BROCHURE_TYPES,
  ACCEPTED_MEDIA_EXTENSIONS,
  ACCEPTED_MEDIA_TYPES,
  MAX_BROCHURE_SIZE_BYTES,
  MAX_PROPERTY_MEDIA_COUNT,
  MAX_PROPERTY_MEDIA_SIZE_BYTES,
  MIN_PHOTOS_FOR_WARNING,
  PHOTO_CATEGORY_OPTIONS,
  createPropertyMediaFromFile,
  getTotalMediaCount,
  type PhotoCategoryId,
  type PhotosVideosValues,
  type PropertyMediaFile,
} from "./postPropertyForm.shared";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import { postPropertyChipClass } from "./postPropertyForm.styles";

const uploadButtonClassName =
  "bg-linear-to-r-navy-blue inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99]";

const categoryTabClassName = (isSelected: boolean) =>
  `${postPropertyChipClass(isSelected)} px-3.5 py-2 text-sm sm:px-4 sm:py-2.5`;

function MediaRemoveButton({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white shadow-sm backdrop-blur-sm transition hover:bg-slate-900"
      aria-label={label}
    >
      <X className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

function MediaThumbnail({
  media,
  index,
  onRemove,
}: {
  media: PropertyMediaFile;
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
      {media.type === "video" ? (
        <div className="relative flex h-full w-full items-center justify-center bg-slate-100">
          <video
            src={media.previewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
            <Play className="h-8 w-8 fill-white text-white" aria-hidden />
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.previewUrl}
          alt={`Uploaded media ${index + 1}`}
          className="h-full w-full object-cover"
        />
      )}
      <MediaRemoveButton
        label={`Remove media ${index + 1}`}
        onRemove={onRemove}
      />
    </div>
  );
}

function AddMoreTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/20 text-slate-500 transition hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-700"
    >
      <ImagePlus className="h-10 w-10 text-sky-500" aria-hidden />
      <span className="text-sm font-semibold text-sky-700">+ Add More</span>
    </button>
  );
}

export default function PhotosVideosField({
  values,
  onChange,
}: {
  values: PhotosVideosValues;
  onChange: (nextValues: PhotosVideosValues) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<PhotoCategoryId>("bedrooms");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [brochureError, setBrochureError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const categoryMedia = values.mediaByCategory[activeCategory];
  const totalMediaCount = getTotalMediaCount(values);
  const hasCategoryMedia = categoryMedia.length > 0;
  const showLowPhotosWarning =
    hasCategoryMedia && totalMediaCount < MIN_PHOTOS_FOR_WARNING;

  useEffect(() => {
    return () => {
      const currentValues = valuesRef.current;

      PHOTO_CATEGORY_OPTIONS.forEach((category) => {
        currentValues.mediaByCategory[category.id].forEach((media) => {
          URL.revokeObjectURL(media.previewUrl);
        });
      });

      if (currentValues.brochure) {
        URL.revokeObjectURL(currentValues.brochure.previewUrl);
      }
    };
  }, []);

  const validateMediaFiles = (files: File[]): { valid: File[]; error?: string } => {
    const remainingSlots = MAX_PROPERTY_MEDIA_COUNT - totalMediaCount;
    if (remainingSlots <= 0) {
      return {
        valid: [],
        error: `You can upload up to ${MAX_PROPERTY_MEDIA_COUNT} photos and videos.`,
      };
    }

    const valid: File[] = [];

    for (const file of files) {
      if (!ACCEPTED_MEDIA_TYPES.includes(file.type)) {
        return {
          valid: [],
          error: "Only jpg, jpeg, heic, png, and mp4 formats are allowed.",
        };
      }

      if (file.size > MAX_PROPERTY_MEDIA_SIZE_BYTES) {
        return {
          valid: [],
          error: "Each file must be 50 MB or smaller.",
        };
      }

      valid.push(file);
    }

    if (valid.length > remainingSlots) {
      return {
        valid: valid.slice(0, remainingSlots),
        error: `Only ${remainingSlots} more file${remainingSlots === 1 ? "" : "s"} can be added.`,
      };
    }

    return { valid };
  };

  const handleAddMedia = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) {
      return;
    }

    const { valid, error } = validateMediaFiles(fileArray);
    if (error) {
      setMediaError(error);
    } else {
      setMediaError(null);
    }

    if (!valid.length) {
      return;
    }

    const nextMedia = valid.map(createPropertyMediaFromFile);
    onChange({
      ...values,
      mediaByCategory: {
        ...values.mediaByCategory,
        [activeCategory]: [...categoryMedia, ...nextMedia],
      },
    });
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaError(null);
    const removedMedia = categoryMedia.find((media) => media.id === mediaId);
    if (removedMedia) {
      URL.revokeObjectURL(removedMedia.previewUrl);
    }

    onChange({
      ...values,
      mediaByCategory: {
        ...values.mediaByCategory,
        [activeCategory]: categoryMedia.filter((media) => media.id !== mediaId),
      },
    });
  };

  const handleBrochureSelect = (file: File) => {
    if (!ACCEPTED_BROCHURE_TYPES.includes(file.type)) {
      setBrochureError("Only PDF format is allowed.");
      return;
    }

    if (file.size > MAX_BROCHURE_SIZE_BYTES) {
      setBrochureError("Brochure must be 100 MB or smaller.");
      return;
    }

    setBrochureError(null);

    if (values.brochure) {
      URL.revokeObjectURL(values.brochure.previewUrl);
    }

    onChange({
      ...values,
      brochure: createPropertyMediaFromFile(file),
    });
  };

  const handleRemoveBrochure = () => {
    if (values.brochure) {
      URL.revokeObjectURL(values.brochure.previewUrl);
    }
    setBrochureError(null);
    onChange({ ...values, brochure: null });
  };

  const openMediaPicker = () => {
    mediaInputRef.current?.click();
  };

  const openBrochurePicker = () => {
    brochureInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files?.length) {
      handleAddMedia(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PostPropertyFieldSection
        title="Upload Photos & Videos by Category"
        required
        description="Select a room or area, then add photos and videos to help buyers explore your property"
      >
        <div className="flex flex-wrap gap-2.5">
          {PHOTO_CATEGORY_OPTIONS.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={activeCategory === category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setMediaError(null);
              }}
              className={categoryTabClassName(activeCategory === category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {hasCategoryMedia ? (
            <div className="space-y-4">
              {showLowPhotosWarning ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-900">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                    aria-hidden
                  />
                  <p>
                    Less photos added. Rank up your listing by adding more photos.
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                <AddMoreTile onClick={openMediaPicker} />
                {categoryMedia.map((media, index) => (
                  <MediaThumbnail
                    key={media.id}
                    media={media}
                    index={index}
                    onRemove={() => handleRemoveMedia(media.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition sm:py-14 ${
                isDragging
                  ? "border-sky-400 bg-sky-50/50"
                  : "border-sky-200/80 bg-sky-50/20"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ImagePlus className="h-14 w-14 text-sky-500 sm:h-16 sm:w-16" aria-hidden />
              <p className="mt-4 text-lg font-bold text-navy-blue sm:text-xl">
                + Add Photos & Videos
              </p>
              <p className="mt-2 max-w-md text-sm font-medium text-slate-600">
                Upload 50 photos & videos of max size 50 mb in format jpg, jpeg,
                heic, png & mp4
              </p>
              <button
                type="button"
                onClick={openMediaPicker}
                className={`${uploadButtonClassName} mt-6`}
              >
                Upload Photos & Videos
              </button>
            </div>
          )}

          {mediaError ? (
            <p className="mt-3 text-sm text-red-500" role="alert">
              {mediaError}
            </p>
          ) : null}
        </div>
      </PostPropertyFieldSection>

      <input
        ref={mediaInputRef}
        type="file"
        accept={ACCEPTED_MEDIA_EXTENSIONS}
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            handleAddMedia(event.target.files);
            event.target.value = "";
          }
        }}
      />

      <PostPropertyFieldSection
        title="Upload Brochure"
        description="Upload brochure max size of 100 mb in pdf format"
      >
        {values.brochure ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-3">
            <Upload className="h-5 w-5 shrink-0 text-sky-600" aria-hidden />
            <span className="flex-1 truncate text-sm font-medium text-slate-700">
              {values.brochure.file.name}
            </span>
            <button
              type="button"
              onClick={handleRemoveBrochure}
              className="text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={openBrochurePicker}
          className={`${uploadButtonClassName} ${values.brochure ? "mt-4" : ""}`}
        >
          {values.brochure ? "Change Brochure" : "Upload Brochure"}
        </button>

        {brochureError ? (
          <p className="mt-3 text-sm text-red-500" role="alert">
            {brochureError}
          </p>
        ) : null}
      </PostPropertyFieldSection>

      <input
        ref={brochureInputRef}
        type="file"
        accept={ACCEPTED_BROCHURE_EXTENSIONS}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleBrochureSelect(file);
            event.target.value = "";
          }
        }}
      />
    </div>
  );
}
