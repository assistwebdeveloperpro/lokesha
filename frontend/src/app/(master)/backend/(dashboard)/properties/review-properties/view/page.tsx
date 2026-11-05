import { Suspense } from "react";
import AdminReviewPropertyViewContent from "@/components/master/review-properties/AdminReviewPropertyViewContent";

export default function ReviewPropertyViewPage() {
  return (
    <div className="post-property-page-bg w-full font-sans">
      <Suspense>
        <AdminReviewPropertyViewContent />
      </Suspense>
    </div>
  );
}
