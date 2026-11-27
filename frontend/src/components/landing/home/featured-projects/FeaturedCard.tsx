"use client";

import { Building2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LimelightProject } from "@/services/limelightProjects.service";
import {
  buildLimelightDetailsHref,
  formatLimelightLocation,
  formatLimelightPrice,
} from "../limelight-projects/limelightFormat";
import { FeaturedPossessionBadge } from "./FeaturedPossessionBadge";

type FeaturedCardProps = {
  project: LimelightProject;
  isPriority?: boolean;
};

export function FeaturedCard({ project, isPriority = false }: FeaturedCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const location = formatLimelightLocation(project);
  const showImage = project.imageUrl && !hasImageError;

  return (
    <Link
      href={buildLimelightDetailsHref(project)}
      aria-label={`View details of ${project.title}`}
      className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:min-h-104"
    >
      <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-60">
        {showImage ? (
          <Image
            src={project.imageUrl as string}
            alt={`${project.title} project`}
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 60vw, 85vw"
            priority={isPriority}
            onError={() => setHasImageError(true)}
            className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Building2 className="h-10 w-10" aria-hidden />
          </div>
        )}
        {project.possessionDate && <FeaturedPossessionBadge possessionDate={project.possessionDate} />}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 px-1 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3 pt-2">
          <div className="min-w-0">
            <h3 className="font-display truncate text-base font-bold leading-snug md:text-xl text-slate-900">{project.title}</h3>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-600">by {project.builderName ?? "Lokesha"}</p>
          </div>
          <p className="font-display max-w-[45%] shrink-0 truncate text-sm font-bold text-navy-blue md:text-base">
            {formatLimelightPrice(project)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600 md:min-h-14 md:flex-row md:items-center md:justify-between md:gap-3">
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
            <span className="truncate">{location || "Location not available"}</span>
          </p>
          <p className="flex min-w-0 max-w-full shrink-0 items-center gap-1.5 md:max-w-[50%]">
            <Building2 className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
            <span className="truncate">{project.categoryLabel}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
