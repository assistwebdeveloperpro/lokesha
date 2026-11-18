import { Users } from "lucide-react";
import { LEADS_EMPTY_STATE } from "./leadsShared";

export default function LeadsEmptyState() {
  const { title, description } = LEADS_EMPTY_STATE;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center sm:py-20">
      <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-sky-50 shadow-sm ring-1 ring-black/5">
        <Users className="h-9 w-9 text-sky-600" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="font-display mt-6 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
