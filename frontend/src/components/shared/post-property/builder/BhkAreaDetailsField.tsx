"use client";

import { useState } from "react";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyInput from "../components/PostPropertyInput";
import {
  areaTypeDropdownOptions,
  dropdownMenuClassName,
} from "../step-2-property-details/PropertyDetailsParts";
import {
  EMPTY_BHK_AREA_DETAILS,
  type BhkAreaDetails,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import type { BhkAreaErrors, BhkAreaTab } from "./bhkAreaDetails";

type AreaFieldConfig = {
  field: keyof BhkAreaDetails;
  label: string;
  placeholder?: string;
  options?: typeof areaTypeDropdownOptions;
};

const AREA_FIELD_ROWS: AreaFieldConfig[][] = [
  [
    { field: "carpetAreaMin", label: "Carpet Area Min*", placeholder: "e.g. 800" },
    { field: "carpetAreaMax", label: "Carpet Area Max", placeholder: "e.g. 1000" },
    { field: "carpetAreaType", label: "Carpet Area Type*", options: areaTypeDropdownOptions },
  ],
  [
    { field: "superBuildUpMin", label: "Super Built-up Min*", placeholder: "e.g. 1100" },
    { field: "superBuildUpMax", label: "Super Built-up Max", placeholder: "e.g. 1300" },
    { field: "superBuildUpType", label: "Super Built-up Type*", options: areaTypeDropdownOptions },
  ],
];

export default function BhkAreaDetailsField({
  tabs,
  values,
  onChange,
  errors,
  showErrors,
}: {
  tabs: BhkAreaTab[];
  values: ProjectDetailsValues;
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
  errors: BhkAreaErrors;
  showErrors: boolean;
}) {
  const [selectedKey, setSelectedKey] = useState("");
  const firstErrorKey = tabs.find((tab) => errors[tab.key])?.key;
  const activeTab = tabs.find((tab) => tab.key === selectedKey) ?? tabs[0];

  // A failed Next jumps to the first BHK that still needs input
  const [previousShowErrors, setPreviousShowErrors] = useState(showErrors);
  if (previousShowErrors !== showErrors) {
    setPreviousShowErrors(showErrors);
    if (showErrors && firstErrorKey) {
      setSelectedKey(firstErrorKey);
    }
  }

  if (!activeTab) {
    return null;
  }

  const details = values.bhkAreaDetails[activeTab.key] ?? EMPTY_BHK_AREA_DETAILS;
  const tabErrors = showErrors ? (errors[activeTab.key] ?? {}) : {};

  const update = (field: keyof BhkAreaDetails, value: string) =>
    onChange("bhkAreaDetails", {
      ...values.bhkAreaDetails,
      [activeTab.key]: { ...details, [field]: value },
    });

  return (
    <PostPropertyFieldSection
      title="Area Details"
      description="Enter carpet area and super built-up range for each selected BHK"
    >
      <div className="space-y-5">
        <div
          role="tablist"
          aria-label="Area details by BHK"
          className="flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200/90 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab.key;
            const hasError = showErrors && Boolean(errors[tab.key]);

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedKey(tab.key)}
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                }`}
              >
                {tab.bhk}
                {hasError ? (
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive ? "bg-red-400 ring-2 ring-white/80" : "bg-red-500"
                    }`}
                    aria-label="Has errors"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="space-y-5">
          {AREA_FIELD_ROWS.map((row) => (
            <div key={row[0].field} className="grid gap-4 md:grid-cols-3 md:gap-6">
              {row.map(({ field, label, placeholder, options }) => (
                <PostPropertyInput
                  key={`${activeTab.key}-${field}`}
                  id={`bhkArea-${activeTab.key.replace(/\W+/g, "-")}-${field}`}
                  label={label}
                  placeholder={placeholder}
                  variant="underline"
                  type={options ? undefined : "number"}
                  staticLabel
                  options={options}
                  dropdownMenuClassName={options ? dropdownMenuClassName : undefined}
                  value={details[field]}
                  error={tabErrors[field]}
                  onChange={(value) => update(field, value)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </PostPropertyFieldSection>
  );
}
