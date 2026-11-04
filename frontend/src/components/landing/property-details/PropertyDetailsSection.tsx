import type { ReactNode } from "react";

type PropertyDetailsSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function PropertyDetailsSection({
  title,
  children,
  className = "",
  id,
}: PropertyDetailsSectionProps) {
  return (
    <section
      id={id}
      className={`overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5 ${className}`.trim()}
    >
      <div className="flex items-center gap-3 border-b border-slate-200 bg-sky-50/90 px-4 py-3 text-start sm:px-5">
        <span className="h-5 w-1 shrink-0 rounded-full bg-navy-blue" aria-hidden />
        <h2 className="font-display text-base font-bold tracking-tight text-navy-deep sm:text-lg">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
