import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchPagePlaceholder } from "@/components/landing/property-search/SearchPagePlaceholder";
import { parsePropertyDetailsSlug } from "@/lib/property-search-url/propertyDetailsUrl";

type PropertyDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

async function readHeading(params: PropertyDetailsPageProps["params"]) {
  const { slug } = await params;
  const parsed = parsePropertyDetailsSlug(slug);
  if (!parsed) return null;
  return parsed.descriptor.replace(/-/g, " ") || "Property Details";
}

export async function generateMetadata({
  params,
}: PropertyDetailsPageProps): Promise<Metadata> {
  const heading = await readHeading(params);
  return heading ? { title: `${heading} | Lokesha` } : {};
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const heading = await readHeading(params);
  if (!heading) notFound();

  return (
    <SearchPagePlaceholder
      heading={heading}
      description="Full details of the selected property will be shown here."
    />
  );
}
