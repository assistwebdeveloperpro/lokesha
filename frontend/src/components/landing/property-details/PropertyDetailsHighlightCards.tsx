import { BedDouble, CalendarDays } from "lucide-react";

type PropertyDetailsHighlightCardsProps = {
  bhkLabel: string;
  possessionLabel: string;
};

export function PropertyDetailsHighlightCards({
  bhkLabel,
  possessionLabel,
}: PropertyDetailsHighlightCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <BedDouble className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-medium text-slate-500">Configuration</p>
          <p className="text-sm font-bold text-navy-blue sm:text-base">{bhkLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-medium text-slate-500">Possession</p>
          <p className="text-sm font-bold text-navy-blue sm:text-base">{possessionLabel}</p>
        </div>
      </div>
    </div>
  );
}
