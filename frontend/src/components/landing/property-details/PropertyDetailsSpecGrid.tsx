import type { PropertyDetailsSpecRow } from "./propertyDetails.types";

type PropertyDetailsSpecGridProps = {
  rows: PropertyDetailsSpecRow[];
  columns?: 1 | 2;
};

export function PropertyDetailsSpecGrid({ rows, columns = 2 }: PropertyDetailsSpecGridProps) {
  const gridClass =
    columns === 1
      ? "grid grid-cols-1"
      : "grid grid-cols-1 sm:grid-cols-2";

  return (
    <dl className={gridClass}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="border-b border-slate-100 py-3 last:border-b-0 sm:px-1 sm:py-3.5"
        >
          <dt className="text-xs font-medium text-slate-500 sm:text-sm">{row.label}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-slate-900 sm:text-base">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
