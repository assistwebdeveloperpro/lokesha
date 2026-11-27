"use client";

import LimelightProjectsContent from "@/components/master/limelight-projects/LimelightProjectsContent";
import { NEWLY_LAUNCHED_SELECTION } from "@/components/master/limelight-projects/projectSelectionConfig";

export default function NewlyLaunchedProjectsContent() {
  return <LimelightProjectsContent config={NEWLY_LAUNCHED_SELECTION} />;
}
