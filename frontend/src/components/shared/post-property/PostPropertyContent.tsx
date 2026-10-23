"use client";

import EditPropertyStatus from "./components/EditPropertyStatus";
import FormStepper from "./components/FormStepper";
import { getProgressForStep } from "./config/postPropertyForm.shared";
import ProgressBar from "./components/ProgressBar";
import BasicDetailsStep from "./step-1-basic-information/BasicDetailsStep";
import PropertyDetailsStep from "./step-2-property-details/PropertyDetailsStep";
import AmenitiesStep from "./step-3-amenities/AmenitiesStep";
import PhotosVideosStep from "./step-4-media-upload/PhotosVideosStep";
import PricingOthersStep from "./step-5-pricing-and-additional-details/PricingOthersStep";
import { usePostPropertyForm } from "./hooks/usePostPropertyForm";

export default function PostPropertyContent() {
  const form = usePostPropertyForm();
  const { currentStep, isEditMode, editStatus } = form;

  if (editStatus.isBlocking) {
    return <EditPropertyStatus error={editStatus.error} />;
  }

  return (
    <div className="mx-auto w-full max-w-360 px-3 py-8 sm:px-4 sm:py-10 lg:px-4">
      <header>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-30">
          <div className="shrink-0">
            <h1 className="font-display text-2xl font-bold text-navy-blue sm:text-2xl">
              {isEditMode ? "Edit Property Details" : "Add Property Details"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {isEditMode ? "Update your listing" : "Sell or rent your property"}
            </p>
          </div>
          <ProgressBar percent={getProgressForStep(currentStep)} />
        </div>
      </header>

      <section className="mt-8 sm:mt-10">
        <FormStepper currentStep={currentStep} />
      </section>

      {currentStep === 1 ? <BasicDetailsStep form={form} /> : null}
      {currentStep === 2 ? <PropertyDetailsStep form={form} /> : null}
      {currentStep === 3 ? <AmenitiesStep form={form} /> : null}
      {currentStep === 4 ? <PhotosVideosStep form={form} /> : null}
      {currentStep === 5 ? <PricingOthersStep form={form} /> : null}
    </div>
  );
}
