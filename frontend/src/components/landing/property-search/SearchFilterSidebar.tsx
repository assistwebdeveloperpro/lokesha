"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import {
  FOCUS_RING,
  formatArea,
  formatBudget,
} from "../home/hero-banner/heroBanner.shared";
import { FilterChipGroup } from "./FilterChipGroup";
import { RangeFilter } from "./RangeFilter";
import {
  AREA_BOUNDS,
  BEDROOM_FILTER_OPTIONS,
  CONSTRUCTION_FILTER_OPTIONS,
  OCCUPANCY_FILTER_OPTIONS,
  getCategoryFilters,
  includesValue,
  togglePropertyType,
  toggleValue,
} from "./searchFilterOptions";
import type { CriteriaUpdateMode } from "./useSearchResultsFilters";

type SearchFilterSidebarProps = {
  criteria: PropertySearchCriteria;
  onChange: (
    patch: Partial<PropertySearchCriteria>,
    mode?: CriteriaUpdateMode,
  ) => void;
};

export function SearchFilterSidebar({
  criteria,
  onChange,
}: SearchFilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sections, propertyTypeOptions, budgetBounds, isPg } =
    getCategoryFilters(criteria.category);
  const allPropertyTypes = propertyTypeOptions.map((option) => option.value);

  return (
    <aside aria-label="Search filters" className="lg:w-72 lg:shrink-0">
      <button
        type="button"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
        className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 lg:hidden ${FOCUS_RING}`}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
      </button>

      <div
        className={`${
          mobileOpen ? "block" : "hidden"
        } mt-3 space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:mt-0 lg:block`}
      >
        {sections.includes("bedroom") && (
          <FilterChipGroup
            title="Bedrooms"
            options={BEDROOM_FILTER_OPTIONS}
            isSelected={(value) => criteria.bedrooms.includes(value)}
            onToggle={(value) =>
              onChange({ bedrooms: toggleValue(criteria.bedrooms, value) })
            }
          />
        )}
        {propertyTypeOptions.length > 0 && (
          <FilterChipGroup
            title="Property type"
            options={propertyTypeOptions}
            isSelected={(value) =>
              criteria.propertyTypes.length === 0 ||
              includesValue(criteria.propertyTypes, value)
            }
            onToggle={(value) =>
              onChange({
                propertyTypes: togglePropertyType(
                  criteria.propertyTypes,
                  allPropertyTypes,
                  value,
                ),
              })
            }
          />
        )}
        {sections.includes("construction") && (
          <FilterChipGroup
            title="Construction status"
            options={CONSTRUCTION_FILTER_OPTIONS}
            isSelected={(value) => criteria.constructionStatuses.includes(value)}
            onToggle={(value) =>
              onChange({
                constructionStatuses: toggleValue(
                  criteria.constructionStatuses,
                  value,
                ),
              })
            }
          />
        )}
        {sections.includes("occupancy") && (
          <FilterChipGroup
            title="Occupancy"
            options={OCCUPANCY_FILTER_OPTIONS}
            isSelected={(value) => criteria.occupancies.includes(value)}
            onToggle={(value) =>
              onChange({ occupancies: toggleValue(criteria.occupancies, value) })
            }
          />
        )}
        {sections.includes("budget") && (
          <RangeFilter
            title="Budget"
            bounds={budgetBounds}
            valueMin={criteria.budgetMin}
            valueMax={criteria.budgetMax}
            formatValue={(value) => formatBudget(value, isPg)}
            onCommit={(budgetMin, budgetMax) =>
              onChange({ budgetMin, budgetMax }, "replace")
            }
          />
        )}
        {sections.includes("area") && (
          <RangeFilter
            title="Area"
            bounds={AREA_BOUNDS}
            valueMin={criteria.areaMin}
            valueMax={criteria.areaMax}
            formatValue={formatArea}
            onCommit={(areaMin, areaMax) =>
              onChange({ areaMin, areaMax }, "replace")
            }
          />
        )}
      </div>
    </aside>
  );
}
