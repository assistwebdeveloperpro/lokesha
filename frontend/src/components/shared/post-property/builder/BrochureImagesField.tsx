"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef } from "react";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import {
  createRowId,
  type BrochureImage,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";

export default function BrochureImagesField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(values.brochureImages);
  imagesRef.current = values.brochureImages;
  const images = values.brochureImages;

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const handleAdd = (files: FileList) => {
    const added: BrochureImage[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: createRowId(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    onChange("brochureImages", [...images, ...added]);
  };

  const handleRemove = (image: BrochureImage) => {
    URL.revokeObjectURL(image.previewUrl);
    onChange(
      "brochureImages",
      images.filter((item) => item.id !== image.id),
    );
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.previewUrl}
              alt={`Brochure image ${index + 1}`}
              className="h-full w-full object-cover"
            />
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
        accept=".jpg,.jpeg,.png,.heic,.webp"
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
