import type { Metadata } from "next";
import { HomePageContent } from "@/components/landing/home/HomePageContent";
import { SITE_DESCRIPTION, buildPageMetadata } from "@/lib/seo/pageMetadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Lokesha",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return <HomePageContent />;
}
