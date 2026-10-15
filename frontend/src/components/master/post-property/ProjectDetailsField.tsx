import { Plus, X } from "lucide-react";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import PostPropertyInput from "./PostPropertyInput";
import type { PropertyTypeId } from "./postPropertyForm.shared";
import {
  BHK_OPTIONS,
  createRowId,
  getUnitTypeConfig,
  type ConfigurationRow,
  type ProjectDetailsValues,
} from "./postPropertyProjectDetails";

type OnChange = <K extends keyof ProjectDetailsValues>(
  field: K,
  value: ProjectDetailsValues[K],
) => void;

const dropdownMenuClassName =
  "absolute left-0 z-50 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10";

const bhkOptions = [
  { value: "", label: "Select BHK" },
  ...BHK_OPTIONS.map((value) => ({ value, label: value })),
];

const addRowBtnClassName =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/30 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:border-sky-500 hover:bg-sky-50/60";

const removeRowBtnClassName =
  "mt-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600";

function RemoveRowButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`${removeRowBtnClassName} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <X className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function ProjectOverviewField({
  values,
  onChange,
  propertyType,
  subType,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
  propertyType: PropertyTypeId;
  subType: string[];
}) {
  const { unitTypes, showBhk } = getUnitTypeConfig(propertyType, subType);
  const unitTypeOptions = [
    { value: "", label: "Select type" },
    ...unitTypes.map((value) => ({ value, label: value })),
  ];

  const updateConfig = (id: string, patch: Partial<ConfigurationRow>) =>
    onChange(
      "configurations",
      values.configurations.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    );

  return (
    <>
      <PostPropertyFieldSection
        title="Project & Developer Details"
        description="Add developer, launch and project scale information"
      >
        <div className="space-y-5 md:space-y-6">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="developerName"
              label="Developer Name"
              variant="underline"
              prominentLabel
              compactProminentLabel
              value={values.developerName}
              onChange={(value) => onChange("developerName", value)}
            />
            <PostPropertyInput
              id="launchDate"
              label="Date of Launch"
              placeholder="Date of Launch"
              variant="underline"
              type="date"
              staticLabel
              value={values.launchDate}
              onChange={(value) => onChange("launchDate", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="totalUnits"
              label="Total Units"
              type="number"
              variant="underline"
              prominentLabel
              compactProminentLabel
              value={values.totalUnits}
              onChange={(value) => onChange("totalUnits", value)}
            />
            <PostPropertyInput
              id="totalBlocks"
              label="Total Blocks / Towers"
              type="number"
              variant="underline"
              prominentLabel
              compactProminentLabel
              value={values.totalBlocks}
              onChange={(value) => onChange("totalBlocks", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="projectArea"
              label="Project Area (Acres)"
              type="number"
              variant="underline"
              prominentLabel
              compactProminentLabel
              value={values.projectArea}
              onChange={(value) => onChange("projectArea", value)}
            />
            <PostPropertyInput
              id="openSpacePercent"
              label="Open Space (%)"
              type="number"
              variant="underline"
              prominentLabel
              compactProminentLabel
              value={values.openSpacePercent}
              onChange={(value) => onChange("openSpacePercent", value)}
            />
          </div>
        </div>
      </PostPropertyFieldSection>

      <PostPropertyFieldSection
        title="Configuration"
        description={
          showBhk
            ? "Unit types and BHK options available in this project"
            : "Unit types available in this project"
        }
      >
        <div className="space-y-4">
          {values.configurations.map((row, index) => (
            <div key={row.id} className="flex items-start gap-3">
              <div
                className={`grid flex-1 gap-4 md:gap-6 ${showBhk ? "md:grid-cols-2" : ""}`}
              >
                <PostPropertyInput
                  id={`configUnitType-${row.id}`}
                  ariaLabel="Unit Type"
                  label="Unit Type"
                  variant="underline"
                  staticLabel
                  options={unitTypeOptions}
                  value={row.unitType}
                  onChange={(value) => updateConfig(row.id, { unitType: value })}
                  dropdownMenuClassName={dropdownMenuClassName}
                />
                {showBhk ? (
                  <PostPropertyInput
                    id={`configBhk-${row.id}`}
                    ariaLabel="BHK"
                    label="BHK"
                    variant="underline"
                    staticLabel
                    options={bhkOptions}
                    value={row.bhk}
                    onChange={(value) => updateConfig(row.id, { bhk: value })}
                    dropdownMenuClassName={dropdownMenuClassName}
                  />
                ) : null}
              </div>
              <RemoveRowButton
                label={`Remove configuration ${index + 1}`}
                disabled={values.configurations.length === 1}
                onClick={() =>
                  onChange(
                    "configurations",
                    values.configurations.filter((item) => item.id !== row.id),
                  )
                }
              />
            </div>
          ))}
          <button
            type="button"
            className={addRowBtnClassName}
            onClick={() =>
              onChange("configurations", [
                ...values.configurations,
                { id: createRowId(), unitType: "", bhk: "" },
              ])
            }
          >
            <Plus className="h-4 w-4" aria-hidden /> Add Configuration
          </button>
        </div>
      </PostPropertyFieldSection>
    </>
  );
}

export function ProjectHighlightsField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  const rows = values.projectHighlights;

  return (
    <PostPropertyFieldSection
      title="Project Highlights (USPs)"
      description="Add the key selling points of this project"
    >
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-start gap-3">
            <div className="flex-1">
              <PostPropertyInput
                id={`projectHighlight-${row.id}`}
                label="Highlight"
                variant="underline"
                prominentLabel
                compactProminentLabel
                value={row.text}
                onChange={(value) =>
                  onChange(
                    "projectHighlights",
                    rows.map((item) =>
                      item.id === row.id ? { ...item, text: value } : item,
                    ),
                  )
                }
              />
            </div>
            <RemoveRowButton
              label={`Remove highlight ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() =>
                onChange(
                  "projectHighlights",
                  rows.filter((item) => item.id !== row.id),
                )
              }
            />
          </div>
        ))}
        <button
          type="button"
          className={addRowBtnClassName}
          onClick={() =>
            onChange("projectHighlights", [
              ...rows,
              { id: createRowId(), text: "" },
            ])
          }
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Highlight
        </button>
      </div>
    </PostPropertyFieldSection>
  );
}

export function PrimeLocationHighlightsField({
  projectName,
  values,
  onChange,
}: {
  projectName: string;
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  const rows = values.primeLocationHighlights;
  const update = (id: string, patch: Partial<(typeof rows)[number]>) =>
    onChange(
      "primeLocationHighlights",
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );

  return (
    <PostPropertyFieldSection
      title={`Prime Location Highlights near ${projectName.trim() || "the Project"}`}
      description="Add nearby landmarks such as metro, schools, hospitals and malls"
    >
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-start gap-3">
            <div className="grid flex-1 gap-4 md:grid-cols-2 md:gap-6">
              <PostPropertyInput
                id={`highlightPlace-${row.id}`}
                label="Place / Landmark"
                variant="underline"
                prominentLabel
                compactProminentLabel
                value={row.place}
                onChange={(value) => update(row.id, { place: value })}
              />
              <PostPropertyInput
                id={`highlightDistance-${row.id}`}
                label="Distance (km / mins)"
                variant="underline"
                prominentLabel
                compactProminentLabel
                value={row.distance}
                onChange={(value) => update(row.id, { distance: value })}
              />
            </div>
            <RemoveRowButton
              label={`Remove highlight ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() =>
                onChange(
                  "primeLocationHighlights",
                  rows.filter((item) => item.id !== row.id),
                )
              }
            />
          </div>
        ))}
        <button
          type="button"
          className={addRowBtnClassName}
          onClick={() =>
            onChange("primeLocationHighlights", [
              ...rows,
              { id: createRowId(), place: "", distance: "" },
            ])
          }
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Highlight
        </button>
      </div>
    </PostPropertyFieldSection>
  );
}
