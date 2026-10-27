"use client";

import { ImagePlus, Loader2, RotateCw, X } from "lucide-react";
import { useEffect, useRef } from "react";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import {
  createRowId,
  type BrochureImage,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import type { MediaUploader } from "../utils/mediaUploader";
import { MAX_PARALLEL_UPLOADS, runWithConcurrency } from "../utils/photosVideosValues";
import { removeStoredFile, uploadItemFile } from "../utils/uploadItemFile";

const BROCHURE_IMAGE_CATEGORY = "brochure-images";

function UploadOverlay({ image, onRetry }: { image: BrochureImage; onRetry: () => void }) {
  if (image.status === "uploading") {
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

  if (image.status === "error") {
    return (
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/85 px-2 text-center">
        <span className="line-clamp-2 text-xs font-medium text-red-600" role="alert">
          {image.errorMessage ?? "Upload failed"}
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

export default function BrochureImagesField({
  values,
  onChange,
  uploader,
}: {
  values: ProjectDetailsValues;
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
  uploader?: MediaUploader;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const images = values.brochureImages;

  // Uploads finish long after the render that started them, so they write to the newest images
  const latestImages = useRef(images);
  useEffect(() => {
    latestImages.current = images;
  });

  useEffect(() => {
    return () => {
      latestImages.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const commit = (update: (current: BrochureImage[]) => BrochureImage[]) => {
    latestImages.current = update(latestImages.current);
    onChange("brochureImages", latestImages.current);
  };

  const startUploads = (items: BrochureImage[]) => {
    if (!uploader) return;

    const context = {
      uploader,
      exists: (id: string) => latestImages.current.some((image) => image.id === id),
      patch: (id: string, change: Partial<BrochureImage>) =>
        commit((current) => current.map((image) => (image.id === id ? { ...image, ...change } : image))),
    };
    void runWithConcurrency(items, MAX_PARALLEL_UPLOADS, (item) =>
      uploadItemFile(context, item, "media", { category: BROCHURE_IMAGE_CATEGORY }),
    );
  };

  const handleAdd = (files: FileList) => {
    const added: BrochureImage[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: createRowId(),
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        ...(uploader ? { status: "uploading" as const } : {}),
      }));

    commit((current) => [...current, ...added]);
    startUploads(added);
  };

  const handleRemove = (image: BrochureImage) => {
    URL.revokeObjectURL(image.previewUrl);
    commit((current) => current.filter((item) => item.id !== image.id));
    if (uploader) {
      void removeStoredFile(uploader, image);
    }
  };

  const handleRetry = (imageId: string) => {
    const image = latestImages.current.find((item) => item.id === imageId);
    if (image) startUploads([image]);
  };

  return (
    <PostPropertyFieldSection
      title="Brochure Images"
      description="Add as many brochure images as you want along with the PDF"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            {image.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.previewUrl}
                alt={`Brochure image ${index + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-slate-100">
                <ImagePlus className="h-8 w-8 text-slate-400" aria-hidden />
              </span>
            )}
            <UploadOverlay image={image} onRetry={() => handleRetry(image.id)} />
            <button
              type="button"
              aria-label={`Remove brochure image ${index + 1}`}
              onClick={() => handleRemove(image)}
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-600 shadow transition hover:text-red-600"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/20 text-slate-500 transition hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-700"
        >
          <ImagePlus className="h-10 w-10 text-sky-500" aria-hidden />
          <span className="text-sm font-semibold text-sky-700">
            {images.length ? "+ Add More" : "+ Add Images"}
          </span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.heic"
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            handleAdd(event.target.files);
            event.target.value = "";
          }
        }}
      />
    </PostPropertyFieldSection>
  );
}
