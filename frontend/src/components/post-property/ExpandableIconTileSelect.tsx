"use client";

import type { StaticImageData } from "next/image";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import { VISIBLE_ICON_TILE_COUNT } from "./postPropertyForm.shared";
import { postPropertyTileClass } from "./postPropertyForm.styles";

type ExpandableImageTileOption = {
  id: string;
  label: string;
  image: StaticImageData | string;
};

type ExpandableIconTileSelectProps = {
  legend: string;
  required?: boolean;
  options: ExpandableImageTileOption[];
  value: string[];
  onChange: (value: string[]) => void;
  visibleCount?: number;
  bare?: boolean;
};

function getImageSrc(image: StaticImageData | string): string {
  return typeof image === "string" ? image : image.src;
}

export default function ExpandableIconTileSelect({
  legend,
  required = false,
  options,
  value,
  onChange,
  visibleCount = VISIBLE_ICON_TILE_COUNT,
  bare = false,
}: ExpandableIconTileSelectProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleOptions = isExpanded ? options : options.slice(0, visibleCount);
  const hasMoreOptions = options.length > visibleCount;

  const toggleOption = (optionId: string) => {
    const next = value.includes(optionId)
      ? value.filter((id) => id !== optionId)
      : [...value, optionId];
    onChange(next);
  };

  const tileClassName = (isSelected: boolean) =>
    `flex min-h-[5.75rem] w-full flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3.5 text-center sm:min-h-[6.25rem] sm:px-3 sm:py-4 ${postPropertyTileClass(isSelected)}`;

  const tileContent = (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {visibleOptions.map((option) => {
        const isSelected = value.includes(option.id);
        const imageSrc = getImageSrc(option.image);

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleOption(option.id)}
            className={tileClassName(isSelected)}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden sm:h-11 sm:w-11">
              <img
                src={imageSrc}
                alt=""
                className={`h-10 w-10 object-contain transition-transform duration-300 ${
                  isSelected ? "scale-110" : "group-hover:scale-105"
                }`}
                aria-hidden
              />
            </span>
            <span
              className={`w-full min-w-0 px-0.5 text-xs font-semibold leading-snug sm:text-sm ${
                isSelected ? "text-sky-800" : "text-slate-700"
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}

      {hasMoreOptions ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="flex min-h-[5.75rem] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-sky-200 bg-sky-50/30 px-2 py-3.5 text-center transition-all hover:cursor-pointer hover:border-sky-300 hover:bg-sky-50/60 sm:min-h-[6.25rem] sm:px-3 sm:py-4"
        >
          {isExpanded ? (
            <>
              <ChevronUp
                className="h-4 w-4 text-sky-600"
                strokeWidth={2}
                aria-hidden
              />
              <span className="text-xs font-semibold text-sky-700 sm:text-sm">
                Show Less
              </span>
            </>
          ) : (
            <span className="text-xs font-semibold text-sky-700 sm:text-sm">
              Show More
            </span>
          )}
        </button>
      ) : null}
    </div>
  );

  if (bare) {
    return (
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">
          {legend}
          {required ? (
            <span className="ml-0.5 text-sky-600" aria-hidden>
              *
            </span>
          ) : null}
        </p>
        {tileContent}
      </div>
    );
  }

  return (
    <PostPropertyFieldSection title={legend} required={required}>
      {tileContent}
    </PostPropertyFieldSection>
  );
}
