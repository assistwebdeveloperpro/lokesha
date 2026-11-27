"use client";

import { Building2, IndianRupee, MapPin, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LimelightProject } from "@/services/limelightProjects.service";
import { FeaturedPossessionBadge } from "../featured-projects/FeaturedPossessionBadge";
import {
  buildLimelightDetailsHref,
  formatLimelightLocation,
  formatLimelightPrice,
} from "../limelight-projects/limelightFormat";

type PopularCardProps = {
  project: LimelightProject;
  isPriority?: boolean;
};

type PopularDetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  isHighlighted?: boolean;
};

function PopularDetailRow({ icon: Icon, label, value, isHighlighted = false }: PopularDetailRowProps) {
  return (
    <li className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors duration-300"
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p
          className={
            isHighlighted
              ? "font-display truncate text-base font-bold text-navy-blue"
              : "truncate text-sm font-medium text-slate-700"
          }
        >
          {value}
        </p>
      </div>
    </li>
  );
}

export function PopularCard({ project, isPriority = false }: PopularCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const location = formatLimelightLocation(project);
  const showImage = project.imageUrl && !hasImageError;

  return (
    <Link
      href={buildLimelightDetailsHref(project)}
      aria-label={`View details of ${project.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-slate-100">
        {showImage ? (
          <Image
            src={project.imageUrl as string}
            alt={`${project.title} project`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 85vw"
            priority={isPriority}
            onError={() => setHasImageError(true)}
            className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Building2 className="h-10 w-10" aria-hidden />
          </div>
        )}
        
        
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="min-w-0">
          <h3 className="font-display truncate text-lg font-bold leading-snug text-slate-900">{project.title}</h3>
          <p className="mt-0.5 truncate text-xs sm:text-sm font-medium text-slate-500">{project.builderName ?? "Lokesha"}</p>
        </div>

        <div className="my-4 h-px w-full bg-linear-to-r from-sky-200 via-slate-200 to-transparent" aria-hidden />

        <ul className="space-y-3.5">
          <PopularDetailRow icon={Building2} label="Configuration" value={project.categoryLabel || "—"} />
          <PopularDetailRow icon={MapPin} label="Locality" value={location || "Location not available"} />
          <PopularDetailRow icon={IndianRupee} label="Price" value={formatLimelightPrice(project)} isHighlighted />
        </ul>
      </div>

     
    </Link>
  );
}
