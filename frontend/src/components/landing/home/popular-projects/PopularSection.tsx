"use client";

import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { fetchAllPopularProjects } from "@/services/popularProjects.service";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import { ProjectSlider } from "@/components/shared/ui/ProjectSlider";
import { useSelectedProjects } from "../limelight-projects/useLimelightProjects";
import { PopularCard } from "./PopularCard";
import { PopularCardSkeleton } from "./PopularCardSkeleton";

const SKELETON_COUNT = 4;
const SECTION_TITLE = "Popular Projects";
const VIEW_ALL_PATH = "/property/popular-projects";

// One card on mobile, two and a fifth of the third on tablet, three and a fifth of the fourth on desktop
const SLIDE_CLASS_NAME =
  "w-[85%] sm:w-[calc((100%-1rem)/1.6)] md:w-[calc((100%-1rem)/2.2)] lg:w-[calc((100%-3rem)/3.2)]";

function buildViewAllHref({ listingType, category, city }: LimelightProjectsFilters) {
  const params = new URLSearchParams();
  if (listingType) params.set("listingType", listingType);
  if (category) params.set("category", category);
  if (city) params.set("city", city);
  const query = params.toString();
  return query ? `${VIEW_ALL_PATH}?${query}` : VIEW_ALL_PATH;
}

export function PopularSection() {
  const { isVisible, projects, isLoading, filters } = useSelectedProjects(fetchAllPopularProjects);

  if (!isVisible || (!isLoading && projects.length === 0)) return null;

  return (
    <section aria-label={SECTION_TITLE} className="w-full">
      <div className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6 sm:py-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 px-2">
          <h2 className="font-display flex min-w-0 items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 md:text-2xl">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500"
              aria-hidden
            >
              <Flame className="h-5 w-5" />
            </span>
            {SECTION_TITLE}
          </h2>
          <Link
            href={buildViewAllHref(filters)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm sm:text-[16px] font-semibold text-sky-600 transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            View All
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </header>

        <div className="mt-3" aria-busy={isLoading}>
          {isLoading ? (
            <ProjectSlider label={`${SECTION_TITLE} loading`} slideClassName={SLIDE_CLASS_NAME}>
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <PopularCardSkeleton key={index} />
              ))}
            </ProjectSlider>
          ) : (
            <ProjectSlider label={`${SECTION_TITLE} projects`} slideClassName={SLIDE_CLASS_NAME}>
              {projects.map((project, index) => (
                <PopularCard key={project.id} project={project} isPriority={index === 0} />
              ))}
            </ProjectSlider>
          )}
        </div>
      </div>
    </section>
  );
}
