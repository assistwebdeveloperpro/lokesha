import { Suspense } from "react";
import AdminPostPropertyContent from "@/components/master/post-property/AdminPostPropertyContent";

export default function MasterPostPropertyPage() {
  return (
    <div className="post-property-page-bg w-full font-sans">
      <Suspense>
        <AdminPostPropertyContent />
      </Suspense>
    </div>
  );
}
