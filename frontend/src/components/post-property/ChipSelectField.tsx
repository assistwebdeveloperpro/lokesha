"use client";

import { useState } from "react";
import MoreOptionsModal from "./MoreOptionsModal";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import { postPropertyChipClass } from "./postPropertyForm.styles";

type ChipSelectFieldProps = {
  legend: string;
  required?: boolean;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  moreOptions?: string[];
  bare?: boolean;
};

export default function ChipSelectField({
  legend,
  required = false,
  options,
  value,
  onChange,
  moreOptions,
  bare = false,
}: ChipSelectFieldProps) {
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const isMoreValueSelected = Boolean(
    moreOptions?.length && value && moreOptions.includes(value),
  );
  const displayOptions =
    isMoreValueSelected && value ? [...options, value] : options;

  const chipClassName = (isSelected: boolean) =>
    `${postPropertyChipClass(isSelected)} min-w-[2.75rem] px-3.5 py-2.5 text-sm sm:min-w-[3rem] sm:px-4`;

  const chipContent = (
    <>
      <div className="flex flex-wrap gap-2.5">
        {displayOptions.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={chipClassName(value === option)}
          >
            {option}
          </button>
        ))}

        {moreOptions?.length ? (
          <button
            type="button"
            onClick={() => setIsMoreModalOpen(true)}
            className={`${chipClassName(false)} border-dashed text-sky-700`}
          >
            + More
          </button>
        ) : null}
      </div>

      {moreOptions?.length ? (
        <MoreOptionsModal
          isOpen={isMoreModalOpen}
          title={legend.replace("*", "").trim()}
          options={moreOptions}
          selectedValue={isMoreValueSelected ? value : ""}
          onClose={() => setIsMoreModalOpen(false)}
          onSubmit={(nextValue) => {
            onChange(nextValue);
            setIsMoreModalOpen(false);
          }}
        />
      ) : null}
    </>
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
        {chipContent}
      </div>
    );
  }

  return (
    <PostPropertyFieldSection title={legend} required={required}>
      {chipContent}
    </PostPropertyFieldSection>
  );
}
