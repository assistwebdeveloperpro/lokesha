import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/shared/layout/Header";
import { PropertyDetailsPageContent } from "@/components/landing/property-details/PropertyDetailsPageContent";
import { getMockPropertyDetails } from "@/components/landing/property-details/mockPropertyDetails";
import {
  buildPropertyDetailsTitle,
  parsePropertyDetailsSlug,
} from "@/lib/property-search-url/propertyDetailsUrl";

type PropertyDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PropertyDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parsePropertyDetailsSlug(slug);
  if (!parsed) return {};

  const details = getMockPropertyDetails(parsed.id);
  const title =
    details?.pageTitle ??
    buildPropertyDetailsTitle(parsed.descriptor) ??
    parsed.descriptor.replace(/-/g, " ") ??
    "Property Details";

  return { title: `${title} | Lokesha` };
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { slug } = await params;
  const parsed = parsePropertyDetailsSlug(slug);
  if (!parsed) notFound();

  const details = getMockPropertyDetails(parsed.id);
  if (!details) notFound();

  return (
    <div className="flex min-h-screen w-full shrink-0 flex-col bg-white font-sans">
      <Header compact />
      <PropertyDetailsPageContent details={details} />
    </div>
  );
}
