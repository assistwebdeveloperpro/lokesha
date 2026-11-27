"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import { LimelightCard } from "./LimelightCard";
import { LimelightCardSkeleton } from "./LimelightCardSkeleton";
import { LimelightSlider } from "./LimelightSlider";
import { useLimelightProjects } from "./useLimelightProjects";

const SKELETON_COUNT = 2;
const SECTION_TITLE = "In Limelight";

function buildViewAllHref({ listingType, category, city }: LimelightProjectsFilters) {
  const params = new URLSearchParams();
  if (listingType) params.set("listingType", listingType);
  if (category) params.set("category", category);
  if (city) params.set("city", city);
  const query = params.toString();
  return query
    ? `/property/limelight-projects?${query}`
    : "/property/limelight-projects";
}

function LimelightHeader({ filters }: { filters: LimelightProjectsFilters }) {
  return (
    <header className="grid grid-cols-[1fr_auto] items-center px-2 gap-x-4 gap-y-1">
      <h2 className="font-display flex min-w-0 items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 md:text-2xl">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500"
          aria-hidden
        >
          <Sparkles className="h-5 w-5" />
        </span>
        {SECTION_TITLE}
      </h2>
      <p className="col-span-2 row-start-2 text-[12px] sm:text-[15px] text-slate-700">
        Experience the best of living - find your place with us.
      </p>
      <Link
        href={buildViewAllHref(filters)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm sm:text-[16px] font-semibold text-sky-600 transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        View All
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </header>
  );
}

export function LimelightSection() {
  const { isVisible, projects, isLoading, filters } = useLimelightProjects();

  if (!isVisible || (!isLoading && projects.length === 0)) return null;

  return (
    <section aria-label={SECTION_TITLE} className="w-full">
      <div className="mx-auto w-full max-w-360 px-4 pt-8 pb-6 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8">
        <LimelightHeader filters={filters} />

        <div className="mt-3" aria-busy={isLoading}>
          {isLoading ? (
            <LimelightSlider label={`${SECTION_TITLE} loading`}>
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <LimelightCardSkeleton key={index} />
              ))}
            </LimelightSlider>
          ) : (
            <LimelightSlider label={`${SECTION_TITLE} projects`}>
              {projects.map((project, index) => (
                <LimelightCard key={project.id} project={project} isPriority={index === 0} />
              ))}
            </LimelightSlider>
          )}
        </div>
      </div>
    </section>
  );
}
