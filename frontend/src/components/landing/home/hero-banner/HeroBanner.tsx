"use client";

import { HeroCategoryTabs } from "./HeroCategoryTabs";
import { HeroSearchFilterRow } from "./HeroSearchFilterRow";
import { HeroTrustList } from "./HeroTrustList";
import { HERO_DESCRIPTION } from "./heroBanner.shared";
import { useHeroBannerFilters } from "./useHeroBannerFilters";

export default function HeroBanner() {
  const filters = useHeroBannerFilters();
  const { panelRef, activeCategory, heroTitle, handleCategorySelect } = filters;

  return (
    <section
      className="relative flex min-h-155 w-full flex-col justify-center bg-cover bg-center bg-no-repeat px-4 py-12 sm:min-h-165 sm:px-6 sm:py-14 lg:min-h-170 lg:py-16"
      style={{
        backgroundImage: "url(/assets/images/homepage/hero-banner.png)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-slate-900/40"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-5 text-center sm:mb-6">
          <h1 className="font-display text-2xl font-bold leading-snug text-white drop-shadow-md sm:text-3xl md:text-[2rem]">
            {heroTitle}
          </h1>
          {activeCategory !== "new-projects" && (
            <p className="mx-auto mt-2 max-w-2xl text-xs md:text-sm font-semibold text-white sm:text-sm">
              {HERO_DESCRIPTION}
            </p>
          )}
        </div>

        <div ref={panelRef} className="relative overflow-visible">
          <div
            className="pointer-events-none absolute inset-0 top-3 rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/90"
            aria-hidden
          />
          <div className="relative">
            <HeroCategoryTabs
              activeCategory={activeCategory}
              onSelect={handleCategorySelect}
            />

            <div className="overflow-visible p-4 sm:p-5">
              <HeroSearchFilterRow {...filters} />
              <HeroTrustList />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
