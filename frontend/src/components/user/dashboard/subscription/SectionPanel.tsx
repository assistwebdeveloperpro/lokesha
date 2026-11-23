import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SectionPanelProps = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

export default function SectionPanel({ id, icon: Icon, title, description, children }: SectionPanelProps) {
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 border-l-4 border-l-sky-500 bg-white px-4 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="font-display text-base font-bold text-slate-800 lg:text-lg">
            {title}
          </h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
