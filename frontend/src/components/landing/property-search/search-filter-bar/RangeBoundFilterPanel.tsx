"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  FOCUS_RING,
  SCROLLBAR_NAVY_BLUE,
} from "../../home/hero-banner/heroBanner.shared";
import type { RangeBounds } from "../searchFilterOptions";
import {
  SearchFilterDoneButton,
  SearchFilterPanelTitle,
} from "./SearchFilterDropdown";

const RANGE_INPUT_CLASS =
  "pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-navy-blue [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-navy-blue [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm";

type RangeBoundFilterPanelProps = {
  title: string;
  bounds: RangeBounds;
  valueMin?: number;
  valueMax?: number;
  steps: number[];
  formatValue: (value: number) => string;
  minFieldLabel: string;
  maxFieldLabel: string;
  onCommit: (valueMin?: number, valueMax?: number) => void;
};

type Bound = "min" | "max";

function nearestStepIndex(steps: number[], value: number): number {
  let index = 0;
  let best = Number.POSITIVE_INFINITY;
  steps.forEach((step, stepIndex) => {
    const diff = Math.abs(step - value);
    if (diff < best) {
      best = diff;
      index = stepIndex;
    }
  });
  return index;
}

export function RangeBoundFilterPanel({
  title,
  bounds,
  valueMin,
  valueMax,
  steps,
  formatValue,
  minFieldLabel,
  maxFieldLabel,
  onCommit,
}: RangeBoundFilterPanelProps) {
  const [draft, setDraft] = useState({
    min: valueMin ?? bounds.min,
    max: valueMax ?? bounds.max,
  });
  const [openBound, setOpenBound] = useState<Bound | null>(null);

  useEffect(() => {
    setDraft({
      min: valueMin ?? bounds.min,
      max: valueMax ?? bounds.max,
    });
  }, [valueMin, valueMax, bounds.min, bounds.max]);

  const minIndex =
    steps.length < 2
      ? 0
      : Math.min(nearestStepIndex(steps, draft.min), steps.length - 2);
  const maxIndex =
    steps.length < 2
      ? 0
      : Math.max(nearestStepIndex(steps, draft.max), minIndex + 1);
  const minOptions = steps.slice(0, maxIndex);
  const maxOptions = steps.slice(minIndex + 1);

  const setMin = (next: number) => {
    const index = nearestStepIndex(steps, next);
    const capped = Math.min(index, steps.length - 2);
    setDraft((prev) => ({
      min: steps[capped],
      max: steps[Math.max(nearestStepIndex(steps, prev.max), capped + 1)],
    }));
  };

  const setMax = (next: number) => {
    const index = nearestStepIndex(steps, next);
    const capped = Math.max(index, 1);
    setDraft((prev) => ({
      min: steps[Math.min(nearestStepIndex(steps, prev.min), capped - 1)],
      max: steps[capped],
    }));
  };

  return (
    <div
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-range-select]")) setOpenBound(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpenBound(null);
      }}
    >
      <SearchFilterPanelTitle>{title}</SearchFilterPanelTitle>
      <div className="mt-3 flex items-center gap-2">
        <RangeBoundSelect
          label={minFieldLabel}
          text={draft.min === bounds.min ? "Min" : formatValue(draft.min)}
          options={minOptions}
          selected={draft.min}
          formatValue={formatValue}
          open={openBound === "min"}
          onToggle={() => setOpenBound((current) => (current === "min" ? null : "min"))}
          onSelect={(value) => {
            setMin(value);
            setOpenBound(null);
          }}
        />
        <span className="shrink-0 text-sm text-slate-500">to</span>
        <RangeBoundSelect
          label={maxFieldLabel}
          text={formatValue(draft.max)}
          options={maxOptions}
          selected={draft.max}
          formatValue={formatValue}
          open={openBound === "max"}
          onToggle={() => setOpenBound((current) => (current === "max" ? null : "max"))}
          onSelect={(value) => {
            setMax(value);
            setOpenBound(null);
          }}
        />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <RangeStepSlider
          stepCount={steps.length}
          minIndex={minIndex}
          maxIndex={maxIndex}
          minFieldLabel={minFieldLabel}
          maxFieldLabel={maxFieldLabel}
          onMinIndex={(index) => setMin(steps[index])}
          onMaxIndex={(index) => setMax(steps[index])}
        />
        <SearchFilterDoneButton
          inline
          onClick={() =>
            onCommit(
              draft.min === bounds.min ? undefined : draft.min,
              draft.max === bounds.max ? undefined : draft.max,
            )
          }
        />
      </div>
    </div>
  );
}

function RangeBoundSelect({
  label,
  text,
  options,
  selected,
  formatValue,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  text: string;
  options: number[];
  selected: number;
  formatValue: (value: number) => string;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: number) => void;
}) {
  const listId = useId();
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  return (
    <div data-range-select className={`relative min-w-0 flex-1 ${open ? "z-20" : ""}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={`flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:border-slate-400 ${FOCUS_RING}`}
      >
        <span className="truncate">{text}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className={`${SCROLLBAR_NAVY_BLUE} absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg`}
        >
          {options.map((option) => {
            const isSelected = option === selected;
            return (
              <li key={option} role="presentation">
                <button
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(option)}
                  className={`w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-800 hover:bg-sky-100 ${FOCUS_RING} ${
                    isSelected ? "bg-sky-100" : ""
                  }`}
                >
                  {formatValue(option)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function RangeStepSlider({
  stepCount,
  minIndex,
  maxIndex,
  minFieldLabel,
  maxFieldLabel,
  onMinIndex,
  onMaxIndex,
}: {
  stepCount: number;
  minIndex: number;
  maxIndex: number;
  minFieldLabel: string;
  maxFieldLabel: string;
  onMinIndex: (index: number) => void;
  onMaxIndex: (index: number) => void;
}) {
  const minId = useId();
  const maxId = useId();
  const last = Math.max(stepCount - 1, 1);
  const minPercent = (minIndex / last) * 100;
  const maxPercent = (maxIndex / last) * 100;

  return (
    <div className="relative h-5 min-w-0 flex-1">
      <div className="pointer-events-none absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200" />
      <div
        className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-navy-blue"
        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
      />
      <label htmlFor={minId} className="sr-only">
        {minFieldLabel}
      </label>
      <input
        id={minId}
        type="range"
        min={0}
        max={last}
        step={1}
        value={minIndex}
        aria-label={minFieldLabel}
        onChange={(event) => onMinIndex(Number(event.target.value))}
        className={RANGE_INPUT_CLASS}
        style={{ zIndex: minIndex >= maxIndex - 1 ? 5 : 3 }}
      />
      <label htmlFor={maxId} className="sr-only">
        {maxFieldLabel}
      </label>
      <input
        id={maxId}
        type="range"
        min={0}
        max={last}
        step={1}
        value={maxIndex}
        aria-label={maxFieldLabel}
        onChange={(event) => onMaxIndex(Number(event.target.value))}
        className={RANGE_INPUT_CLASS}
        style={{ zIndex: 4 }}
      />
    </div>
  );
}
