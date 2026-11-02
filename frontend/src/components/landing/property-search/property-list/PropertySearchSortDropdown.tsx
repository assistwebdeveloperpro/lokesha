"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { FOCUS_RING } from "../../home/hero-banner/heroBanner.shared";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type PropertySearchSortDropdownProps = {
  className?: string;
};

export function PropertySearchSortDropdown({ className = "" }: PropertySearchSortDropdownProps) {
  const [value, setValue] = useState<SortValue>("recent");
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const selectedLabel =
    SORT_OPTIONS.find((option) => option.value === value)?.label ?? "Most Recent";

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = rect.width;
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: Math.max(8, left),
      width,
      zIndex: 60,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [isOpen]);

  const panel = isOpen ? (
    <div
      ref={panelRef}
      role="listbox"
      aria-label="Sort property listings"
      style={panelStyle}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
    >
      {SORT_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => {
              setValue(option.value);
              setIsOpen(false);
            }}
            className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm transition hover:bg-slate-50 ${FOCUS_RING} ${
              selected ? "font-semibold text-navy-blue" : "font-medium text-slate-700"
            }`}
          >
            {option.label}
            {selected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex min-h-11 w-full max-w-56 cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 sm:max-w-64 md:max-w-72 xl:max-w-80 ${FOCUS_RING} ${className}`.trim()}
      >
        <span className="truncate">{selectedLabel}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
