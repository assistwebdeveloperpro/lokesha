import Header from "@/components/shared/layout/Header";
import { FeaturedPropertiesSection } from "./featured-properties/FeaturedPropertiesSection";
import HeroBanner from "./hero-banner/HeroBanner";
import type { HeroBannerInitialSelection } from "./hero-banner/useHeroBannerFilters";
import { HowItWorksSection } from "./how-it-works/HowItWorksSection";

export function HomePageContent(initialSelection: HeroBannerInitialSelection) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans">
      <Header />
      <main className="flex flex-1 flex-col">
        <HeroBanner {...initialSelection} />
        <FeaturedPropertiesSection />
        <HowItWorksSection />
      </main>
    </div>
  );
}
