import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Header from "@/components/shared/layout/Header";
import { PropertyDetailsPageContent } from "@/components/landing/property-details/PropertyDetailsPageContent";
import { buildPropertyDetailsView } from "@/components/landing/property-details/buildPropertyDetailsView";
import {
  buildPropertyDetailsTitle,
  parsePropertyDetailsSlug,
} from "@/lib/property-search-url/propertyDetailsUrl";
import { ApiError } from "@/services/apiClient";
import { getPublicPropertyDetails } from "@/services/propertySearch.service";

type PropertyDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

// Shared by the metadata and the page so one request serves both; a missing property is null
const loadPropertyDetails = cache(async (id: string) => {
  try {
    return buildPropertyDetailsView(await getPublicPropertyDetails(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({
  params,
}: PropertyDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parsePropertyDetailsSlug(slug);
  if (!parsed) return {};

  const details = await loadPropertyDetails(parsed.id);
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

  const details = await loadPropertyDetails(parsed.id);
  if (!details) notFound();

  return (
    <div className="flex min-h-screen w-full shrink-0 flex-col bg-white font-sans">
      <Header compact />
      <PropertyDetailsPageContent details={details} />
    </div>
  );
}
