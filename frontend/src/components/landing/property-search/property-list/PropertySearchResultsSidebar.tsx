import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { PropertySearchHomeLoanCard } from "./PropertySearchHomeLoanCard";
import { PropertySearchPostPropertyCard } from "./PropertySearchPostPropertyCard";
import { PropertySearchShareRequirementCard } from "./PropertySearchShareRequirementCard";

const STICKY_TOP_GAP_PX = 8;

type PropertySearchResultsSidebarProps = {
  criteria: PropertySearchCriteria;
  stickyTopPx?: number;
};

export function PropertySearchResultsSidebar({
  criteria,
  stickyTopPx,
}: PropertySearchResultsSidebarProps) {
  const stickyTopWithGap =
    stickyTopPx !== undefined && stickyTopPx > 0
      ? stickyTopPx + STICKY_TOP_GAP_PX
      : undefined;

  const stickyStyle =
    stickyTopWithGap !== undefined
      ? {
          top: stickyTopWithGap,
          maxHeight: `calc(100dvh - ${stickyTopWithGap}px - 0.75rem)`,
        }
      : undefined;

  return (
    <aside
      aria-label="Promotions and tools"
      className="hidden min-h-0 min-w-0 lg:flex lg:h-full lg:w-72 lg:flex-col lg:gap-4 xl:w-80"
    >
      <PropertySearchPostPropertyCard />

      <PropertySearchHomeLoanCard />

      <div
        className="lg:sticky lg:mt-1 lg:z-20 lg:w-full lg:overflow-y-auto lg:overscroll-contain"
        style={stickyStyle}
      >
        <PropertySearchShareRequirementCard criteria={criteria} />
      </div>
    </aside>
  );
}
