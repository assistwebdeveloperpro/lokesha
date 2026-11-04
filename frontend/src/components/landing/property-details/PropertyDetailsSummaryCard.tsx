import type { PropertyDetailsSpecRow } from "./propertyDetails.types";
import { PropertyDetailsSpecGrid } from "./PropertyDetailsSpecGrid";

export type PropertyDetailsSummaryGroup = {
  title?: string;
  rows: PropertyDetailsSpecRow[];
};

type PropertyDetailsSummaryCardProps = {
  title: string;
  groups: PropertyDetailsSummaryGroup[];
};

export function PropertyDetailsSummaryCard({ title, groups }: PropertyDetailsSummaryCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md shadow-slate-900/8 ring-1 ring-slate-900/5">
      <div className="border-b border-slate-100 bg-sky-50/90 px-4 py-3 text-center sm:px-5">
        <h2 className="font-display text-base font-bold tracking-tight text-navy-deep sm:text-lg">
          {title}
        </h2>
      </div>
      <div className="flex-1 p-4 sm:p-5">
        {groups.map((group, index) => (
          <div
            key={group.title ?? `summary-${index}`}
            className={index > 0 ? "mt-4 border-t border-slate-200 pt-4" : undefined}
          >
            {group.title ? (
              <h3 className="mb-1 text-center font-display text-sm font-bold tracking-tight text-navy-deep sm:text-base">
                {group.title}
              </h3>
            ) : null}
            <PropertyDetailsSpecGrid rows={group.rows} />
          </div>
        ))}
      </div>
    </div>
  );
}
