"use client";

import { ImagePlus, Plus, X } from "lucide-react";
import { useRef } from "react";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import PostPropertyInput from "./PostPropertyInput";
import {
  createRowId,
  type FloorPlanRow,
  type ProjectDetailsValues,
} from "./postPropertyProjectDetails";

const uploadButtonClassName =
  "bg-linear-to-r-navy-blue inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99]";

function FloorPlanRowItem({
  row,
  canRemove,
  onUpdate,
  onRemove,
}: {
  row: FloorPlanRow;
  canRemove: boolean;
  onUpdate: (patch: Partial<FloorPlanRow>) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (row.previewUrl) {
      URL.revokeObjectURL(row.previewUrl);
    }
    onUpdate({ file, previewUrl: URL.createObjectURL(file) });
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-4">
      <div className="grid flex-1 gap-4 md:grid-cols-[1fr_auto] md:items-end md:gap-6">
        <PostPropertyInput
          id={`floorPlanLabel-${row.id}`}
          label="Floor Plan Title (e.g. 3 BHK Flat/Apartment)"
          variant="underline"
          prominentLabel
          compactProminentLabel
          value={row.label}
          onChange={(value) => onUpdate({ label: value })}
        />
        <div className="flex items-center gap-3">
          {row.previewUrl ? (
            <img
              src={row.previewUrl}
              alt={row.label || "Floor plan"}
              className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-sky-200 bg-sky-50/30">
              <ImagePlus className="h-6 w-6 text-sky-500" aria-hidden />
            </span>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={uploadButtonClassName}
          >
            {row.file ? "Change Image" : "Upload Image"}
          </button>
        </div>
      </div>
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

export default function FloorPlansField({
  projectName,
  values,
  onChange,
}: {
  projectName: string;
  values: ProjectDetailsValues;
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
}) {
  const rows = values.floorPlans;

  return (
    <PostPropertyFieldSection
      title={`${projectName.trim() || "Project"} Floor Plan`}
      description="Add a title and upload a floor plan image for each configuration"
    >
      <div className="space-y-4">
        {rows.map((row) => (
          <FloorPlanRowItem
            key={row.id}
            row={row}
            canRemove={rows.length > 1}
            onUpdate={(patch) =>
              onChange(
                "floorPlans",
                rows.map((item) =>
                  item.id === row.id ? { ...item, ...patch } : item,
                ),
              )
            }
            onRemove={() =>
              onChange(
                "floorPlans",
                rows.filter((item) => item.id !== row.id),
              )
            }
          />
        ))}
        <button
          type="button"
          onClick={() =>
            onChange("floorPlans", [
              ...rows,
              { id: createRowId(), label: "", file: null, previewUrl: "" },
            ])
          }
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/30 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:border-sky-500 hover:bg-sky-50/60"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Floor Plan
        </button>
      </div>
    </PostPropertyFieldSection>
  );
}