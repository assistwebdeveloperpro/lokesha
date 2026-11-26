"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPropertyDetailsUrl } from "@/lib/property-search-url/propertyDetailsUrl";
import type { LimelightSearchResult } from "@/services/adminLimelightProjects.service";
import LimelightProjectThumb from "./LimelightProjectThumb";
import { formatProjectLocation, formatProjectPrice } from "./limelightShared";

type LimelightResultCardProps = {
  project: LimelightSearchResult;
  isSelected: boolean;
  onToggle: (project: LimelightSearchResult) => void;
};

type CardLinkProps = { href: string | null; className: string; children: ReactNode };

// Opens in a new tab so the admin keeps the current selection
function CardLink({ href, className, children }: CardLinkProps) {
  if (!href) return <div className={className}>{children}</div>;

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </Link>
  );
}

export default function LimelightResultCard({ project, isSelected, onToggle }: LimelightResultCardProps) {
  const { alreadyAdded, detailsSource } = project;

  return (
    <li className="relative">
      <CardLink
        href={detailsSource ? buildPropertyDetailsUrl(detailsSource) : null}
        className={cn(
          "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-sky-500",
          isSelected
            ? "border-sky-600 shadow-[0_0_0_4px_rgba(14,165,233,0.2),0_12px_28px_rgba(14,165,233,0.25)]"
            : "border-slate-200/90",
        )}
      >
        <div className="relative">
          <LimelightProjectThumb src={project.mainImage} alt={project.projectName} className="aspect-16/10 w-full" />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-slate-900/40 to-transparent"
          />
          {alreadyAdded ? (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              Already Added
            </span>
          ) : null}
          {isSelected ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              Selected
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="font-display truncate text-base font-bold text-slate-900">{project.projectName}</h3>
          <p className="truncate text-sm text-slate-600">{project.builderName ?? "Builder not available"}</p>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
            <span className="truncate">{formatProjectLocation(project)}</span>
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <p className="text-sm font-semibold text-slate-900">{formatProjectPrice(project)}</p>
            <span className="h-5 w-5 shrink-0" aria-hidden />
          </div>
        </div>
      </CardLink>

      {alreadyAdded ? null : (
        <label
          className={cn(
            "absolute bottom-4 right-4 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border",
            isSelected ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300 bg-white",
            "focus-within:ring-2 focus-within:ring-sky-500",
          )}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={isSelected}
            aria-label={`Select ${project.projectName}`}
            onChange={() => onToggle(project)}
          />
          {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
        </label>
      )}
    </li>
  );
}
