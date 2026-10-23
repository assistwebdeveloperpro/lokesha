"use client";

import { ChevronDown, Plus, X } from "lucide-react";
import { useId, useState } from "react";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyInput from "../components/PostPropertyInput";
import {
  POST_PROPERTY_EXPANDABLE_GROUP,
  POST_PROPERTY_EXPANDABLE_GROUP_TITLE,
  POST_PROPERTY_EXPANDABLE_TRIGGER,
  POST_PROPERTY_INNER_PANEL,
  POST_PROPERTY_SECTION,
  POST_PROPERTY_SECTION_ACCENT,
  POST_PROPERTY_SECTION_DESC,
  POST_PROPERTY_SECTION_HEADER,
  POST_PROPERTY_SECTION_TITLE,
} from "../config/postPropertyForm.styles";
import {
  PROJECT_AREA_UNIT_OPTIONS,
  createRowId,
  type ProjectDetailsValues,
  type SpecificationGroup,
} from "@/components/master/post-property/postPropertyProjectDetails";

type OnChange = <K extends keyof ProjectDetailsValues>(
  field: K,
  value: ProjectDetailsValues[K],
) => void;

const dropdownMenuClassName =
  "absolute left-0 z-50 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10";

const areaUnitOptions = PROJECT_AREA_UNIT_OPTIONS.map((value) => ({
  value,
  label: value,
}));

export function ProjectExtraDetailsField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  return (
    <PostPropertyFieldSection
      title="Project Size & Pricing"
      description="Add area unit and average price"
    >
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <PostPropertyInput
          id="areaUnit"
          ariaLabel="Area Unit"
          label="Area Unit"
          variant="underline"
          staticLabel
          options={areaUnitOptions}
          value={values.areaUnit}
          onChange={(value) => onChange("areaUnit", value)}
          dropdownMenuClassName={dropdownMenuClassName}
        />
        <PostPropertyInput
          id="avgPrice"
          label="Avg. Price"
          placeholder={`e.g. 28 K/${values.areaUnit || "sq yd"}`}
          variant="underline"
          staticLabel
          value={values.avgPrice}
          onChange={(value) => onChange("avgPrice", value)}
        />
      </div>
    </PostPropertyFieldSection>
  );
}

function AddOptionRow({
  existingLabels,
  onAdd,
}: {
  existingLabels: string[];
  onAdd: (label: string) => void;
}) {
  const inputId = useId();
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }
    if (
      existingLabels.some((item) => item.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError("This option already exists");
      return;
    }
    onAdd(trimmed);
    setLabel("");
    setError("");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div
          className="min-w-0 flex-1 rounded-xl border border-sky-100 bg-white px-4 py-3 shadow-sm"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
        >
          <PostPropertyInput
            id={inputId}
            label="New field name"
            placeholder="e.g. Doors"
            variant="underline"
            staticLabel
            value={label}
            onChange={(value) => {
              setLabel(value);
              setError("");
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!label.trim()}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm shadow-sky-600/25 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add field
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ProjectSpecificationsField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  const groups = values.specifications;
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleGroup = (groupId: string) =>
    setExpandedIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );

  const updateGroup = (
    groupId: string,
    update: (group: SpecificationGroup) => SpecificationGroup,
  ) =>
    onChange(
      "specifications",
      groups.map((group) => (group.id === groupId ? update(group) : group)),
    );

  return (
    <section className={POST_PROPERTY_SECTION}>
      <div className={POST_PROPERTY_SECTION_HEADER}>
        <span className={POST_PROPERTY_SECTION_ACCENT} aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className={POST_PROPERTY_SECTION_TITLE}>Specifications</h3>
          <p className={POST_PROPERTY_SECTION_DESC}>
            Fill only the values you need. Add your own options if something is
            missing
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {groups.map((group) => {
          const isOpen = expandedIds.includes(group.id);
          const filledCount = group.items.filter((item) => item.value.trim()).length;

          return (
          <div key={group.id} className={POST_PROPERTY_EXPANDABLE_GROUP}>
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              aria-controls={`spec-group-${group.id}`}
              className={POST_PROPERTY_EXPANDABLE_TRIGGER}
            >
              <div className="min-w-0 flex-1">
                <h4 className={POST_PROPERTY_EXPANDABLE_GROUP_TITLE}>
                  {group.title}
                </h4>
                {!isOpen && filledCount > 0 ? (
                  <p className="mt-0.5 text-xs font-medium text-sky-600">
                    {filledCount} field{filledCount === 1 ? "" : "s"} filled
                  </p>
                ) : null}
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-sky-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            <div
              id={`spec-group-${group.id}`}
              hidden={!isOpen}
              className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5"
            >
            <div className={`${POST_PROPERTY_INNER_PANEL} space-y-4`}>
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <PostPropertyInput
                      id={`spec-${item.id}`}
                      label={item.label}
                      variant="underline"
                      staticLabel
                      value={item.value}
                      onChange={(value) =>
                        updateGroup(group.id, (current) => ({
                          ...current,
                          items: current.items.map((row) =>
                            row.id === item.id ? { ...row, value } : row,
                          ),
                        }))
                      }
                    />
                  </div>
                  {item.custom ? (
                    <button
                      type="button"
                      aria-label={`Remove ${item.label}`}
                      onClick={() =>
                        updateGroup(group.id, (current) => ({
                          ...current,
                          items: current.items.filter(
                            (row) => row.id !== item.id,
                          ),
                        }))
                      }
                      className="mt-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-sky-100 pt-5">
              <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/80 px-4 py-5 sm:px-5">
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/30">
                    <Plus className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-display text-sm font-semibold text-slate-800 sm:text-base">
                      Add custom option
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                      Missing a field? Type a name and add a new field here.
                    </p>
                  </div>
                </div>
                <AddOptionRow
                  existingLabels={group.items.map((item) => item.label)}
                  onAdd={(label) =>
                    updateGroup(group.id, (current) => ({
                      ...current,
                      items: [
                        ...current.items,
                        { id: createRowId(), label, value: "", custom: true },
                      ],
                    }))
                  }
                />
              </div>
            </div>
            </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
