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

type IconicCardProps = {
  project: LimelightProject;
  isPriority?: boolean;
};

export function IconicCard({ project, isPriority = false }: IconicCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const location = formatLimelightLocation(project);
  const showImage = project.imageUrl && !hasImageError;

  return (
    <Link
      href={buildLimelightDetailsHref(project)}
      aria-label={`View details of ${project.title}`}
      className="group relative block h-80 overflow-hidden rounded-3xl bg-slate-900 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:h-104"
    >
      {showImage ? (
        <Image
          src={project.imageUrl as string}
          alt={`${project.title} project`}
          fill
          sizes="(min-width: 1024px) 40vw, (min-width: 768px) 60vw, 85vw"
          priority={isPriority}
          onError={() => setHasImageError(true)}
          className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-500">
          <Building2 className="h-12 w-12" aria-hidden />
        </div>
      )}

      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/30 to-transparent"
      />

      <p className="absolute right-4 top-4 z-10 flex max-w-[60%] items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
        <Building2 className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden />
        <span className="truncate">{project.categoryLabel}</span>
      </p>

      <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-5 text-white md:p-6">
        <div className="min-w-0">
          <h3 className="font-display truncate text-lg font-bold leading-snug md:text-2xl">{project.title}</h3>
          <p className="mt-0.5 truncate text-xs font-medium text-white/70">by {project.builderName ?? "Lokesha"}</p>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
            <span className="truncate">{location || "Location not available"}</span>
          </p>
          <p className="font-display max-w-[50%] shrink-0 truncate text-base font-bold md:text-lg">
            {formatLimelightPrice(project)}
          </p>
        </div>
      </div>
    </Link>
  );
}
