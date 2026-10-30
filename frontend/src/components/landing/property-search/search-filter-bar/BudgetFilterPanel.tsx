"use client";

import { useMemo } from "react";
import type { RangeBounds } from "../searchFilterOptions";
import { budgetStepsFor, formatBudgetOption } from "./budgetOptions";
import { RangeBoundFilterPanel } from "./RangeBoundFilterPanel";

type BudgetFilterPanelProps = {
  title: string;
  bounds: RangeBounds;
  valueMin?: number;
  valueMax?: number;
  isPg: boolean;
  onCommit: (valueMin?: number, valueMax?: number) => void;
};

export function BudgetFilterPanel({
  title,
  bounds,
  valueMin,
  valueMax,
  isPg,
  onCommit,
}: BudgetFilterPanelProps) {
  const steps = useMemo(() => budgetStepsFor(bounds, isPg), [bounds, isPg]);

  return (
    <RangeBoundFilterPanel
      title={title}
      bounds={bounds}
      valueMin={valueMin}
      valueMax={valueMax}
      steps={steps}
      formatValue={(value) => formatBudgetOption(value, isPg)}
      minFieldLabel="Minimum budget"
      maxFieldLabel="Maximum budget"
      onCommit={onCommit}
    />
  );
}
