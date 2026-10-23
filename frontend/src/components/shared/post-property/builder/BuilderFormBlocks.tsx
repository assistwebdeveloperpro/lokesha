import {
  PrimeLocationHighlightsField,
  ProjectHighlightsField,
  ProjectOverviewField,
} from "@/components/master/post-property/step-1-basic-information/ProjectDetailsField";
import FloorPlansField from "@/components/master/post-property/step-4-media-upload/FloorPlansField";
import {
  VideoWalkthroughField,
  VirtualTourField,
} from "@/components/master/post-property/step-5-pricing-and-additional-details/ProjectPricingFaqField";
import { getFloorPlanTitles } from "@/components/master/post-property/postPropertyProjectDetails";
import PostPropertyInput from "../components/PostPropertyInput";
import type { PostPropertyForm } from "../hooks/usePostPropertyForm";
import BrochureImagesField from "./BrochureImagesField";
import BuilderExtraDetailsField from "./BuilderExtraDetailsField";
import {
  ProjectExtraDetailsField,
  ProjectSpecificationsField,
} from "./BuilderProjectFields";

type BuilderFormBlocksProps = { form: PostPropertyForm };

// Project overview, extra details and specifications of the builder details step
export function BuilderProjectBlocks({ form }: BuilderFormBlocksProps) {
  const { draft, derived, handlers } = form;
  const { builderConfig } = derived;

  if (!derived.showBuilderFields) {
    return null;
  }

  return (
    <>
      <ProjectOverviewField
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
        propertyType={draft.propertyType}
        subType={draft.propertySubTypes}
        hideConfiguration
        showProjectType={builderConfig.showProjectType}
        projectTypeError={draft.builderErrors.projectType}
        totalUnitsLabel={builderConfig.totalUnitsLabel}
        hideTotalBlocks={builderConfig.hideTotalBlocks}
      />
      <BuilderExtraDetailsField
        extras={builderConfig.extras}
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
      />
      <ProjectExtraDetailsField
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
      />
      {builderConfig.showSpecifications ? (
        <ProjectSpecificationsField
          values={draft.projectDetails}
          onChange={handlers.changeProjectDetails}
        />
      ) : null}
    </>
  );
}

// Brochure images, floor plans and walkthroughs are project wide, so they never sit in a tab
export function BuilderMediaBlocks({ form }: BuilderFormBlocksProps) {
  const { draft, derived, handlers } = form;

  if (!derived.showBuilderFields) {
    return null;
  }

  const floorPlanTitles = getFloorPlanTitles(draft.projectDetails);

  return (
    <>
      <BrochureImagesField
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
      />
      {derived.builderConfig.showFloorPlans ? (
        <FloorPlansField
          projectName={draft.addressLocation.projectName}
          propertyType={draft.propertyType}
          subType={draft.propertySubTypes}
          values={draft.projectDetails}
          onChange={handlers.changeProjectDetails}
          autoTitles={floorPlanTitles.length > 0 ? floorPlanTitles : undefined}
        />
      ) : null}
      <VideoWalkthroughField
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
      />
      <VirtualTourField
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
      />
    </>
  );
}

export function BuilderHighlightBlocks({ form }: BuilderFormBlocksProps) {
  const { draft, derived, handlers } = form;

  if (!derived.showBuilderFields) {
    return null;
  }

  return (
    <>
      <ProjectHighlightsField
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
      />
      <PrimeLocationHighlightsField
        projectName={draft.addressLocation.projectName}
        values={draft.projectDetails}
        onChange={handlers.changeProjectDetails}
      />
    </>
  );
}

export function BuilderAmenityExtras({ form }: BuilderFormBlocksProps) {
  const { draft, handlers } = form;

  return (
    <>
      <PostPropertyInput
        id="approvedBy"
        label="Approved By"
        placeholder="e.g. DTCP, development authority"
        variant="underline"
        staticLabel
        value={draft.projectDetails.approvedBy}
        onChange={(value) => handlers.changeProjectDetails("approvedBy", value)}
      />
      <PostPropertyInput
        id="reraLink"
        label="RERA Website / Link"
        placeholder="https://"
        type="url"
        variant="underline"
        staticLabel
        value={draft.projectDetails.reraLink}
        onChange={(value) => handlers.changeProjectDetails("reraLink", value)}
      />
    </>
  );
}
