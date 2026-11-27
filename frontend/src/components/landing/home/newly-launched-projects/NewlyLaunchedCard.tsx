"use client";

import { Building2, IndianRupee, MapPin, Rocket, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LimelightProject } from "@/services/limelightProjects.service";
import {
  buildLimelightDetailsHref,
  formatLimelightLocation,
  formatLimelightPrice,
} from "../limelight-projects/limelightFormat";

type NewlyLaunchedCardProps = {
  project: LimelightProject;
  isPriority?: boolean;
};

type NewlyLaunchedInfoRowProps = {
  icon: LucideIcon;
  value: string;
};

function NewlyLaunchedInfoRow({ icon: Icon, value }: NewlyLaunchedInfoRowProps) {
  return (
    <li className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
      <Icon className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
      <span className="truncate">{value}</span>
    </li>
  );
}

function NewlyLaunchedBadge() {
  return (
    <p className="absolute right-4 top-4 z-10 flex max-w-[60%] items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
      <Rocket className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden />
      <span className="truncate">Newly Launched</span>
    </p>
  );
}

export function NewlyLaunchedCard({ project, isPriority = false }: NewlyLaunchedCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const location = formatLimelightLocation(project);
  const showImage = project.imageUrl && !hasImageError;

  return (
    <Link
      href={buildLimelightDetailsHref(project)}
      aria-label={`View details of ${project.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white pb-4 transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-100">
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
        <NewlyLaunchedBadge />
      </div>

      {/* Pulls the content up over the bottom of the 16:9 image */}
      <div className="relative z-10 mx-4 mt-[-10%] rounded-2xl bg-white p-4 border border-gray-200 shadow-sm">
        <h3 className="font-display truncate text-lg font-bold leading-snug text-slate-900">{project.title}</h3>
        <p className="mt-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">
          {project.builderName ?? "Lokesha"}
        </p>

        <div className="my-3 h-px w-full bg-linear-to-r from-sky-200 via-slate-200 to-transparent" aria-hidden />

        <ul className="space-y-2.5">
          <NewlyLaunchedInfoRow icon={Building2} value={project.categoryLabel || "—"} />
          <NewlyLaunchedInfoRow icon={MapPin} value={location || "Location not available"} />
        </ul>

        <p className="font-display mt-3 flex items-center gap-1 truncate text-base font-bold text-navy-blue">
          <span className="truncate ps-1">{formatLimelightPrice(project)}</span>
        </p>
      </div>
    </Link>
  );
}
