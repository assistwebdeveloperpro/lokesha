"use client";

import { useMemo } from "react";
import { ALL_INDIA_LABEL } from "@/components/shared/layout/city-selector/citySelector.shared";
import { useHeaderCity } from "@/components/shared/layout/city-selector/useHeaderCity";
import { CATEGORY_ID_BY_SLUG } from "@/lib/property-search-url/searchUrl.config";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import {
  categoryPropertyLabel,
  formatArea,
} from "../../home/hero-banner/heroBanner.shared";
import {
  AREA_BOUNDS,
  BEDROOM_FILTER_OPTIONS,
  CONSTRUCTION_FILTER_OPTIONS,
  GENDER_FILTER_OPTIONS,
  OCCUPANCY_FILTER_OPTIONS,
  POSTED_BY_FILTER_OPTIONS,
  SALE_TYPE_FILTER_OPTIONS,
  findOptionLabel,
  getCategoryFilters,
  includesValue,
  togglePropertyType,
  toggleValue,
} from "../searchFilterOptions";
import type { CriteriaUpdateMode } from "../useSearchResultsFilters";
import {
  FilterToggleChip,
  SearchFilterBarProvider,
  SearchFilterDoneButton,
  SearchFilterDropdown,
  SearchFilterPanelTitle,
} from "./SearchFilterDropdown";
import { AREA_FILTER_STEPS } from "./areaOptions";
import { BudgetFilterPanel } from "./BudgetFilterPanel";
import { RangeBoundFilterPanel } from "./RangeBoundFilterPanel";
import { getTopLocalities } from "./searchTopLocalities";

type SearchFilterBarProps = {
  criteria: PropertySearchCriteria;
  onChange: (
    patch: Partial<PropertySearchCriteria>,
    mode?: CriteriaUpdateMode,
  ) => void;
};

function localityTriggerLabel(localities: string[]): string {
  if (localities.length === 0) return "Top Localities";
  if (localities.length === 1) return localities[0];
  return `${localities[0]}, +${localities.length - 1}`;
}

function postedByTriggerLabel(postedBy: string[]): string {
  if (postedBy.length === 0) return "Posted By";
  const labels = postedBy.map((role) =>
    findOptionLabel(POSTED_BY_FILTER_OPTIONS, role),
  );
  if (labels.length === 1) return labels[0];
  return `${labels[0]}, +${labels.length - 1}`;
}

function toggleLocality(localities: string[], locality: string): string[] {
  if (includesValue(localities, locality)) {
    return localities.filter((item) => !includesValue([locality], item));
  }
  return [...localities, locality];
}

function toggleStringFilter(values: string[], value: string): string[] {
  if (includesValue(values, value)) {
    return values.filter((item) => !includesValue([value], item));
  }
  return [...values, value];
}

function propertyTypeBarLabel(
  selected: string[],
  allValues: string[],
  options: { value: string; label: string }[],
): string | null {
  if (selected.length === 0) return null;

  const labels = allValues
    .filter((value) => includesValue(selected, value))
    .map((value) => findOptionLabel(options, value));

  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0];
  return `${labels[0]}, +${labels.length - 1}`;
}

export function SearchFilterBar({ criteria, onChange }: SearchFilterBarProps) {
  const headerCity = useHeaderCity();
  const categoryId = CATEGORY_ID_BY_SLUG[criteria.category];
  const { sections, propertyTypeOptions, budgetBounds, isPg } =
    getCategoryFilters(criteria.category);
  const allPropertyTypes = propertyTypeOptions.map((option) => option.value);
  const cityName =
    criteria.cityName ??
    (headerCity !== ALL_INDIA_LABEL ? headerCity : undefined);
  const topLocalities = useMemo(
    () => getTopLocalities(cityName),
    [cityName],
  );

  const propertyChipLabel = propertyTypeBarLabel(
    criteria.propertyTypes,
    allPropertyTypes,
    propertyTypeOptions,
  );

  const hasBudgetSelection =
    criteria.budgetMin !== undefined || criteria.budgetMax !== undefined;
  const hasAreaSelection =
    criteria.areaMin !== undefined || criteria.areaMax !== undefined;
  const hasBedroomSelection = criteria.bedrooms.length > 0;
  const hasConstructionSelection = criteria.constructionStatuses.length > 0;
  const hasSaleTypeSelection = criteria.saleTypes.length > 0;
  const hasOccupancySelection = criteria.occupancies.length > 0;
  const hasGenderSelection = criteria.genders.length > 0;
  const hasPostedBySelection = criteria.postedBy.length > 0;

  const allLocalitiesSelected =
    topLocalities.length > 0 &&
    topLocalities.every((locality) =>
      includesValue(criteria.localities, locality),
    );

  return (
    <SearchFilterBarProvider>
      <div
        aria-label="Search filters"
        className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {propertyTypeOptions.length > 0 ? (
          <SearchFilterDropdown
            id="property-type"
            label={propertyChipLabel ?? "Property Type"}
            active={criteria.propertyTypes.length > 0}
            onClear={
              propertyChipLabel
                ? () => onChange({ propertyTypes: [] })
                : undefined
            }
            panelClassName="sm:min-w-[26rem]"
          >
            <SearchFilterPanelTitle>
              {categoryPropertyLabel(categoryId)}
            </SearchFilterPanelTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {propertyTypeOptions.map((option) => {
                const selected =
                  criteria.propertyTypes.length === 0 ||
                  includesValue(criteria.propertyTypes, option.value);
                return (
                  <FilterToggleChip
                    key={option.value}
                    label={option.label}
                    selected={selected}
                    onToggle={() =>
                      onChange({
                        propertyTypes: togglePropertyType(
                          criteria.propertyTypes,
                          allPropertyTypes,
                          option.value,
                        ),
                      })
                    }
                  />
                );
              })}
            </div>
            <SearchFilterDoneButton />
          </SearchFilterDropdown>
        ) : null}

        <SearchFilterDropdown
            id="locality"
            label={localityTriggerLabel(criteria.localities)}
            active={criteria.localities.length > 0}
            onClear={
              criteria.localities.length > 0
                ? () => onChange({ localities: [] })
                : undefined
            }
            panelClassName="sm:min-w-[28rem]"
          >
            <SearchFilterPanelTitle>Top Localities</SearchFilterPanelTitle>
            {topLocalities.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                Choose a city to see popular localities.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {topLocalities.map((locality) => (
                  <FilterToggleChip
                    key={locality}
                    label={locality}
                    selected={includesValue(criteria.localities, locality)}
                    onToggle={() =>
                      onChange({
                        localities: toggleLocality(
                          criteria.localities,
                          locality,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            )}
            {topLocalities.length > 0 ? (
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-navy-blue"
                    checked={allLocalitiesSelected}
                    onChange={() => {
                      onChange({
                        localities: allLocalitiesSelected ? [] : [...topLocalities],
                      });
                    }}
                  />
                  Select All
                </label>
                <SearchFilterDoneButton />
              </div>
            ) : (
              <SearchFilterDoneButton />
            )}
          </SearchFilterDropdown>

        <SearchFilterDropdown
          id="posted-by"
          label={postedByTriggerLabel(criteria.postedBy)}
          active={hasPostedBySelection}
          onClear={
            hasPostedBySelection ? () => onChange({ postedBy: [] }) : undefined
          }
        >
          <SearchFilterPanelTitle>Posted By</SearchFilterPanelTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            {POSTED_BY_FILTER_OPTIONS.map((option) => (
              <FilterToggleChip
                key={option.value}
                label={option.label}
                selected={includesValue(criteria.postedBy, option.value)}
                onToggle={() =>
                  onChange({
                    postedBy: toggleStringFilter(
                      criteria.postedBy,
                      option.value,
                    ),
                  })
                }
              />
            ))}
          </div>
          <SearchFilterDoneButton />
        </SearchFilterDropdown>

        {sections.includes("budget") ? (
          <SearchFilterDropdown
            id="budget"
            label="Budget"
            active={hasBudgetSelection}
            onClear={
              hasBudgetSelection
                ? () =>
                    onChange({ budgetMin: undefined, budgetMax: undefined })
                : undefined
            }
            panelClassName="w-[min(100vw-2rem,26rem)]"
          >
            <BudgetFilterPanel
              title="Budget"
              bounds={budgetBounds}
              valueMin={criteria.budgetMin}
              valueMax={criteria.budgetMax}
              isPg={isPg}
              onCommit={(budgetMin, budgetMax) =>
                onChange({ budgetMin, budgetMax }, "replace")
              }
            />
          </SearchFilterDropdown>
        ) : null}

        {sections.includes("area") ? (
          <SearchFilterDropdown
            id="area"
            label="Area (sq ft)"
            active={hasAreaSelection}
            onClear={
              hasAreaSelection
                ? () => onChange({ areaMin: undefined, areaMax: undefined })
                : undefined
            }
            panelClassName="w-[min(100vw-2rem,26rem)]"
          >
            <RangeBoundFilterPanel
              title="Area (sq ft)"
              bounds={AREA_BOUNDS}
              valueMin={criteria.areaMin}
              valueMax={criteria.areaMax}
              steps={AREA_FILTER_STEPS}
              formatValue={formatArea}
              minFieldLabel="Minimum area"
              maxFieldLabel="Maximum area"
              onCommit={(areaMin, areaMax) =>
                onChange({ areaMin, areaMax }, "replace")
              }
            />
          </SearchFilterDropdown>
        ) : null}

        {sections.includes("saleType") ? (
          <SearchFilterDropdown
            id="sale-type"
            label="Sale Type"
            active={hasSaleTypeSelection}
            onClear={
              hasSaleTypeSelection
                ? () => onChange({ saleTypes: [] })
                : undefined
            }
          >
            <SearchFilterPanelTitle>Sale Type</SearchFilterPanelTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {SALE_TYPE_FILTER_OPTIONS.map((option) => (
                <FilterToggleChip
                  key={option.value}
                  label={option.label}
                  selected={includesValue(criteria.saleTypes, option.value)}
                  onToggle={() =>
                    onChange({
                      saleTypes: toggleStringFilter(criteria.saleTypes, option.value),
                    })
                  }
                />
              ))}
            </div>
            <SearchFilterDoneButton />
          </SearchFilterDropdown>
        ) : null}

        {sections.includes("construction") ? (
          <SearchFilterDropdown
            id="construction"
            label="Construction Status"
            active={hasConstructionSelection}
            onClear={
              hasConstructionSelection
                ? () => onChange({ constructionStatuses: [] })
                : undefined
            }
          >
            <SearchFilterPanelTitle>Construction Status</SearchFilterPanelTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONSTRUCTION_FILTER_OPTIONS.map((option) => (
                <FilterToggleChip
                  key={option.value}
                  label={option.label}
                  selected={includesValue(
                    criteria.constructionStatuses,
                    option.value,
                  )}
                  onToggle={() =>
                    onChange({
                      constructionStatuses: toggleStringFilter(
                        criteria.constructionStatuses,
                        option.value,
                      ),
                    })
                  }
                />
              ))}
            </div>
            <SearchFilterDoneButton />
          </SearchFilterDropdown>
        ) : null}

        {sections.includes("bedroom") ? (
          <SearchFilterDropdown
            id="bhk"
            label="BHK"
            active={hasBedroomSelection}
            onClear={
              hasBedroomSelection
                ? () => onChange({ bedrooms: [] })
                : undefined
            }
          >
            <SearchFilterPanelTitle>BHK</SearchFilterPanelTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {BEDROOM_FILTER_OPTIONS.map((option) => (
                <FilterToggleChip
                  key={option.value}
                  label={option.label}
                  selected={criteria.bedrooms.includes(option.value)}
                  onToggle={() =>
                    onChange({
                      bedrooms: toggleValue(criteria.bedrooms, option.value),
                    })
                  }
                />
              ))}
            </div>
            <SearchFilterDoneButton />
          </SearchFilterDropdown>
        ) : null}

        {sections.includes("occupancy") ? (
          <SearchFilterDropdown
            id="occupancy"
            label="Occupancy"
            active={hasOccupancySelection}
            onClear={
              hasOccupancySelection
                ? () => onChange({ occupancies: [] })
                : undefined
            }
          >
            <SearchFilterPanelTitle>Occupancy</SearchFilterPanelTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {OCCUPANCY_FILTER_OPTIONS.map((option) => (
                <FilterToggleChip
                  key={option.value}
                  label={option.label}
                  selected={includesValue(criteria.occupancies, option.value)}
                  onToggle={() =>
                    onChange({
                      occupancies: toggleStringFilter(
                        criteria.occupancies,
                        option.value,
                      ),
                    })
                  }
                />
              ))}
            </div>
            <SearchFilterDoneButton />
          </SearchFilterDropdown>
        ) : null}

        {sections.includes("gender") ? (
          <SearchFilterDropdown
            id="gender"
            label="Gender"
            active={hasGenderSelection}
            onClear={
              hasGenderSelection ? () => onChange({ genders: [] }) : undefined
            }
          >
            <SearchFilterPanelTitle>Gender</SearchFilterPanelTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENDER_FILTER_OPTIONS.map((option) => (
                <FilterToggleChip
                  key={option.value}
                  label={option.label}
                  selected={includesValue(criteria.genders, option.value)}
                  onToggle={() =>
                    onChange({
                      genders: toggleStringFilter(
                        criteria.genders,
                        option.value,
                      ),
                    })
                  }
                />
              ))}
            </div>
            <SearchFilterDoneButton />
          </SearchFilterDropdown>
        ) : null}

        <SearchFilterDropdown
          id="more-filters"
          label="More Filters"
          panelClassName="sm:min-w-[16rem]"
        >
          <div className="flex items-center gap-2">
            <SearchFilterPanelTitle>More Filters</SearchFilterPanelTitle>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-slate-900">
              0
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Additional filters will appear here soon.
          </p>
        </SearchFilterDropdown>
      </div>
    </SearchFilterBarProvider>
  );
}
