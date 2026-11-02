import { Building2 } from "lucide-react";
import type { PropertyDetailsDeveloper } from "./propertyDetails.types";
import { PropertyDetailsSection } from "./PropertyDetailsSection";

type PropertyDetailsDeveloperCardProps = {
  developer: PropertyDetailsDeveloper;
};

export function PropertyDetailsDeveloperCard({ developer }: PropertyDetailsDeveloperCardProps) {
  return (
    <PropertyDetailsSection title="About Developer" className="mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <Building2 className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-navy-blue">{developer.name}</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md">
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-navy-blue">{developer.totalProjects}</p>
              <p className="text-[11px] font-medium text-slate-500">Total Projects</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-navy-blue">{developer.ongoingProjects}</p>
              <p className="text-[11px] font-medium text-slate-500">Ongoing</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-navy-blue">{developer.completedProjects}</p>
              <p className="text-[11px] font-medium text-slate-500">Completed</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{developer.description}</p>
        </div>
      </div>
    </PropertyDetailsSection>
  );
}
