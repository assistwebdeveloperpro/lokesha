"use client";

import PostPropertyContent from "@/components/shared/post-property/PostPropertyContent";
import {
  PostPropertyModeProvider,
  USER_DASHBOARD_POST_PROPERTY_MODE,
} from "@/components/shared/post-property/config/postPropertyMode";

export default function UserPostPropertyContent() {
  return (
    <PostPropertyModeProvider mode={USER_DASHBOARD_POST_PROPERTY_MODE}>
      <PostPropertyContent />
    </PostPropertyModeProvider>
  );
}
