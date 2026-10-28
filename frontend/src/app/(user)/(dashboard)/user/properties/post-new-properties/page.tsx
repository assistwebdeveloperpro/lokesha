import { Suspense } from "react";
import UserPostPropertyContent from "@/components/user/dashboard/post-property/UserPostPropertyContent";

export default function PostNewPropertiesPage() {
  return (
    <div className="post-property-page-bg w-full font-sans">
      <Suspense>
        <UserPostPropertyContent />
      </Suspense>
    </div>
  );
}
