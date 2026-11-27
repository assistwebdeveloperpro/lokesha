"use client";

import LimelightProjectsContent from "@/components/master/limelight-projects/LimelightProjectsContent";
import { ICONIC_SELECTION } from "@/components/master/limelight-projects/projectSelectionConfig";

export default function IconicProjectsContent() {
  return <LimelightProjectsContent config={ICONIC_SELECTION} />;
}
