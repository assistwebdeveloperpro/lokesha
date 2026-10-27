"use client";

import { ImagePlus, Loader2, Plus, RotateCw, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  createRowId,
  findFloorPlanRow,
  type FloorPlanPlanType,
  type FloorPlanRow,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyInput from "../components/PostPropertyInput";
import type { PropertyTypeId } from "../config/postPropertyForm.shared";
import type { MediaUploader } from "../utils/mediaUploader";
import { MAX_PARALLEL_UPLOADS, runWithConcurrency } from "../utils/photosVideosValues";
import { removeStoredFile, uploadItemFile, type UploadPatch } from "../utils/uploadItemFile";
import { getFloorPlanTitleExample } from "./builderConfig";

const uploadButtonClassName =
  "bg-linear-to-r-navy-blue inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99]";

const planTypeOptions: { id: FloorPlanPlanType; label: string }[] = [
  { id: "2d", label: "2D" },
  { id: "3d", label: "3D" },
];

const createEmptyRow = (planType: FloorPlanPlanType, label = ""): FloorPlanRow => ({
  id: createRowId(),
  label,
  planType,
  file: null,
  previewUrl: "",
});

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

function RowUploadStatus({ row, onRetry }: { row: FloorPlanRow; onRetry: () => void }) {
  if (row.status === "uploading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Uploading
      </span>
    );
  }

  if (row.status === "error") {
    return (
      <span className="inline-flex flex-wrap items-center gap-2 text-xs">
        <span className="text-red-600" role="alert">
          {row.errorMessage ?? "Upload failed"}
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex cursor-pointer items-center gap-1 font-semibold text-sky-700 transition hover:text-sky-900"
        >
          <RotateCw className="h-3 w-3" aria-hidden /> Retry
        </button>
      </span>
    );
  }

  return null;
}

function FloorPlanRowItem({
  row,
  canRemove,
  onUpdate,
  onFile,
  onRetry,
  onRemove,
  titleExample,
  titleLocked = false,
}: {
  row: FloorPlanRow;
  canRemove: boolean;
  onUpdate: (patch: Partial<FloorPlanRow>) => void;
  onFile: (file: File) => void;
  onRetry: () => void;
  onRemove: () => void;
  titleExample: string;
  titleLocked?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage = Boolean(row.file || row.remote);

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".jpg,.jpeg,.png,.heic"
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) {
          onFile(file);
          event.target.value = "";
        }
      }}
    />
  );

  const previewThumb = row.previewUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
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
      {hasImage ? "Change Image" : "Upload Image"}
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
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          {previewThumb}
          {uploadButton}
        </div>
        <RowUploadStatus row={row} onRetry={onRetry} />
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
        onClick={onRemove}
        className="mt-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
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
  uploader,
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
  // With an uploader every image is sent to the server as soon as it is chosen
  uploader?: MediaUploader;
}) {
  const titleExample = propertyType
    ? getFloorPlanTitleExample(propertyType, subType)
    : "3 BHK Flat/Apartment";
  const [activePlanType, setActivePlanType] = useState<FloorPlanPlanType>("2d");

  // Uploads finish long after the render that started them, so they write to the newest rows
  const latestRows = useRef(values.floorPlans);
  useEffect(() => {
    latestRows.current = values.floorPlans;
  });

  const commitRows = useCallback(
    (update: (rows: FloorPlanRow[]) => FloorPlanRow[]) => {
      latestRows.current = update(latestRows.current);
      onChange("floorPlans", latestRows.current);
    },
    [onChange],
  );

  const patchRow = (id: string, change: Partial<FloorPlanRow>) =>
    commitRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...change } : row)));

  const startUpload = (row: FloorPlanRow) => {
    if (!uploader) return;

    const context = {
      uploader,
      exists: (id: string) => latestRows.current.some((item) => item.id === id),
      // The upload releases the file by setting it to undefined; rows hold null for no file
      patch: (id: string, change: UploadPatch) =>
        patchRow(id, "file" in change ? { ...change, file: null } : change),
    };
    void runWithConcurrency([row], MAX_PARALLEL_UPLOADS, (item) =>
      uploadItemFile(context, item, "floor-plan", { label: item.label, planType: item.planType }),
    );
  };

  const retryUpload = (rowId: string) => {
    const row = latestRows.current.find((item) => item.id === rowId);
    if (row) startUpload(row);
  };

  // `current` is the displayed row, which for an auto title may not exist in the values yet
  const handleFile = (current: FloorPlanRow, file: File) => {
    const existing = latestRows.current.find(
      (item) => item.id === current.id || (item.label === current.label && item.planType === current.planType),
    );
    if (existing?.previewUrl) URL.revokeObjectURL(existing.previewUrl);
    if (uploader) void removeStoredFile(uploader, existing);

    const next: FloorPlanRow = {
      ...(existing ?? createEmptyRow(current.planType, current.label)),
      file,
      previewUrl: URL.createObjectURL(file),
      remote: undefined,
      errorMessage: undefined,
      ...(uploader ? { status: "uploading" as const } : {}),
    };

    commitRows((rows) => (existing ? rows.map((row) => (row.id === existing.id ? next : row)) : [...rows, next]));
    startUpload(next);
  };

  const discardRow = (row: FloorPlanRow | undefined) => {
    if (row?.previewUrl) URL.revokeObjectURL(row.previewUrl);
    if (uploader) void removeStoredFile(uploader, row);
  };

  useLayoutEffect(() => {
    if (autoTitles) return;
    if (values.floorPlans.some((row) => row.planType === activePlanType)) {
      return;
    }
    commitRows((rows) => [...rows, createEmptyRow(activePlanType)]);
  }, [activePlanType, autoTitles, commitRows, values.floorPlans]);

  const planTypeHeader = (
    <div className="mb-5 flex justify-center sm:justify-start">
      <PlanTypeSwitch value={activePlanType} onChange={setActivePlanType} />
    </div>
  );

  if (autoTitles) {
    const updateByTitle = (title: string, planType: FloorPlanPlanType, patch: Partial<FloorPlanRow>) =>
      commitRows((rows) =>
        rows.some((item) => item.label === title && item.planType === planType)
          ? rows.map((item) =>
              item.label === title && item.planType === planType
                ? { ...item, ...patch, label: title, planType }
                : item,
            )
          : [...rows, { ...createEmptyRow(planType, title), ...patch }],
      );

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
            {autoTitles.map((title) => {
              const row =
                findFloorPlanRow(values.floorPlans, title, activePlanType) ?? {
                  ...createEmptyRow(activePlanType, title),
                  id: `auto-${title}-${activePlanType}`,
                };

              return (
                <div
                  key={`${title}-${activePlanType}`}
                  className="rounded-xl border border-slate-200/80 bg-linear-to-br from-sky-50/20 via-white to-white p-4 sm:p-5"
                >
                  <FloorPlanRowItem
                    row={row}
                    titleLocked
                    titleExample={titleExample}
                    canRemove={false}
                    onUpdate={(patch) => updateByTitle(title, activePlanType, patch)}
                    onFile={(file) => handleFile(row, file)}
                    onRetry={() => retryUpload(row.id)}
                    onRemove={() => undefined}
                  />
                </div>
              );
            })}
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

    patchRow(rowId, patch);
  };

  const removeRow = (rowId: string) => {
    discardRow(latestRows.current.find((item) => item.id === rowId));

    commitRows((rows) => {
      const next = rows.filter((item) => item.id !== rowId);
      // Each plan type always keeps one empty row to fill in
      return next.some((item) => item.planType === activePlanType)
        ? next
        : [...next, createEmptyRow(activePlanType)];
    });
  };

  const addRow = () => commitRows((rows) => [...rows, createEmptyRow(activePlanType)]);

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
            onFile={(file) => handleFile(row, file)}
            onRetry={() => retryUpload(row.id)}
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
