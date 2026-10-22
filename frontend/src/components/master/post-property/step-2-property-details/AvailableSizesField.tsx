import { Plus, X } from "lucide-react";
import PostPropertyAmountInput from "../step-5-pricing-and-additional-details/PostPropertyAmountInput";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import PostPropertyInput from "../PostPropertyInput";
import type { PropertyTypeId } from "../postPropertyForm.shared";
import {
  BHK_OPTIONS,
  SIZE_UNIT_OPTIONS,
  createAvailableSizeRow,
  getUnitTypeConfig,
  type AvailableSizeRow,
  type ProjectDetailsValues,
} from "../postPropertyProjectDetails";

const dropdownMenuClassName =
  "absolute left-0 z-50 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10";

const bhkOptions = [
  { value: "", label: "Select BHK" },
  ...BHK_OPTIONS.map((value) => ({ value, label: value })),
];

export default function AvailableSizesField({
  values,
  onChange,
  propertyType,
  subType,
  hideBhk = false,
  sizeUnits = SIZE_UNIT_OPTIONS,
  showUnitsAvailable = false,
}: {
  hideBhk?: boolean;
  sizeUnits?: string[];
  showUnitsAvailable?: boolean;
  values: ProjectDetailsValues;
  propertyType: PropertyTypeId;
  subType: string[];
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
}) {
  const config = getUnitTypeConfig(propertyType, subType);
  const { unitTypes } = config;
  const showBhk = config.showBhk && !hideBhk;
  const sizeUnitOptions = sizeUnits.map((value) => ({ value, label: value }));
  const columnCount = 4 + (showBhk ? 1 : 0) + (showUnitsAvailable ? 1 : 0);
  const fieldTrack = `repeat(${columnCount}, 11.5rem)`;
  const unitTypeOptions = [
    { value: "", label: "Select type" },
    ...unitTypes.map((value) => ({ value, label: value })),
  ];
  const rows = values.availableSizes;
  const update = (id: string, patch: Partial<AvailableSizeRow>) =>
    onChange(
      "availableSizes",
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );

  return (
    <PostPropertyFieldSection
      title="Available Sizes"
      description="Add each available configuration with its size and unit"
    >
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-start gap-3">
            <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div
                className="grid w-max gap-6"
                style={{ gridTemplateColumns: fieldTrack }}
              >
              {showBhk ? (
                <PostPropertyInput
                  id={`sizeBhk-${row.id}`}
                  ariaLabel="BHK"
                  label="BHK"
                  variant="underline"
                  staticLabel
                  options={bhkOptions}
                  value={row.bhk}
                  onChange={(value) => update(row.id, { bhk: value })}
                  dropdownMenuClassName={dropdownMenuClassName}
                />
              ) : null}
              <PostPropertyInput
                id={`sizeUnitType-${row.id}`}
                ariaLabel="Unit Type"
                label="Unit Type"
                variant="underline"
                staticLabel
                options={unitTypeOptions}
                value={row.unitType}
                onChange={(value) => update(row.id, { unitType: value })}
                dropdownMenuClassName={dropdownMenuClassName}
              />
              <PostPropertyInput
                id={`sizeUnit-${row.id}`}
                ariaLabel="Size Unit"
                label="Unit"
                variant="underline"
                staticLabel
                options={sizeUnitOptions}
                value={row.sizeUnit}
                onChange={(value) => update(row.id, { sizeUnit: value })}
                dropdownMenuClassName={dropdownMenuClassName}
              />
              <PostPropertyInput
                id={`sizeValue-${row.id}`}
                label={`Size (${row.sizeUnit || "sq ft"})`}
                placeholder="e.g. 1377"
                type="number"
                variant="underline"
                staticLabel
                value={row.size}
                onChange={(value) => update(row.id, { size: value })}
              />
              <PostPropertyAmountInput
                id={`sizePrice-${row.id}`}
                label="Starting Price"
                placeholder="Starting Price"
                variant="underline"
                staticLabel
                value={row.price}
                onChange={(value) => update(row.id, { price: value })}
              />
              {showUnitsAvailable ? (
                <PostPropertyInput
                  id={`sizeUnitsAvailable-${row.id}`}
                  label="Units Available"
                  placeholder="e.g. 20"
                  type="number"
                  variant="underline"
                  staticLabel
                  value={row.unitsAvailable}
                  onChange={(value) => update(row.id, { unitsAvailable: value })}
                />
              ) : null}
              </div>
            </div>
            <button
              type="button"
              aria-label={`Remove size ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() =>
                onChange(
                  "availableSizes",
                  rows.filter((item) => item.id !== row.id),
                )
              }
              className="mt-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange("availableSizes", [
              ...rows,
              {
                ...createAvailableSizeRow(
                  showBhk
                    ? ""
                    : rows.at(-1)?.unitType ||
                        (unitTypes.length === 1 ? unitTypes[0] : ""),
                ),
                sizeUnit: rows.at(-1)?.sizeUnit || sizeUnits[0],
              },
            ])
          }
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/30 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:border-sky-500 hover:bg-sky-50/60"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Size
        </button>
      </div>
    </PostPropertyFieldSection>
  );
}
