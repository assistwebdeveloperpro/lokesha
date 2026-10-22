"use client";

import { ImagePlus, Plus, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { getFloorPlanTitleExample } from "@/components/shared/post-property/builder/builderConfig";
import type { PropertyTypeId } from "@/components/shared/post-property/postPropertyForm.shared";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import PostPropertyInput from "../PostPropertyInput";
import {
  createRowId,
  findFloorPlanRow,
  type FloorPlanPlanType,
  type FloorPlanRow,
  type ProjectDetailsValues,
} from "../postPropertyProjectDetails";

const uploadButtonClassName =
  "bg-linear-to-r-navy-blue inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99]";

const planTypeOptions: { id: FloorPlanPlanType; label: string }[] = [
  { id: "2d", label: "2D" },
  { id: "3d", label: "3D" },
];

function PlanTypeSwitch({
  value,
  onChange,
}: {
  value: FloorPlanPlanType;
  onChange: (next: FloorPlanPlanType) => void;
}) {
  return (
    <div
      className="inline-flex w-fit shrink-0 rounded-xl border border-sky-200/80 bg-sky-50/40 p-1"
      role="group"
      aria-label="Floor plan type"
    >
      {planTypeOptions.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`w-14 rounded-lg py-1.5 text-center text-sm font-semibold transition hover:cursor-pointer ${
              active
                ? "bg-white text-sky-800 shadow-sm ring-1 ring-sky-200/80"
                : "text-slate-600 hover:text-sky-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FloorPlanRowItem({
  row,
  canRemove,
  onUpdate,
  onRemove,
  titleExample,
  titleLocked = false,
}: {
  row: FloorPlanRow;
  canRemove: boolean;
  onUpdate: (patch: Partial<FloorPlanRow>) => void;
  onRemove: () => void;
  titleExample: string;
  titleLocked?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (row.previewUrl) {
      URL.revokeObjectURL(row.previewUrl);
    }
    onUpdate({ file, previewUrl: URL.createObjectURL(file) });
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".jpg,.jpeg,.png,.heic"
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) {
          handleFile(file);
          event.target.value = "";
        }
      }}
    />
  );

  const previewThumb = row.previewUrl ? (
    <img
      src={row.previewUrl}
      alt={row.label || "Floor plan"}
      className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
    />
  ) : (
    <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-sky-200 bg-sky-50/30">
      <ImagePlus className="h-6 w-6 text-sky-500" aria-hidden />
    </span>
  );

  const uploadButton = (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={uploadButtonClassName}
    >
      {row.file ? "Change Image" : "Upload Image"}
    </button>
  );

  const titleLabel = `Floor Plan Title (e.g. ${titleExample})`;
  const titleField = titleLocked ? (
    <PostPropertyInput
      id={`floorPlanLabel-${row.id}`}
      label={titleLabel}
      variant="underline"
      prominentLabel
      compactProminentLabel
      value={row.label}
    />
  ) : (
    <PostPropertyInput
      id={`floorPlanLabel-${row.id}`}
      label={titleLabel}
      variant="underline"
      prominentLabel
      compactProminentLabel
      value={row.label}
      onChange={(value) => onUpdate({ label: value })}
    />
  );

  const uploadRow = (
    <div className="grid flex-1 gap-4 md:grid-cols-[1fr_auto] md:items-end md:gap-6">
      {titleField}
      <div className="flex items-center gap-3">
        {previewThumb}
        {uploadButton}
      </div>
    </div>
  );

  if (titleLocked) {
    return (
      <>
        {uploadRow}
        {fileInput}
      </>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-4">
      {uploadRow}
      {fileInput}
      <button
        type="button"
        aria-label="Remove floor plan"
        disabled={!canRemove}
        onClick={() => {
          if (row.previewUrl) {
            URL.revokeObjectURL(row.previewUrl);
          }
          onRemove();
        }}
        className="mt-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function FloorPlanAutoTitleCard({
  title,
  planType,
  titleExample,
  floorPlans,
  onUpdateByTitle,
}: {
  title: string;
  planType: FloorPlanPlanType;
  titleExample: string;
  floorPlans: FloorPlanRow[];
  onUpdateByTitle: (
    title: string,
    planType: FloorPlanPlanType,
    patch: Partial<FloorPlanRow>,
  ) => void;
}) {
  const row =
    findFloorPlanRow(floorPlans, title, planType) ?? {
      id: `auto-${title}-${planType}`,
      label: title,
      planType,
      file: null,
      previewUrl: "",
    };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-sky-50/20 via-white to-white p-4 sm:p-5">
      <FloorPlanRowItem
        row={row}
        titleLocked
        titleExample={titleExample}
        canRemove={false}
        onUpdate={(patch) => onUpdateByTitle(title, planType, patch)}
        onRemove={() => undefined}
      />
    </div>
  );
}

export default function FloorPlansField({
  projectName,
  values,
  onChange,
  autoTitles,
  propertyType,
  subType,
}: {
  projectName: string;
  values: ProjectDetailsValues;
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
  autoTitles?: string[];
  propertyType?: PropertyTypeId;
  subType?: string | string[];
}) {
  const titleExample = propertyType
    ? getFloorPlanTitleExample(propertyType, subType)
    : "3 BHK Flat/Apartment";
  const [activePlanType, setActivePlanType] = useState<FloorPlanPlanType>("2d");

  useLayoutEffect(() => {
    if (autoTitles) return;
    if (values.floorPlans.some((row) => row.planType === activePlanType)) {
      return;
    }
    onChange("floorPlans", [
      ...values.floorPlans,
      {
        id: createRowId(),
        label: "",
        planType: activePlanType,
        file: null,
        previewUrl: "",
      },
    ]);
  }, [activePlanType, autoTitles, onChange, values.floorPlans]);

  const planTypeHeader = (
    <div className="mb-5 flex justify-center sm:justify-start">
      <PlanTypeSwitch value={activePlanType} onChange={setActivePlanType} />
    </div>
  );

  if (autoTitles) {
    const updateByTitle = (
      title: string,
      planType: FloorPlanPlanType,
      patch: Partial<FloorPlanRow>,
    ) => {
      const exists = values.floorPlans.some(
        (item) => item.label === title && item.planType === planType,
      );
      onChange(
        "floorPlans",
        exists
          ? values.floorPlans.map((item) =>
              item.label === title && item.planType === planType
                ? { ...item, ...patch, label: title, planType }
                : item,
            )
          : [
              ...values.floorPlans,
              {
                id: createRowId(),
                label: title,
                planType,
                file: null,
                previewUrl: "",
                ...patch,
              },
            ],
      );
    };

    return (
      <PostPropertyFieldSection
        title={`${projectName.trim() || "Project"} Floor Plan`}
        description="Switch between 2D and 3D, then upload a floor plan image for each size"
      >
        {planTypeHeader}
        {autoTitles.length === 0 ? (
          <p className="text-sm text-slate-500">
            Select BHK and unit type in Available Sizes (step 2) to add floor
            plans.
          </p>
        ) : (
          <div className="space-y-4">
            {autoTitles.map((title) => (
              <FloorPlanAutoTitleCard
                key={`${title}-${activePlanType}`}
                title={title}
                planType={activePlanType}
                titleExample={titleExample}
                floorPlans={values.floorPlans}
                onUpdateByTitle={updateByTitle}
              />
            ))}
          </div>
        )}
      </PostPropertyFieldSection>
    );
  }

  const allRows = values.floorPlans;
  const visibleRows = allRows.filter((row) => row.planType === activePlanType);

  const updateRow = (rowId: string, patch: Partial<FloorPlanRow>) => {
    const current = allRows.find((item) => item.id === rowId);
    if (!current) return;

    const nextLabel = patch.label ?? current.label;
    const duplicate = allRows.some(
      (item) =>
        item.id !== rowId &&
        item.label === nextLabel &&
        item.planType === current.planType,
    );

    if (duplicate && patch.label !== undefined) {
      return;
    }

    onChange(
      "floorPlans",
      allRows.map((item) => (item.id === rowId ? { ...item, ...patch } : item)),
    );
  };

  const removeRow = (rowId: string) => {
    const next = allRows.filter((item) => item.id !== rowId);
    const sameTypeLeft = next.filter((item) => item.planType === activePlanType);
    if (sameTypeLeft.length === 0) {
      onChange("floorPlans", [
        ...next,
        {
          id: createRowId(),
          label: "",
          planType: activePlanType,
          file: null,
          previewUrl: "",
        },
      ]);
      return;
    }
    onChange("floorPlans", next);
  };

  const addRow = () => {
    onChange("floorPlans", [
      ...allRows,
      {
        id: createRowId(),
        label: "",
        planType: activePlanType,
        file: null,
        previewUrl: "",
      },
    ]);
  };

  return (
    <PostPropertyFieldSection
      title={`${projectName.trim() || "Project"} Floor Plan`}
      description="Switch between 2D and 3D, then add a title and upload an image for each plan"
    >
      {planTypeHeader}
      <div className="space-y-4">
        {visibleRows.map((row) => (
          <FloorPlanRowItem
            key={row.id}
            row={row}
            titleExample={titleExample}
            canRemove={visibleRows.length > 1}
            onUpdate={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
          />
        ))}
        <button
          type="button"
          onClick={addRow}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/30 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:border-sky-500 hover:bg-sky-50/60"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Floor Plan
        </button>
      </div>
    </PostPropertyFieldSection>
  );
}
