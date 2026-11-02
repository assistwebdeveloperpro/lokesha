"use client";

import { useState } from "react";
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

function FloorPlanColumnCard({
  projectName,
  group,
  planType,
}: {
  projectName: string;
  group: FloorPlanGroup;
  planType: FloorPlanViewType;
}) {
  const plan = group.plansByType[planType];
  const summary = plan ?? group.plansByType["2d"] ?? group.plansByType["3d"];

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-3 py-2.5 sm:px-4">
        <h3 className="text-sm font-bold text-navy-blue sm:text-base">{group.tabLabel}</h3>
        {summary ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] text-slate-500">{summary.areaType}</p>
              <p className="text-xs font-semibold text-navy-blue">{summary.areaLabel}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Price</p>
              <p className="text-xs font-semibold text-navy-blue">{summary.priceLabel}</p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex h-52 w-full items-center justify-center bg-slate-50 sm:h-64">
        {plan?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plan.imageUrl}
            alt={`${projectName} ${group.tabLabel} ${planType.toUpperCase()} floor plan`}
            className="h-full w-full object-contain"
          />
        ) : (
          <p className="px-3 text-center text-sm text-slate-400">
            {planType.toUpperCase()} floor plan not available
          </p>
        )}
      </div>
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

  if (groups.length === 0) return null;

  const [featured, ...rest] = groups;

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

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <FloorPlanColumnCard projectName={projectName} group={featured} planType={planType} />
        <div className="space-y-4">
          {rest.map((group) => (
            <FloorPlanColumnCard
              key={group.label}
              projectName={projectName}
              group={group}
              planType={planType}
            />
          ))}
        </div>
        <div className="hidden lg:block" aria-hidden />
      </div>
    </div>
  );
}
