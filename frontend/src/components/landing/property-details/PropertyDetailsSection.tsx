import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PropertyDetailsSectionProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function PropertyDetailsSection({
  title,
  icon: Icon,
  children,
  className = "",
  id,
}: PropertyDetailsSectionProps) {
  return (
    <section
      id={id}
      className={`overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5 ${className}`.trim()}
    >
      <div className="flex items-center gap-3 border-b border-slate-200 bg-sky-50/90 px-4 py-2 text-start sm:px-5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100"
          aria-hidden
        >
          <Icon className="h-4.5 w-4.5 text-sky-600" strokeWidth={2} />
        </span>
        <h2 className="font-display text-base font-bold tracking-tight text-navy-deep sm:text-lg">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
