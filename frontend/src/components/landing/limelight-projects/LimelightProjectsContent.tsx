"use client";

import { ChevronRight, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CustomDropdown, { type DropdownOption } from "@/components/shared/CustomDropdown";
import {
  ALL_INDIA_LABEL,
  DEFAULT_SELECTED_CITY,
} from "@/components/shared/layout/city-selector/citySelector.shared";
import { useHeaderCity } from "@/components/shared/layout/city-selector/useHeaderCity";
import ListPagination from "@/components/shared/ui/ListPagination";
import { PropertySearchHomeLoanCard } from "@/components/landing/property-search/property-list/PropertySearchHomeLoanCard";
import { PropertySearchListingCard } from "@/components/landing/property-search/property-list/PropertySearchListingCard";
import { PropertySearchPostPropertyCard } from "@/components/landing/property-search/property-list/PropertySearchPostPropertyCard";
import {
  PropertySearchListError,
  PropertySearchListSkeleton,
} from "@/components/landing/property-search/property-list/PropertySearchListStatus";
import { fetchLimelightProjects, type LimelightProjectsFilters } from "@/services/limelightProjects.service";
import { getSameStateCityOptions, resolveCityName } from "./limelightCities";
import { useLimelightProjectsPage, type FetchProjectsPage } from "./useLimelightProjectsPage";

// What differs between the pages that list the projects an admin selected
export type ProjectsPageConfig = {
  title: string;
  path: string;
  icon: LucideIcon;
  fetchPage: FetchProjectsPage;
};

const LIMELIGHT_PAGE: ProjectsPageConfig = {
  title: "Limelight Projects",
  path: "/property/limelight-projects",
  icon: Sparkles,
  fetchPage: fetchLimelightProjects,
};

const PAGE_SIZE = 30;
const CONTAINER = "mx-auto w-full max-w-360 px-2 sm:px-4 lg:px-6";
const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_20rem]";

function LimelightBreadcrumbs({ title, city }: { title: string; city: string }) {
  return (
    <nav aria-label="Breadcrumb" className="pb-2 pt-4 sm:pt-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-600 sm:text-sm">
        <li className="inline-flex items-center gap-1">
          <Link href="/" className="font-medium text-slate-500 hover:text-sky-700 hover:underline">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
        </li>
        <li aria-current="page" className="font-medium text-sky-600">
          {title} in {city}
        </li>
      </ol>
    </nav>
  );
}

function LimelightEmptyState({ title, icon: Icon, city }: { title: string; icon: LucideIcon; city: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500" aria-hidden>
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium text-slate-700 sm:text-base">
        No {title.toLowerCase()} available in {city} right now
      </p>
      <p className="text-sm text-slate-500">Try selecting another city from the dropdown above.</p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-10 items-center rounded-full bg-navy-blue px-6 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}

function LimelightResultsHeader({
  title,
  city,
  total,
  cityOptions,
  onCityChange,
}: {
  title: string;
  city: string;
  total: number | null;
  cityOptions: DropdownOption[];
  onCityChange: (city: string) => void;
}) {
  return (
    <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-3 py-4`}>
      <h1 className="font-display flex items-baseline text-sm font-medium text-slate-600 sm:text-base">
        {total === null ? (
          <span className="inline-block h-6 w-64 animate-pulse rounded bg-slate-200 align-middle" aria-hidden />
        ) : (
          <>
            <span className="text-xl font-semibold text-sky-500 sm:text-2xl">
              {total} {total === 1 ? "result" : "results"}
            </span>
            <span className="mx-2 font-normal text-slate-300" aria-hidden>
              |
            </span>
            {title} in {city}
          </>
        )}
      </h1>
      <div className="w-full sm:w-56">
        <CustomDropdown
          id="limelight-city"
          ariaLabel="Select city"
          variant="boxed"
          searchable
          searchPlaceholder="Search city"
          value={city}
          options={cityOptions}
          onChange={onCityChange}
        />
      </div>
    </div>
  );
}

function LimelightProjectsResults({
  page: pageConfig,
  city,
  filters,
  onCityChange,
}: {
  page: ProjectsPageConfig;
  city: string;
  filters: LimelightProjectsFilters;
  onCityChange: (city: string) => void;
}) {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, retry } = useLimelightProjectsPage(
    page,
    PAGE_SIZE,
    { ...filters, city },
    pageConfig.fetchPage,
  );
  const cityOptions = useMemo(() => getSameStateCityOptions(city), [city]);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex w-full flex-col pb-8">
      <div className={CONTAINER}>
        <LimelightBreadcrumbs title={pageConfig.title} city={city} />
      </div>

      <LimelightResultsHeader
        title={pageConfig.title}
        city={city}
        total={data ? total : null}
        cityOptions={cityOptions}
        onCityChange={onCityChange}
      />

      <div className="bg-linear-to-b from-slate-50/90 to-white pb-10 pt-4">
        <div className={`${CONTAINER} ${GRID} lg:items-start`}>
          <div className="min-w-0" aria-busy={isLoading}>
            {error ? (
              <PropertySearchListError message={error} onRetry={retry} />
            ) : !data ? (
              <PropertySearchListSkeleton />
            ) : items.length === 0 ? (
              <LimelightEmptyState title={pageConfig.title} icon={pageConfig.icon} city={city} />
            ) : (
              <div className={isLoading ? "opacity-60 transition-opacity" : undefined}>
                <section aria-label={pageConfig.title}>
                  <ul className="space-y-4 sm:space-y-5">
                    {items.map((project, index) => (
                      <li key={project.id}>
                        <PropertySearchListingCard listing={project} featured={index === 0 && page === 1} />
                      </li>
                    ))}
                  </ul>
                  <ListPagination page={data.page} pageSize={data.pageSize} total={total} onPageChange={handlePageChange} />
                </section>
              </div>
            )}
          </div>

          <aside
            aria-label="Promotions and tools"
            className="hidden min-w-0 lg:flex lg:w-72 lg:flex-col lg:gap-4 xl:w-80"
          >
            <PropertySearchPostPropertyCard />
            <PropertySearchHomeLoanCard />
          </aside>
        </div>
      </div>
    </div>
  );
}

export function LimelightProjectsContent({
  filters,
  page = LIMELIGHT_PAGE,
}: {
  filters: LimelightProjectsFilters;
  page?: ProjectsPageConfig;
}) {
  const router = useRouter();
  const headerCity = useHeaderCity();
  const fallbackCity = headerCity === ALL_INDIA_LABEL ? DEFAULT_SELECTED_CITY : headerCity;
  const city = resolveCityName(filters.city ?? fallbackCity);

  const handleCityChange = (nextCity: string) => {
    const params = new URLSearchParams();
    if (filters.listingType) params.set("listingType", filters.listingType);
    if (filters.category) params.set("category", filters.category);
    params.set("city", nextCity);
    router.replace(`${page.path}?${params}`, { scroll: false });
  };

  // Keyed by city so a new city never shows the previous city's projects or page number
  return (
    <LimelightProjectsResults
      key={city}
      page={page}
      city={city}
      filters={filters}
      onCityChange={handleCityChange}
    />
  );
}
