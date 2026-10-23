import AvailableSizesField from "@/components/master/post-property/step-2-property-details/AvailableSizesField";
import BuilderPropertyDetailsField from "@/components/master/post-property/step-2-property-details/PropertyDetailsField";
import { BuilderProjectBlocks } from "../builder/BuilderFormBlocks";
import PostPropertyStepCard from "../components/PostPropertyStepCard";
import type { PostPropertyForm } from "../hooks/usePostPropertyForm";
import PropertyDetailsField from "./PropertyDetailsField";
import { SaleCommonSections } from "./PropertyDetailsVariants";
import SubTypeDetailsTabs from "./SubTypeDetailsTabs";

export default function PropertyDetailsStep({ form }: { form: PostPropertyForm }) {
  const { draft, derived, layout, subForms, handlers } = form;
  const { showBuilderFields, isMultiSubType, activeTabId, propertySubType } = derived;

  const renderDetailsFields = () => {
    if (showBuilderFields && isMultiSubType) {
      return (
        <>
          <BuilderProjectBlocks form={form} />
          <AvailableSizesField
            values={draft.projectDetails}
            onChange={handlers.changeProjectDetails}
            propertyType={draft.propertyType}
            subType={draft.propertySubTypes}
            hideBhk={!derived.builderConfig.showBhk}
            sizeUnits={derived.builderConfig.sizeUnits}
            showUnitsAvailable
          />
          {layout.commonDetailsCfg ? (
            <SaleCommonSections
              cfg={layout.commonDetailsCfg}
              sections={layout.commonSections}
              values={subForms.getDetails(subForms.firstTabId)}
              onChange={subForms.changeDetailsAll}
              errors={subForms.getCommonDetailsErrors()}
            />
          ) : null}
          <SubTypeDetailsTabs
            tabs={subForms.tabs}
            activeId={activeTabId}
            onActiveChange={subForms.setActiveId}
            errorIds={subForms.errorIds.details}
            title="Subtype Details"
            description="You’ve selected multiple subtypes. Switch between the tabs below to enter the details for each subtype separately."
          >
            <BuilderPropertyDetailsField
              key={activeTabId}
              listingType={draft.listingType}
              propertyType={draft.propertyType}
              subType={[activeTabId]}
              values={subForms.getDetails(activeTabId)}
              onChange={(field, value) =>
                subForms.changeDetails(activeTabId, field, value)
              }
              errors={subForms.detailsErrors[activeTabId] ?? {}}
              projectDetails={subForms.getProject(activeTabId)}
              onProjectDetailsChange={(field, value) =>
                subForms.changeProject(
                  activeTabId,
                  field,
                  value,
                  handlers.changeProjectDetails,
                )
              }
              builderLayout
              hideAvailableSizes
              hideCommon={layout.commonSections}
            />
          </SubTypeDetailsTabs>
        </>
      );
    }

    if (showBuilderFields) {
      return (
        <BuilderPropertyDetailsField
          listingType={draft.listingType}
          propertyType={draft.propertyType}
          subType={[propertySubType]}
          values={draft.propertyDetails}
          onChange={handlers.changeDetails}
          errors={draft.propertyDetailsErrors}
          projectDetails={draft.projectDetails}
          onProjectDetailsChange={handlers.changeProjectDetails}
          builderLayout
        />
      );
    }

    return (
      <PropertyDetailsField
        listingType={draft.listingType}
        propertyType={draft.propertyType}
        subType={propertySubType}
        values={draft.propertyDetails}
        onChange={handlers.changeDetails}
        errors={draft.propertyDetailsErrors}
      />
    );
  };

  return (
    <PostPropertyStepCard
      title="Add Property Details"
      description="Step 2 of 5 - Area, rooms, and floor information"
      actionLabel="Next, Add Amenities"
      onAction={handlers.submitPropertyDetails}
      onBack={handlers.goBack}
    >
      {renderDetailsFields()}
      {isMultiSubType ? null : <BuilderProjectBlocks form={form} />}
    </PostPropertyStepCard>
  );
}
