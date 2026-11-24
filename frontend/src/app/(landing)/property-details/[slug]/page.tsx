import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/shared/layout/Header";
import { PropertyDetailsPageContent } from "@/components/landing/property-details/PropertyDetailsPageContent";
import { buildPropertyMetadata } from "@/components/landing/property-details/buildPropertyMetadata";
import { loadPropertyDetailsById } from "@/components/landing/property-details/loadPropertyDetails";
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

  const details = await loadPropertyDetailsById(parsed.id);
  if (details) return buildPropertyMetadata(details);

  const title =
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

  const details = await loadPropertyDetailsById(parsed.id);
  if (!details) notFound();

  return (
    <div className="flex min-h-screen w-full shrink-0 flex-col bg-white font-sans">
      <Header compact />
      <PropertyDetailsPageContent details={details} />
    </div>
  );
}
