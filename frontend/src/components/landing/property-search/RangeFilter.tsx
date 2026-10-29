"use client";

import { useEffect, useRef, useState } from "react";
import { DualRangeSlider } from "../home/hero-banner/DualRangeSlider";
import type { RangeBounds } from "./searchFilterOptions";

const COMMIT_DELAY_MS = 400;

type RangeFilterProps = {
  title: string;
  bounds: RangeBounds;
  valueMin?: number;
  valueMax?: number;
  formatValue: (value: number) => string;
  onCommit: (valueMin?: number, valueMax?: number) => void;
};

export function RangeFilter({
  title,
  bounds,
  valueMin,
  valueMax,
  formatValue,
  onCommit,
}: RangeFilterProps) {
  const committed = {
    min: valueMin ?? bounds.min,
    max: valueMax ?? bounds.max,
  };
  const [draft, setDraft] = useState(committed);
  const [previous, setPrevious] = useState(committed);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Follow url changes (chip removal, back button) without fighting a drag.
  if (previous.min !== committed.min || previous.max !== committed.max) {
    setPrevious(committed);
    setDraft(committed);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const updateDraft = (next: { min: number; max: number }) => {
    setDraft(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onCommit(
        next.min === bounds.min ? undefined : next.min,
        next.max === bounds.max ? undefined : next.max,
      );
    }, COMMIT_DELAY_MS);
  };

  return (
    <DualRangeSlider
      min={bounds.min}
      max={bounds.max}
      valueMin={draft.min}
      valueMax={draft.max}
      onChangeMin={(min) => updateDraft({ ...draft, min })}
      onChangeMax={(max) => updateDraft({ ...draft, max })}
      formatValue={formatValue}
      title={title}
      rangeLabel={`${formatValue(draft.min)} - ${formatValue(draft.max)}`}
    />
  );
}
