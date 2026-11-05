"use client";

import PostPropertyContent from "@/components/shared/post-property/PostPropertyContent";
import {
  ADMIN_REVIEW_PROPERTY_VIEW_MODE,
  PostPropertyModeProvider,
} from "@/components/shared/post-property/config/postPropertyMode";

export default function AdminReviewPropertyViewContent() {
  return (
    <PostPropertyModeProvider mode={ADMIN_REVIEW_PROPERTY_VIEW_MODE}>
      <PostPropertyContent />
    </PostPropertyModeProvider>
  );
}
