"use client";

import { useId } from "react";

type DualRangeProps = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
  formatValue: (value: number) => string;
  title: string;
  rangeLabel: string;
};

export function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  formatValue,
  title,
  rangeLabel,
}: DualRangeProps) {
  const minId = useId();
  const maxId = useId();

  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500">{rangeLabel}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 truncate rounded-lg bg-navy-blue px-3 py-2 text-center text-xs font-semibold text-white shadow-sm">
          {formatValue(valueMin)}
        </div>
        <div className="min-w-0 truncate rounded-lg bg-navy-blue px-3 py-2 text-center text-xs font-semibold text-white shadow-sm">
          {formatValue(valueMax)}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor={minId} className="sr-only">
          Minimum value
        </label>
        <input
          id={minId}
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChangeMin(Math.min(next, valueMax));
          }}
          className="h-2 w-full cursor-pointer accent-[#12192b]"
        />
        <label htmlFor={maxId} className="sr-only">
          Maximum value
        </label>
        <input
          id={maxId}
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChangeMax(Math.max(next, valueMin));
          }}
          className="h-2 w-full cursor-pointer accent-[#12192b]"
        />
      </div>
    </div>
  );
}
