"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export type DropdownOption = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  id: string;
  label?: React.ReactNode;
  ariaLabel?: string;
  options: DropdownOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  hasError?: boolean;
  variant?: "boxed" | "underline";
  prominentLabel?: boolean;
  compactProminentLabel?: boolean;
  staticLabel?: boolean;
  blackText?: boolean;
  mutedText?: boolean;
  menuClassName?: string;
  accentColor?: "sky" | "teal";
};

const staticLabelClasses = "mb-1.5 block text-sm font-medium text-slate-700";

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
  prominentLabel = false,
  compactProminentLabel = false,
  staticLabel = false,
  blackText = false,
  mutedText = false,
  menuClassName,
  accentColor = "sky",
}: CustomDropdownProps) {
  const isBoxed = variant === "boxed";
  const focusBorder =
    accentColor === "teal" ? "focus:border-teal-600" : "focus:border-sky-600";
  const focusRing =
    accentColor === "teal"
      ? "focus:border-teal-500 focus:ring-teal-500/20"
      : "focus:border-sky-500 focus:ring-sky-500/20";
  const underlineLabelClasses = prominentLabel
    ? blackText
      ? compactProminentLabel
        ? "pointer-events-none absolute left-0 top-0.5 origin-left text-sm font-semibold text-black"
        : "pointer-events-none absolute left-0 top-0.5 origin-left text-base font-semibold text-black"
      : compactProminentLabel
        ? "pointer-events-none absolute left-0 top-0.5 origin-left text-sm font-semibold text-slate-800"
        : "pointer-events-none absolute left-0 top-0.5 origin-left text-sm font-semibold text-slate-800"
    : "pointer-events-none absolute left-0 top-1 origin-left scale-[0.85] text-sm font-medium text-slate-600";
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selectedValue = isControlled ? value : internalValue;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  const fieldTextColor = blackText
    ? "text-black font-medium"
    : mutedText
      ? "text-slate-600 font-medium"
      : "text-slate-900 font-medium";

  const underlineFieldClasses = `flex w-full items-center justify-between border-0 border-b bg-transparent pb-2.5 text-left text-sm ${fieldTextColor} outline-none transition-colors ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : `border-slate-300 ${focusBorder}`
  }`;
  const boxedFieldClasses = `flex w-full min-h-11 items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm ${fieldTextColor} shadow-sm outline-none transition ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : `border-slate-200/90 focus:ring-2 ${focusRing}`
  }`;
  const fieldClasses = isBoxed ? boxedFieldClasses : underlineFieldClasses;

  const handleSelect = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
    setIsOpen(false);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateMenuPosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 200 && rect.top > spaceBelow;
      const nextStyle: CSSProperties = {
        position: "fixed",
        top: openUpward ? undefined : rect.bottom + 4,
        bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
        left: rect.left,
        width: rect.width,
        minWidth: rect.width,
        marginTop: 0,
        zIndex: 80,
      };
      setMenuStyle((current) =>
        current &&
        current.top === nextStyle.top &&
        current.bottom === nextStyle.bottom &&
        current.left === nextStyle.left &&
        current.width === nextStyle.width
          ? current
          : nextStyle,
      );
    };

    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
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
  const accessibleLabel =
    ariaLabel ?? (typeof label === "string" ? label : undefined);
  const fieldTopPadding = isBoxed
    ? ""
    : staticLabel
      ? "pt-2"
      : prominentLabel
        ? "pt-7"
        : hasLabel
          ? "pt-6"
          : "pt-2";

  return (
    <div className="w-full min-w-0">
      {staticLabel && hasLabel && (
        <label htmlFor={id} className={staticLabelClasses}>
          {label}
        </label>
      )}
      <div
        className={`relative w-full min-w-0 ${isOpen ? "z-50" : ""}`}
        ref={containerRef}
      >
        <button
          ref={buttonRef}
          id={id}
          type="button"
          aria-label={accessibleLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={hasError}
          onClick={() => setIsOpen((open) => !open)}
          className={`${fieldClasses} ${fieldTopPadding} relative cursor-pointer ${isBoxed ? "pr-10" : "pr-6"}`}
        >
          <span className={!selectedValue ? "text-slate-400" : fieldTextColor}>
            {selectedOption?.label ?? selectedOption?.value}
          </span>
          <ChevronDown
            className={`pointer-events-none absolute h-4 w-4 text-slate-400 transition-transform ${
              isBoxed ? "right-3 top-1/2 -translate-y-1/2" : "right-0 bottom-3"
            } ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {hasLabel && !staticLabel && (
          <label htmlFor={id} className={underlineLabelClasses}>
            {label}
          </label>
        )}

      {isOpen && menuStyle
        ? createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              aria-label={accessibleLabel}
              style={menuStyle}
              className={
                menuClassName ??
                "z-50 max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
              }
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
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? `bg-sky-100 font-medium ${fieldTextColor}`
                          : `${fieldTextColor} hover:bg-slate-50`
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
            </ul>,
            document.body,
          )
        : null}
      </div>
    </div>
  );
}
