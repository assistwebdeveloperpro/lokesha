"use client";

import LimelightProjectsContent from "@/components/master/limelight-projects/LimelightProjectsContent";
import { POPULAR_SELECTION } from "@/components/master/limelight-projects/projectSelectionConfig";

export default function PopularProjectsContent() {
  return <LimelightProjectsContent config={POPULAR_SELECTION} />;
}
