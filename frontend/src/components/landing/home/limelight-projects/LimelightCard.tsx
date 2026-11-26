"use client";

import { ArrowUpRight, Building2, LayoutGrid, MapPin, Ruler, Trees, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LimelightProject } from "@/services/limelightProjects.service";
import {
  buildLimelightDetails,
  buildLimelightDetailsHref,
  formatLimelightLocation,
  formatLimelightPrice,
} from "./limelightFormat";

type LimelightCardProps = {
  project: LimelightProject;
  isPriority?: boolean;
};

const DETAIL_ICONS: Record<string, LucideIcon> = {
  Configuration: LayoutGrid,
  "Project Size": Building2,
  Size: Ruler,
  "Project Area": Trees,
};

export function LimelightCard({ project, isPriority = false }: LimelightCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const location = formatLimelightLocation(project);
  const showImage = project.imageUrl && !hasImageError;

  return (
    <Link
      href={buildLimelightDetailsHref(project)}
      aria-label={`View details of ${project.title}`}
      className="group block h-full rounded-3xl border border-slate-200 bg-white p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <article className="flex h-full flex-col gap-3 md:flex-row md:gap-4">
        <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:aspect-auto md:min-h-96 md:w-[40%]">
          {showImage ? (
            <Image
              src={project.imageUrl as string}
              alt={`${project.title} project`}
              fill
              sizes="(min-width: 1024px) 32vw, (min-width: 768px) 40vw, 90vw"
              priority={isPriority}
              onError={() => setHasImageError(true)}
              className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full min-h-44 w-full items-center justify-center text-slate-400">
              <Building2 className="h-10 w-10" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 px-1 pb-1 md:py-3 md:pr-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h3 className="font-display line-clamp-2 text-xl font-bold leading-snug text-slate-900">
                {project.title}
              </h3>
              {location ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
                  <span className="truncate">{location}</span>
                </p>
              ) : null}
            </div>
            <p className="font-display shrink-0 text-lg font-bold text-navy-blue sm:text-right">
              {formatLimelightPrice(project)}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {buildLimelightDetails(project).map(({ label, value }) => {
              const Icon = DETAIL_ICONS[label] ?? Building2;
              return (
                <div key={label} className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-navy-blue shadow-sm"
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm font-medium text-slate-700">{label}</dt>
                    <dd className="mt-1.5 truncate text-sm font-semibold text-slate-900">{value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-blue text-white"
                aria-hidden
              >
                <Building2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex flex-col gap-1">
                <p className="truncate text-sm font-semibold text-slate-900">{project.builderName ?? "Lokesha"}</p>
                <p className="text-xs text-slate-500 font-medium">Developer</p>
              </div>
            </div>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-navy-blue transition group-hover:border-navy-blue group-hover:bg-navy-blue group-hover:text-white motion-reduce:transition-none"
              aria-hidden
            >
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
