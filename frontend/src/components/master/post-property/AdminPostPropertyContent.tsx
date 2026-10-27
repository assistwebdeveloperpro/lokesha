"use client";

import PostPropertyContent from "@/components/shared/post-property/PostPropertyContent";
import {
  ADMIN_POST_PROPERTY_MODE,
  PostPropertyModeProvider,
} from "@/components/shared/post-property/config/postPropertyMode";

export default function AdminPostPropertyContent() {
  return (
    <PostPropertyModeProvider mode={ADMIN_POST_PROPERTY_MODE}>
      <PostPropertyContent />
    </PostPropertyModeProvider>
  );
}
