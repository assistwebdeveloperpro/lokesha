"use client";

import { useSearchParams } from "next/navigation";
import { BackToReviewListLink } from "@/components/master/review-properties/BackToReviewListNav";
import EditPropertyStatus from "./components/EditPropertyStatus";
import FormStepper from "./components/FormStepper";
import { getProgressForStep } from "./config/postPropertyForm.shared";
import ProgressBar from "./components/ProgressBar";
import BasicDetailsStep from "./step-1-basic-information/BasicDetailsStep";
import PostingAsSection from "./components/PostingAsSection";
import PropertyDetailsStep from "./step-2-property-details/PropertyDetailsStep";
import AmenitiesStep from "./step-3-amenities/AmenitiesStep";
import PhotosVideosStep from "./step-4-media-upload/PhotosVideosStep";
import PricingOthersStep from "./step-5-pricing-and-additional-details/PricingOthersStep";
import SavedDraftsBanner from "./components/SavedDraftsBanner";
import { PostPropertyReadOnlyProvider } from "./config/postPropertyReadOnly";
import { usePostPropertyForm } from "./hooks/usePostPropertyForm";
import { useSavedDrafts } from "./hooks/useSavedDrafts";

export default function PostPropertyContent() {
  const searchParams = useSearchParams();
  const form = usePostPropertyForm();
  const { currentStep, isEditMode, isViewMode, editStatus, staff, serverDraft, returnPath } = form;
  const canResumeDraft = currentStep === 1 && !isEditMode && !isViewMode && !serverDraft.draftId;
  const savedDrafts = useSavedDrafts(canResumeDraft);
  const showPostingAs = staff.isStaff && !isEditMode && !isViewMode;
  const isFormVisible = !showPostingAs || staff.postingAs !== "";
  const hasViewId = Boolean(searchParams.get("view"));

  if (isViewMode && !hasViewId) {
    return (
      <EditPropertyStatus error="This property could not be found." />
    );
  }

  if (editStatus.isBlocking) {
    return <EditPropertyStatus error={editStatus.error} />;
  }

  return (
    <PostPropertyReadOnlyProvider readOnly={isViewMode}>
      <div
        data-post-property-form
        className="mx-auto w-full max-w-360 px-3 py-8 sm:px-4 sm:py-10 lg:px-4"
      >
        {isViewMode ? (
          <div className="mb-6">
            <BackToReviewListLink href={returnPath} />
          </div>
        ) : null}

        <header>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-30">
            <div className="shrink-0">
              <h1 className="font-display text-2xl font-bold text-navy-blue sm:text-2xl">
                {isViewMode ? "Review Property" : isEditMode ? "Edit Property Details" : "Add Property Details"}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {isViewMode
                  ? "Read-only view of the listing submitted for review"
                  : isEditMode
                    ? "Update your listing"
                    : "Sell or rent your property"}
              </p>
            </div>
            <ProgressBar percent={getProgressForStep(currentStep)} />
          </div>
        </header>

        {!isViewMode ? (
          <SavedDraftsBanner
            drafts={savedDrafts.drafts}
            deletingId={savedDrafts.deletingId}
            onDelete={savedDrafts.remove}
          />
        ) : null}

        <section className="mt-8 sm:mt-10">
          <FormStepper currentStep={currentStep} />
        </section>

        {showPostingAs ? (
          <PostingAsSection value={staff.postingAs} onChange={staff.changePostingAs} />
        ) : null}

        {isFormVisible && currentStep === 1 ? <BasicDetailsStep form={form} /> : null}
        {isFormVisible && currentStep === 2 ? <PropertyDetailsStep form={form} /> : null}
        {isFormVisible && currentStep === 3 ? <AmenitiesStep form={form} /> : null}
        {isFormVisible && currentStep === 4 ? <PhotosVideosStep form={form} /> : null}
        {isFormVisible && currentStep === 5 ? <PricingOthersStep form={form} /> : null}
      </div>
    </PostPropertyReadOnlyProvider>
  );
}
