"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type DropdownOption = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  id: string;
  label?: string;
  ariaLabel?: string;
  options: DropdownOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  hasError?: boolean;
  variant?: "boxed" | "underline";
};

export default function CustomDropdown({
  id,
  label,
  ariaLabel,
  options,
  defaultValue,
  value,
  onChange,
  hasError = false,
  variant = "underline",
}: CustomDropdownProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = isControlled ? value : internalValue;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  const underlineFieldClasses = `flex w-full items-center justify-between border-0 border-b bg-transparent pb-2.5 text-left text-sm text-slate-800 outline-none transition-colors ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-slate-300 focus:border-sky-600"
  }`;

  const underlineLabelClasses =
    "pointer-events-none absolute left-0 top-1 origin-left scale-[0.85] text-sm text-slate-500";

  const handleSelect = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasLabel = Boolean(label);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        aria-label={label ?? ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        onClick={() => setIsOpen((open) => !open)}
        className={`${underlineFieldClasses} ${hasLabel ? "pt-6" : "pt-2"} pr-6`}
      >
        <span className="font-medium">{selectedOption?.value}</span>
        <ChevronDown
          className={`pointer-events-none absolute right-0 bottom-3 h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {hasLabel && (
        <label htmlFor={id} className={underlineLabelClasses}>
          {label}
        </label>
      )}

      {isOpen && (
        <ul
          role="listbox"
          aria-label={label ?? ariaLabel}
          className="absolute left-0 z-20 mt-1 max-h-48 w-44 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-sky-50 font-medium text-sky-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
