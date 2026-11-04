"use client";

import { Expand, ImageOff, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import type { FloorPlanViewType, PropertyDetailsFloorPlan } from "./propertyDetails.types";

type PropertyDetailsFloorPlansProps = {
  projectName: string;
  plans: PropertyDetailsFloorPlan[];
  configurations: string[];
};

type FloorPlanGroup = {
  label: string;
  tabLabel: string;
  plansByType: Partial<Record<FloorPlanViewType, PropertyDetailsFloorPlan>>;
};

type FloorPlanPreview = {
  title: string;
  src: string;
  alt: string;
};

const PLAN_TYPE_TABS: { id: FloorPlanViewType; label: string }[] = [
  { id: "2d", label: "2D" },
  { id: "3d", label: "3D" },
];

function configTabLabel(label: string): string {
  const match = label.match(/^(\d+)\s*BHK/i);
  return match ? `${match[1]} BHK` : label;
}

function groupFloorPlans(
  plans: PropertyDetailsFloorPlan[],
  configurations: string[],
): FloorPlanGroup[] {
  const labels =
    configurations.length > 0
      ? configurations.filter((config) => plans.some((plan) => plan.label === config))
      : [...new Set(plans.map((plan) => plan.label))];

  return labels.map((label) => ({
    label,
    tabLabel: configTabLabel(label),
    plansByType: {
      "2d": plans.find((plan) => plan.label === label && plan.planType === "2d"),
      "3d": plans.find((plan) => plan.label === label && plan.planType === "3d"),
    },
  }));
}

function tabClass(active: boolean) {
  return `cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
    active ? "bg-white text-navy-blue shadow-sm" : "text-slate-600 hover:text-navy-blue"
  }`;
}

function FloorPlanPreviewDialog({
  preview,
  onClose,
}: {
  preview: FloorPlanPreview;
  onClose: () => void;
}) {
  const headingId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close floor plan"
        className="absolute inset-0 cursor-pointer bg-slate-900/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-sky-50/80 px-4 py-3 sm:px-5">
          <h3 id={headingId} className="font-display text-base font-bold text-navy-deep sm:text-lg">
            {preview.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-navy-blue"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f3f6fa] p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.src} alt={preview.alt} className="max-h-[72vh] w-full object-contain" />
        </div>
      </div>
    </div>
  );
}

function FloorPlanColumnCard({
  projectName,
  group,
  planType,
  onOpen,
}: {
  projectName: string;
  group: FloorPlanGroup;
  planType: FloorPlanViewType;
  onOpen: (preview: FloorPlanPreview) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const plan = group.plansByType[planType];

  useEffect(() => {
    setImageFailed(false);
  }, [plan?.imageUrl]);
  const summary = plan ?? group.plansByType["2d"] ?? group.plansByType["3d"];
  const imageUrl = plan?.imageUrl && !imageFailed ? plan.imageUrl : null;
  const alt = `${projectName} ${group.tabLabel} ${planType.toUpperCase()} floor plan`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-sky-50/80 px-4 py-3">
        <span className="h-5 w-1 shrink-0 rounded-full bg-navy-blue" aria-hidden />
        <h3 className="min-w-0 truncate font-display text-base font-bold text-navy-deep">{group.tabLabel}</h3>
      </div>

      <button
        type="button"
        disabled={!imageUrl}
        onClick={() => imageUrl && onOpen({ title: `${group.tabLabel} floor plan`, src: imageUrl, alt })}
        className="relative flex flex-1 bg-[#f3f6fa] p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 enabled:cursor-pointer disabled:cursor-default sm:p-4"
        aria-label={imageUrl ? `Enlarge ${group.tabLabel} floor plan` : undefined}
      >
        <span className="flex min-h-56 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-4 shadow-[inset_0_0_0_6px_#f8fafc] sm:min-h-64">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={alt}
              onError={() => setImageFailed(true)}
              className="max-h-52 w-full object-contain sm:max-h-60"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-slate-400">
              <ImageOff className="h-6 w-6" aria-hidden />
              {planType.toUpperCase()} plan is not available
            </span>
          )}
        </span>
        {imageUrl ? (
          <span className="absolute right-6 bottom-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-navy-blue shadow-sm">
            <Expand className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </button>

      {summary ? (
        <dl className="grid grid-cols-2 border-t border-slate-100">
          <div className="px-4 py-3.5">
            <dt className="text-xs text-slate-500">{summary.areaType}</dt>
            <dd className="mt-1 font-display text-sm font-bold text-navy-blue sm:text-base">{summary.areaLabel}</dd>
          </div>
          <div className="border-l border-slate-100 px-4 py-3.5">
            <dt className="text-xs text-slate-500">Price</dt>
            <dd className="mt-1 font-display text-sm font-bold text-navy-blue sm:text-base">{summary.priceLabel}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

export function PropertyDetailsFloorPlans({
  projectName,
  plans,
  configurations,
}: PropertyDetailsFloorPlansProps) {
  const groups = groupFloorPlans(plans, configurations);
  const [planType, setPlanType] = useState<FloorPlanViewType>("2d");
  const [preview, setPreview] = useState<FloorPlanPreview | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);

  if (groups.length === 0) return null;

  return (
    <div>
      <div
        className="mb-4 inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 p-1"
        role="tablist"
        aria-label="Floor plan view"
      >
        {PLAN_TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === planType}
            onClick={() => setPlanType(tab.id)}
            className={tabClass(tab.id === planType)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <FloorPlanColumnCard
            key={group.label}
            projectName={projectName}
            group={group}
            planType={planType}
            onOpen={setPreview}
          />
        ))}
      </div>

      {preview ? <FloorPlanPreviewDialog preview={preview} onClose={closePreview} /> : null}
    </div>
  );
}
