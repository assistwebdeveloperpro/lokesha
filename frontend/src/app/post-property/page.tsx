import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import PostPropertyContent from "@/components/post-property/PostPropertyContent";

export const metadata: Metadata = {
  title: "Post Property for Free | Lokesha",
  description:
    "List your residential or commercial property for free on Lokesha. Reach buyers and tenants across India.",
};

export default function PostPropertyPage() {
  return (
    <div className="post-property-page-bg w-full font-sans">
      <Header />
      <main className="w-full">
        <Suspense>
          <PostPropertyContent />
        </Suspense>
      </main>
    </div>
  );
}
