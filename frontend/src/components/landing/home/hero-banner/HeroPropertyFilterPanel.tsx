"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { DualRangeSlider } from "./DualRangeSlider";
import {
  AREA_RANGE,
  BEDROOM_OPTIONS,
  CHIP_DEFAULT,
  CHIP_SELECTED,
  CONSTRUCTION_OPTIONS,
  DEFAULT_BUDGET,
  FILTER_SECTION_DEFAULT,
  FILTER_SECTION_EXPANDED,
  FILTER_SECTION_SELECTED,
  FOCUS_RING,
  OCCUPANCY_OPTIONS,
  PG_BUDGET,
  formatArea,
  formatBudget,
  filterSectionHasSelection,
  filterSectionLabel,
  type FilterSection,
} from "./heroBanner.shared";
import type { HeroBannerFilters } from "./useHeroBannerFilters";

type HeroPropertyFilterPanelProps = Pick<
  HeroBannerFilters,
  | "hasPropertyChips"
  | "propertyTypeOptions"
  | "selectedPropertyTypes"
  | "togglePropertyType"
  | "filterSections"
  | "expandedSection"
  | "setExpandedSection"
  | "filterSelectionState"
  | "selectedBedrooms"
  | "setSelectedBedrooms"
  | "selectedConstruction"
  | "setSelectedConstruction"
  | "selectedOccupancy"
  | "setSelectedOccupancy"
  | "toggleFromList"
  | "isPg"
  | "budgetMin"
  | "setBudgetMin"
  | "budgetMax"
  | "setBudgetMax"
  | "pgBudgetMin"
  | "setPgBudgetMin"
  | "pgBudgetMax"
  | "setPgBudgetMax"
  | "areaMin"
  | "setAreaMin"
  | "areaMax"
  | "setAreaMax"
> & {
  className?: string;
};

const CHIP_ROW_CLASS = "flex w-full flex-wrap gap-2";

export function HeroPropertyFilterPanel({
  hasPropertyChips,
  propertyTypeOptions,
  selectedPropertyTypes,
  togglePropertyType,
  filterSections,
  expandedSection,
  setExpandedSection,
  filterSelectionState,
  selectedBedrooms,
  setSelectedBedrooms,
  selectedConstruction,
  setSelectedConstruction,
  selectedOccupancy,
  setSelectedOccupancy,
  toggleFromList,
  isPg,
  budgetMin,
  setBudgetMin,
  budgetMax,
  setBudgetMax,
  pgBudgetMin,
  setPgBudgetMin,
  pgBudgetMax,
  setPgBudgetMax,
  areaMin,
  setAreaMin,
  areaMax,
  setAreaMax,
  className = "",
}: HeroPropertyFilterPanelProps) {
  return (
    <div
      role="dialog"
      aria-label="Property filters"
      className={`absolute top-full left-0 right-0 z-50 mt-2 max-h-[min(70vh,32rem)] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5 lg:left-auto lg:w-[min(100vw-2rem,40rem)] ${className}`}
    >
      {hasPropertyChips && (
        <div
          className={`${CHIP_ROW_CLASS} pb-3`}
          aria-label="Property types"
        >
          {propertyTypeOptions.map((type) => {
            const selected = selectedPropertyTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePropertyType(type)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${FOCUS_RING} ${
                  selected ? CHIP_SELECTED : CHIP_DEFAULT
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      )}

      <div className={`${CHIP_ROW_CLASS} border-t border-slate-100 pt-3`}>
        {filterSections.map((section) => {
          const isExpanded = expandedSection === section;
          const hasSelection = filterSectionHasSelection(
            section,
            filterSelectionState,
          );
          return (
            <FilterSectionTab
              key={section}
              section={section}
              isExpanded={isExpanded}
              hasSelection={hasSelection}
              onToggle={() =>
                setExpandedSection((prev) =>
                  prev === section ? null : section,
                )
              }
            />
          );
        })}
      </div>

      {expandedSection === "bedroom" && (
        <ChipRow className={CHIP_ROW_CLASS}>
          {BEDROOM_OPTIONS.map((bedroom) => (
            <ToggleChip
              key={bedroom}
              label={bedroom}
              selected={selectedBedrooms.includes(bedroom)}
              onClick={() => toggleFromList(bedroom, setSelectedBedrooms)}
              rounded="md"
            />
          ))}
        </ChipRow>
      )}

      {expandedSection === "construction" && (
        <ChipRow className={CHIP_ROW_CLASS}>
          {CONSTRUCTION_OPTIONS.map((status) => (
            <ToggleChip
              key={status}
              label={status}
              selected={selectedConstruction.includes(status)}
              onClick={() => toggleFromList(status, setSelectedConstruction)}
            />
          ))}
        </ChipRow>
      )}

      {expandedSection === "occupancy" && (
        <div
          className={`${CHIP_ROW_CLASS} mt-3 border-t border-slate-100 pt-3`}
        >
          {OCCUPANCY_OPTIONS.map((option) => (
            <ToggleChip
              key={option}
              label={option}
              selected={selectedOccupancy.includes(option)}
              onClick={() => toggleFromList(option, setSelectedOccupancy)}
            />
          ))}
        </div>
      )}

      {expandedSection === "budget" && (
        <DualRangeSlider
          min={isPg ? PG_BUDGET.min : DEFAULT_BUDGET.min}
          max={isPg ? PG_BUDGET.max : DEFAULT_BUDGET.max}
          valueMin={isPg ? pgBudgetMin : budgetMin}
          valueMax={isPg ? pgBudgetMax : budgetMax}
          onChangeMin={isPg ? setPgBudgetMin : setBudgetMin}
          onChangeMax={isPg ? setPgBudgetMax : setBudgetMax}
          formatValue={(v) => formatBudget(v, isPg)}
          title="Select Budget Range"
          rangeLabel={
            isPg
              ? `${formatBudget(pgBudgetMin, true)} - ${formatBudget(pgBudgetMax, true)}`
              : `${formatBudget(budgetMin, false)} - ${formatBudget(budgetMax, false)}`
          }
        />
      )}

      {expandedSection === "area" && (
        <DualRangeSlider
          min={AREA_RANGE.min}
          max={AREA_RANGE.max}
          valueMin={areaMin}
          valueMax={areaMax}
          onChangeMin={setAreaMin}
          onChangeMax={setAreaMax}
          formatValue={formatArea}
          title="Select Area Range"
          rangeLabel={`${formatArea(areaMin)} - ${formatArea(areaMax)}`}
        />
      )}
    </div>
  );
}

function FilterSectionTab({
  section,
  isExpanded,
  hasSelection,
  onToggle,
}: {
  section: FilterSection;
  isExpanded: boolean;
  hasSelection: boolean;
  onToggle: () => void;
}) {
  const tone = isExpanded
    ? FILTER_SECTION_EXPANDED
    : hasSelection
      ? FILTER_SECTION_SELECTED
      : FILTER_SECTION_DEFAULT;

  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onToggle}
      className={`inline-flex max-w-full shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:cursor-pointer ${FOCUS_RING} ${tone}`}
    >
      {filterSectionLabel(section)}
      {hasSelection && !isExpanded ? (
        <span className="h-1.5 w-1.5 rounded-full bg-navy-blue" aria-hidden />
      ) : null}
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${
          isExpanded ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        )}
      </span>
    </button>
  );
}

function ChipRow({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${className} mt-3 border-t border-slate-100 pt-3`}
    >
      {children}
    </div>
  );
}

function ToggleChip({
  label,
  selected,
  onClick,
  rounded = "full",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  rounded?: "full" | "md";
}) {
  const radius = rounded === "md" ? "rounded-md" : "rounded-full";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap border px-3 py-1.5 text-xs font-semibold sm:text-sm ${radius} ${
        selected ? CHIP_SELECTED : CHIP_DEFAULT
      }`}
    >
      {label}
    </button>
  );
}
