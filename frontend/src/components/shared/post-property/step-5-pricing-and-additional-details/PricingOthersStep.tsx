import {
  ProjectFaqField,
  ProjectPricingField,
} from "@/components/master/post-property/step-5-pricing-and-additional-details/ProjectPricingFaqField";
import { getBhkAreaTabs } from "../builder/bhkAreaDetails";
import { getBuilderConfig } from "../builder/builderConfig";
import { validateBuilderPricing } from "../builder/builderValidation";
import BhkChargesField from "../builder/BhkChargesField";
import PostPropertyStepCard from "../components/PostPropertyStepCard";
import SubTypeDetailsTabs from "../step-2-property-details/SubTypeDetailsTabs";
import type { PostPropertyForm } from "../hooks/usePostPropertyForm";
import PricingOthersField from "./PricingOthersField";

function getSubmitLabel(isSubmitting: boolean, submitsOnSave: boolean, isAdmin: boolean) {
  if (!submitsOnSave) {
    return isSubmitting ? "Saving..." : "Save Changes";
  }
  if (isAdmin) {
    return isSubmitting ? "Publishing..." : "Publish";
  }
  return isSubmitting ? "Submitting..." : "Submit for Review";
}

export default function PricingOthersStep({ form }: { form: PostPropertyForm }) {
  const { draft, derived, layout, subForms, handlers, canSaveAsDraft, submitsOnSave, canClose, isAdmin } = form;
  const { showBuilderFields, isMultiSubType, isRent, builderConfig } = derived;
  const { propertyType } = draft;

  // Admins can close a published listing, which is not possible for a draft
  const secondaryAction = canSaveAsDraft
    ? { label: "Save as Draft", onClick: handlers.saveAsDraft }
    : canClose
      ? { label: "Mark as Closed", onClick: handlers.close }
      : undefined;

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
          title="Pricing for each sub type"
          description="Open each tab and set the price for that sub type."
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

  const renderMultiSubTypeCharges = () => {
    const tabId = subForms.activeTabId;
    const tabConfig = getBuilderConfig(propertyType, tabId);
    const assuredReturnError = (id: string) =>
      draft.builderErrors.assuredReturn
        ? validateBuilderPricing(subForms.getPricing(id), getBuilderConfig(propertyType, id))
            .assuredReturn
        : undefined;
    const errorIds = subForms.tabs
      .filter((tab) => assuredReturnError(tab.id))
      .map((tab) => tab.id);

    return (
      <SubTypeDetailsTabs
        tabs={subForms.tabs}
        activeId={tabId}
        onActiveChange={subForms.setActiveId}
        errorIds={errorIds}
        title="Other Charges & Remarks"
        description="Open each tab and add the charges for that sub type."
      >
        <BhkChargesField
          key={tabId}
          embedded
          values={draft.projectDetails}
          onChange={handlers.changeProjectDetails}
          bhkList={getBhkAreaTabs(draft.projectDetails, propertyType, tabId).map(
            (tab) => tab.bhk,
          )}
          unitType={subForms.tabs.find((tab) => tab.id === tabId)?.label}
          pricingOthers={subForms.getPricing(tabId)}
          onPricingOthersChange={(field, value) =>
            subForms.changePricing(tabId, field, value)
          }
          singleBlock={!tabConfig.chargesByBhk}
          showAssuredReturn={tabConfig.showAssuredReturn}
          assuredReturnError={assuredReturnError(tabId)}
        />
      </SubTypeDetailsTabs>
    );
  };

  return (
    <PostPropertyStepCard
      title="Add Pricing & Other Details"
      description="Step 5 of 5 - Set your price and finalize the listing"
      actionLabel={getSubmitLabel(draft.isSubmitting, submitsOnSave, isAdmin)}
      onAction={handlers.submit}
      secondaryActionLabel={secondaryAction?.label}
      onSecondaryAction={secondaryAction?.onClick}
      onBack={handlers.goBack}
      isActionDisabled={draft.isSubmitting}
    >
      {renderPricingFields()}

      {showBuilderFields ? (
        <>
          {isMultiSubType ? (
            renderMultiSubTypeCharges()
          ) : (
            <BhkChargesField
              values={draft.projectDetails}
              onChange={handlers.changeProjectDetails}
              pricingOthers={draft.pricingOthers}
              onPricingOthersChange={handlers.changePricing}
              singleBlock={!builderConfig.chargesByBhk}
              showAssuredReturn={builderConfig.showAssuredReturn}
              assuredReturnError={draft.builderErrors.assuredReturn}
            />
          )}
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
