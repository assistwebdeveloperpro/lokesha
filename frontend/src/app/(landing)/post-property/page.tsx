import { Suspense } from "react";
import type { Metadata } from "next";
import RequireAuth from "@/components/user/auth/RequireAuth";
import Header from "@/components/shared/layout/Header";
import PostPropertyContent from "@/components/shared/post-property/PostPropertyContent";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Post Property | Lokesha - Property Listings",
  ogTitle: "Post Property",
  description:
    "Post your residential or commercial property on Lokesha and connect with potential buyers and tenants across India.",
  path: "/post-property",
});

export default function PostPropertyPage() {
  return (
    <div className="post-property-page-bg w-full font-sans">
      <Header />
      <main className="w-full">
        <RequireAuth>
          <Suspense>
            <PostPropertyContent />
          </Suspense>
        </RequireAuth>
      </main>
    </div>
  );
}
