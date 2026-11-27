import Header from "@/components/shared/layout/Header";
import LocationAutoDetect from "@/components/shared/layout/city-selector/LocationAutoDetect";
import HeroBanner from "./hero-banner/HeroBanner";
import type { HeroBannerInitialSelection } from "./hero-banner/useHeroBannerFilters";
import { FeaturedSection } from "./featured-projects/FeaturedSection";
import { IconicSection } from "./iconic-projects/IconicSection";
import { LimelightSection } from "./limelight-projects/LimelightSection";
import { PopularSection } from "./popular-projects/PopularSection";

export function HomePageContent(initialSelection: HeroBannerInitialSelection) {
  return (
    <div className="flex min-h-full flex-1 flex-col font-sans">
      <Header showCitySelector />
      <main className="flex flex-1 flex-col">
        <HeroBanner {...initialSelection} />
        <LimelightSection />
        <FeaturedSection />
        <IconicSection />
        <PopularSection />
      </main>
      <LocationAutoDetect />
    </div>
  );
}
