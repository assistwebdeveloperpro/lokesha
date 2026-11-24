import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/shared/layout/Header";
import { PropertyDetailsPageContent } from "@/components/landing/property-details/PropertyDetailsPageContent";
import { buildPropertyMetadata } from "@/components/landing/property-details/buildPropertyMetadata";
import { loadPropertyDetailsByShortCode } from "@/components/landing/property-details/loadPropertyDetails";

type ShortPropertyPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({
  params,
}: ShortPropertyPageProps): Promise<Metadata> {
  const { code } = await params;
  const details = await loadPropertyDetailsByShortCode(code);
  if (!details) return { title: "Property not available | Lokesha", robots: { index: false } };

  return buildPropertyMetadata(details);
}

export default async function ShortPropertyPage({
  params,
}: ShortPropertyPageProps) {
  const { code } = await params;
  const details = await loadPropertyDetailsByShortCode(code);
  if (!details) notFound();

  return (
    <div className="flex min-h-screen w-full shrink-0 flex-col bg-white font-sans">
      <Header compact />
      <PropertyDetailsPageContent details={details} />
    </div>
  );
}
