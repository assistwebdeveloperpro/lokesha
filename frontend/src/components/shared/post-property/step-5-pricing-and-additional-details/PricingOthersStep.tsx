import {
  ProjectFaqField,
  ProjectPricingField,
} from "@/components/master/post-property/step-5-pricing-and-additional-details/ProjectPricingFaqField";
import BhkChargesField from "../builder/BhkChargesField";
import PostPropertyStepCard from "../components/PostPropertyStepCard";
import SubTypeDetailsTabs from "../step-2-property-details/SubTypeDetailsTabs";
import type { PostPropertyForm } from "../hooks/usePostPropertyForm";
import PricingOthersField from "./PricingOthersField";

function getSubmitLabel(isSubmitting: boolean, isEditMode: boolean) {
  if (isSubmitting) {
    return isEditMode ? "Saving..." : "Submitting...";
  }
  return isEditMode ? "Save Changes" : "Submit";
}

export default function PricingOthersStep({ form }: { form: PostPropertyForm }) {
  const { draft, derived, layout, subForms, handlers, isEditMode } = form;
  const { showBuilderFields, isMultiSubType, isRent, builderConfig } = derived;
  const { propertyType } = draft;

  const renderPricingFields = () => {
    if (showBuilderFields && isMultiSubType && layout.sharedPricing) {
      return layout.priceInclusionFlags[0] ? (
        <PricingOthersField
          key="shared-pricing"
          isRent={isRent}
          propertyType={propertyType}
          subType={subForms.firstTabId}
          values={subForms.getPricing(subForms.firstTabId)}
          onChange={subForms.changePricingAll}
          errors={subForms.pricingErrors[subForms.firstTabId] ?? {}}
          builderLayout
        />
      ) : null;
    }

    if (showBuilderFields && isMultiSubType) {
      const { pricingTabs, activePricingTabId } = derived;

      return pricingTabs.length > 0 ? (
        <SubTypeDetailsTabs
          tabs={pricingTabs}
          activeId={activePricingTabId}
          onActiveChange={subForms.setActiveId}
          errorIds={subForms.errorIds.pricing}
        >
          <PricingOthersField
            key={activePricingTabId}
            isRent={isRent}
            propertyType={propertyType}
            subType={activePricingTabId}
            values={subForms.getPricing(activePricingTabId)}
            onChange={(field, value) =>
              subForms.changePricing(activePricingTabId, field, value)
            }
            errors={subForms.pricingErrors[activePricingTabId] ?? {}}
            builderLayout
          />
        </SubTypeDetailsTabs>
      ) : null;
    }

    return (
      <PricingOthersField
        isRent={isRent}
        propertyType={propertyType}
        subType={derived.propertySubType}
        values={draft.pricingOthers}
        onChange={handlers.changePricing}
        errors={draft.pricingOthersErrors}
        builderLayout={showBuilderFields}
      />
    );
  };

  return (
    <PostPropertyStepCard
      title="Add Pricing & Other Details"
      description="Step 5 of 5 - Set your price and finalize the listing"
      actionLabel={getSubmitLabel(draft.isSubmitting, isEditMode)}
      onAction={handlers.submit}
      onBack={handlers.goBack}
      isActionDisabled={draft.isSubmitting}
    >
      {renderPricingFields()}

      {showBuilderFields ? (
        <>
          <BhkChargesField
            values={draft.projectDetails}
            onChange={handlers.changeProjectDetails}
            pricingOthers={
              isMultiSubType
                ? subForms.getPricing(subForms.firstTabId)
                : draft.pricingOthers
            }
            onPricingOthersChange={
              isMultiSubType ? handlers.changeAllPricing : handlers.changePricing
            }
            singleBlock={!builderConfig.chargesByBhk}
            showAssuredReturn={builderConfig.showAssuredReturn}
            assuredReturnError={draft.builderErrors.assuredReturn}
          />
          <ProjectPricingField
            values={draft.projectDetails}
            onChange={handlers.changeProjectDetails}
            priceRangeReadOnly
          />
          <ProjectFaqField
            values={draft.projectDetails}
            onChange={handlers.changeProjectDetails}
          />
        </>
      ) : null}
    </PostPropertyStepCard>
  );
}
