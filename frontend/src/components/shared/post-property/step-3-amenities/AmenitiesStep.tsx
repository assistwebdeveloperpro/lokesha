import BhkCarParkingField from "../builder/BhkCarParkingField";
import {
  BuilderAmenityExtras,
  BuilderHighlightBlocks,
} from "../builder/BuilderFormBlocks";
import PostPropertyStepCard from "../components/PostPropertyStepCard";
import SubTypeDetailsTabs from "../step-2-property-details/SubTypeDetailsTabs";
import type { PostPropertyForm } from "../hooks/usePostPropertyForm";
import AmenitiesField from "./AmenitiesField";

export default function AmenitiesStep({ form }: { form: PostPropertyForm }) {
  const { draft, derived, layout, subForms, handlers } = form;
  const { showBuilderFields, isMultiSubType, activeTabId, isRent, builderConfig } = derived;
  const { amenitySections } = layout;
  const builderExtras = showBuilderFields ? <BuilderAmenityExtras form={form} /> : undefined;

  const renderAmenityFields = () => {
    if (!(showBuilderFields && isMultiSubType)) {
      return (
        <AmenitiesField
          isRent={isRent}
          propertyType={draft.propertyType}
          subType={derived.propertySubType}
          values={draft.amenities}
          onChange={handlers.changeAmenities}
          errors={draft.amenitiesErrors}
          hideCarParking={showBuilderFields}
          builder={showBuilderFields}
          builderExtras={builderExtras}
        />
      );
    }

    return (
      <>
        {amenitySections.common.length > 0 ? (
          <AmenitiesField
            key="common-amenities"
            isRent={isRent}
            propertyType={draft.propertyType}
            subType={subForms.firstTabId}
            catalogSubTypes={draft.propertySubTypes}
            values={subForms.getAmenities(subForms.firstTabId)}
            onChange={subForms.changeAmenitiesAll}
            errors={subForms.getCommonAmenitiesErrors()}
            hideCarParking
            builder
            builderExtras={builderExtras}
            sections={{ only: amenitySections.common }}
          />
        ) : null}
        <BuilderHighlightBlocks form={form} />
        {amenitySections.perSubType.length > 0 ? (
          <SubTypeDetailsTabs
            tabs={subForms.tabs}
            activeId={activeTabId}
            onActiveChange={subForms.setActiveId}
            errorIds={subForms.errorIds.amenities}
            title="Amenities for each sub type"
            description="Open each tab and choose the amenities for that sub type."
          >
            <AmenitiesField
              key={activeTabId}
              isRent={isRent}
              propertyType={draft.propertyType}
              subType={activeTabId}
              values={subForms.getAmenities(activeTabId)}
              onChange={(field, value) =>
                subForms.changeAmenities(activeTabId, field, value)
              }
              errors={subForms.amenitiesErrors[activeTabId] ?? {}}
              hideCarParking
              builder
              builderExtras={builderExtras}
              sections={{ only: amenitySections.perSubType }}
            />
          </SubTypeDetailsTabs>
        ) : null}
      </>
    );
  };

  return (
    <PostPropertyStepCard
      title="Add Amenities"
      description="Step 3 of 5 - Furnishing, amenities, and parking"
      actionLabel="Next, Add Photos & Videos"
      onAction={handlers.submitAmenities}
      onBack={handlers.goBack}
    >
      {renderAmenityFields()}

      {showBuilderFields ? (
        <>
          {builderConfig.carParking === "none" ? null : (
            <BhkCarParkingField
              values={draft.projectDetails}
              onChange={handlers.changeProjectDetails}
              amenities={
                isMultiSubType ? subForms.getAmenities(subForms.firstTabId) : draft.amenities
              }
              onAmenitiesChange={
                isMultiSubType ? subForms.changeAmenitiesAll : handlers.changeAmenities
              }
              error={
                isMultiSubType
                  ? subForms.amenitiesErrors[subForms.firstTabId]?.carParking
                  : draft.amenitiesErrors.carParking
              }
              singleBlock={builderConfig.carParking === "single"}
              hideClubMembership={builderConfig.hideClubMembership}
            />
          )}
          {isMultiSubType ? null : <BuilderHighlightBlocks form={form} />}
        </>
      ) : null}
    </PostPropertyStepCard>
  );
}
