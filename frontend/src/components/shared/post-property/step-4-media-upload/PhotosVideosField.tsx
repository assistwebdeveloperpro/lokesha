"use client";

import { AlertTriangle, ImagePlus, Loader2, Play, RotateCw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PropertyMedia } from "@/services/property.service";
import type { MediaUploader } from "../utils/mediaUploader";
import {
  MAX_PARALLEL_UPLOADS,
  addMediaItems,
  findMediaItem,
  removeMediaItem,
  removeStoredMedia,
  runWithConcurrency,
  uploadMediaItem,
} from "../utils/photosVideosValues";
import ExistingMediaThumbnail from "./ExistingMediaThumbnail";
import MediaRemoveButton from "./MediaRemoveButton";
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
  arePhotosRequired,
  createPropertyMediaFromFile,
  getPhotoCategories,
  getTotalMediaCount,
  type ListingTypeId,
  type PhotoCategoryId,
  type PropertyTypeId,
  type PhotosVideosValues,
  type PropertyMediaFile,
} from "../config/postPropertyForm.shared";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import { postPropertyChipClass } from "../config/postPropertyForm.styles";

const uploadButtonClassName =
  "bg-linear-to-r-navy-blue inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99]";

const categoryTabClassName = (isSelected: boolean) =>
  `${postPropertyChipClass(isSelected)} px-3.5 py-2 text-sm sm:px-4 sm:py-2.5`;

function UploadStatusOverlay({
  media,
  onRetry,
}: {
  media: PropertyMediaFile;
  onRetry: () => void;
}) {
  if (media.status === "uploading") {
    return (
      <span
        className="absolute inset-0 flex items-center justify-center bg-white/70"
        role="status"
        aria-label="Uploading"
      >
        <Loader2 className="h-6 w-6 animate-spin text-sky-600" aria-hidden />
      </span>
    );
  }

  if (media.status === "error") {
    return (
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/85 px-2 text-center">
        <span className="line-clamp-2 text-xs font-medium text-red-600" role="alert">
          {media.errorMessage ?? "Upload failed"}
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-sky-700 shadow ring-1 ring-sky-200 transition hover:text-sky-900"
        >
          <RotateCw className="h-3 w-3" aria-hidden /> Retry
        </button>
      </span>
    );
  }

  return null;
}

function MediaThumbnail({
  media,
  index,
  onRemove,
  onRetry,
}: {
  media: PropertyMediaFile;
  index: number;
  onRemove: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
      {media.type === "video" ? (
        <div className="relative flex h-full w-full items-center justify-center bg-slate-100">
          {media.previewUrl ? (
            <video
              src={media.previewUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
            <Play className="h-8 w-8 fill-white text-white" aria-hidden />
          </span>
        </div>
      ) : !media.previewUrl ? (
        <div className="flex h-full w-full items-center justify-center bg-slate-100">
          <ImagePlus className="h-8 w-8 text-slate-400" aria-hidden />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.previewUrl}
          alt={`Uploaded media ${index + 1}`}
          className="h-full w-full object-cover"
        />
      )}
      <UploadStatusOverlay media={media} onRetry={onRetry} />
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
  error,
  existingMedia = [],
  onRemoveExisting,
  existingBrochureName,
  propertyType = "residential",
  listingType,
  subType,
  excludedCategoryIds = [],
  extraCategoryIds = [],
  parts = "all",
  uploader,
}: {
  // "photos" or "brochure" renders only that half, so the brochure can sit above sub type tabs
  parts?: "all" | "photos" | "brochure";
  // With an uploader every file is sent to the server as soon as it is chosen
  uploader?: MediaUploader;
  excludedCategoryIds?: PhotoCategoryId[];
  extraCategoryIds?: PhotoCategoryId[];
  propertyType?: PropertyTypeId;
  listingType?: ListingTypeId;
  subType?: string;
  values: PhotosVideosValues;
  onChange: (nextValues: PhotosVideosValues) => void;
  error?: string;
  existingMedia?: PropertyMedia[];
  onRemoveExisting?: (mediaId: string) => void;
  existingBrochureName?: string | null;
}) {
  const categories = getPhotoCategories(propertyType, {
    listingType,
    subType,
  })
    .filter((category) => !excludedCategoryIds.includes(category.id))
    .concat(
      PHOTO_CATEGORY_OPTIONS.filter((category) =>
        extraCategoryIds.includes(category.id),
      ),
    );
  const [activeCategory, setActiveCategory] = useState<PhotoCategoryId>(
    categories[0].id,
  );
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [brochureError, setBrochureError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  // Uploads finish long after the render that started them, so they write to the newest values
  const latestValues = useRef(values);
  useEffect(() => {
    latestValues.current = values;
  });

  const commit = (update: (current: PhotosVideosValues) => PhotosVideosValues) => {
    latestValues.current = update(latestValues.current);
    onChange(latestValues.current);
  };

  const startUploads = (
    items: PropertyMediaFile[],
    kind: "media" | "brochure",
    meta: { category?: string },
  ) => {
    if (!uploader) return;

    const context = { uploader, getValues: () => latestValues.current, commit };
    void runWithConcurrency(items, MAX_PARALLEL_UPLOADS, (item) =>
      uploadMediaItem(context, item, kind, meta),
    );
  };

  const retryUpload = (mediaId: string) => {
    const media = findMediaItem(latestValues.current, mediaId);
    if (media) {
      startUploads([media], "media", { category: activeCategory });
    }
  };

  const categoryMedia = values.mediaByCategory[activeCategory];
  const categoryExistingMedia = existingMedia.filter(
    (media) => media.category === activeCategory,
  );
  const totalMediaCount = getTotalMediaCount(values) + existingMedia.length;
  const hasCategoryMedia = categoryMedia.length + categoryExistingMedia.length > 0;
  const showLowPhotosWarning =
    hasCategoryMedia && totalMediaCount < MIN_PHOTOS_FOR_WARNING;

  useEffect(() => {
    return () => {
      const currentValues = latestValues.current;

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
          error: "Only image files (jpg, png, webp, gif, avif, tiff, bmp, heic) and mp4 videos are allowed.",
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

    const nextMedia = valid.map((file) =>
      createPropertyMediaFromFile(file, uploader ? "uploading" : "local"),
    );
    commit((current) => addMediaItems(current, activeCategory, nextMedia));
    startUploads(nextMedia, "media", { category: activeCategory });
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaError(null);
    const removedMedia = findMediaItem(latestValues.current, mediaId);
    if (removedMedia) {
      URL.revokeObjectURL(removedMedia.previewUrl);
    }

    commit((current) => removeMediaItem(current, mediaId));
    if (uploader) {
      void removeStoredMedia(uploader, removedMedia);
    }
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

    const previous = latestValues.current.brochure;
    if (previous) {
      URL.revokeObjectURL(previous.previewUrl);
    }

    const brochure = createPropertyMediaFromFile(file, uploader ? "uploading" : "local");
    commit((current) => ({ ...current, brochure }));
    if (uploader) {
      void removeStoredMedia(uploader, previous);
    }
    startUploads([brochure], "brochure", {});
  };

  const handleRemoveBrochure = () => {
    const previous = latestValues.current.brochure;
    if (previous) {
      URL.revokeObjectURL(previous.previewUrl);
    }
    setBrochureError(null);
    commit((current) => ({ ...current, brochure: null }));
    if (uploader) {
      void removeStoredMedia(uploader, previous);
    }
  };

  const retryBrochureUpload = () => {
    const brochure = latestValues.current.brochure;
    if (brochure) {
      startUploads([brochure], "brochure", {});
    }
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
      {parts === "brochure" ? null : (
      <PostPropertyFieldSection
        title="Upload Photos & Videos by Category"
        required={arePhotosRequired(propertyType, { listingType, subType })}
        description="Select a room or area, then add photos and videos to help buyers explore your property"
      >
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => (
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
                {categoryExistingMedia.map((media, index) => (
                  <ExistingMediaThumbnail
                    key={media.id}
                    media={media}
                    index={index}
                    onRemove={() => onRemoveExisting?.(media.id)}
                  />
                ))}
                {categoryMedia.map((media, index) => (
                  <MediaThumbnail
                    key={media.id}
                    media={media}
                    index={index}
                    onRemove={() => handleRemoveMedia(media.id)}
                    onRetry={() => retryUpload(media.id)}
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
                Upload 50 photos & videos of max size 50 mb in format jpg, png,
                webp, gif, avif, tiff, bmp, heic & mp4
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

          {error && !mediaError ? (
            <p className="mt-3 text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </PostPropertyFieldSection>
      )}

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

      {parts === "photos" ? null : (
      <PostPropertyFieldSection
        title="Upload Brochure"
        description="Upload brochure max size of 100 mb in pdf format"
      >
        {existingBrochureName && !values.brochure ? (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-3">
            <Upload className="h-5 w-5 shrink-0 text-sky-600" aria-hidden />
            <span className="flex-1 truncate text-sm font-medium text-slate-700">
              Current brochure: {existingBrochureName}
            </span>
          </div>
        ) : null}

        {values.brochure ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-3">
            <Upload className="h-5 w-5 shrink-0 text-sky-600" aria-hidden />
            <span className="flex-1 truncate text-sm font-medium text-slate-700">
              {values.brochure.name}
            </span>
            {values.brochure.status === "uploading" ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Uploading
              </span>
            ) : null}
            {values.brochure.status === "error" ? (
              <>
                <span className="text-sm text-red-600" role="alert">
                  {values.brochure.errorMessage ?? "Upload failed"}
                </span>
                <button
                  type="button"
                  onClick={retryBrochureUpload}
                  className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-sky-700 transition hover:text-sky-900"
                >
                  <RotateCw className="h-3.5 w-3.5" aria-hidden /> Retry
                </button>
              </>
            ) : null}
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
          {values.brochure || existingBrochureName ? "Change Brochure" : "Upload Brochure"}
        </button>

        {brochureError ? (
          <p className="mt-3 text-sm text-red-500" role="alert">
            {brochureError}
          </p>
        ) : null}
      </PostPropertyFieldSection>
      )}

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
