import Header from "@/components/shared/layout/Header";
import LocationAutoDetect from "@/components/shared/layout/city-selector/LocationAutoDetect";
import HeroBanner from "./hero-banner/HeroBanner";
import type { HeroBannerInitialSelection } from "./hero-banner/useHeroBannerFilters";
import { LimelightSection } from "./limelight-projects/LimelightSection";

export function HomePageContent(initialSelection: HeroBannerInitialSelection) {
  return (
    <div className="flex min-h-full flex-1 flex-col font-sans">
      <Header showCitySelector />
      <main className="flex flex-1 flex-col">
        <HeroBanner {...initialSelection} />
        <LimelightSection />
      </main>
      <LocationAutoDetect />
    </div>
  );
}
