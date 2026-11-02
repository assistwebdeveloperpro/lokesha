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
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}
    >
      <div className="border-b border-slate-200 bg-sky-50/90 px-4 py-3 text-start sm:px-5">
        <h2 className="font-display text-base font-bold tracking-tight text-navy-blue sm:text-lg">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
