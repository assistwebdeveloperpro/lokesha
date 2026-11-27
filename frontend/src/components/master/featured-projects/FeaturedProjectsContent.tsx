"use client";

import LimelightProjectsContent from "@/components/master/limelight-projects/LimelightProjectsContent";
import { FEATURED_SELECTION } from "@/components/master/limelight-projects/projectSelectionConfig";

export default function FeaturedProjectsContent() {
  return <LimelightProjectsContent config={FEATURED_SELECTION} />;
}
