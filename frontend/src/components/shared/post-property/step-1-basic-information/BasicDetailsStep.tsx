import PostPropertyStepCard from "../components/PostPropertyStepCard";
import type { PostPropertyForm } from "../hooks/usePostPropertyForm";
import AddressLocationField from "./AddressLocationField";
import ListingTypeField from "./ListingTypeField";
import PropertyTypeField from "./PropertyTypeField";

export default function BasicDetailsStep({ form }: { form: PostPropertyForm }) {
  const { draft, derived, handlers } = form;
  const { showBuilderFields, builderConfig, propertySubType } = derived;

  return (
    <PostPropertyStepCard
      title="Add Basic Details"
      description="Step 1 of 5 - Tell us about your listing"
      actionLabel="Next, Add Property Details"
      onAction={handlers.submitBasicDetails}
    >
      <ListingTypeField
        value={draft.listingType}
        onChange={handlers.changeListingType}
        allowedIds={
          showBuilderFields
            ? ["sale"]
            : draft.propertyType === "pg-co-living"
              ? ["rent-lease"]
              : undefined
        }
      />

      <PropertyTypeField
        value={draft.propertyType}
        onChange={handlers.changePropertyType}
        subType={propertySubType}
        onSubTypeChange={handlers.changeSubType}
        subTypes={showBuilderFields ? draft.propertySubTypes : undefined}
        onSubTypesChange={showBuilderFields ? handlers.changeSubTypes : undefined}
        hiddenIds={showBuilderFields ? ["pg-co-living"] : undefined}
      />

      <AddressLocationField
        values={draft.addressLocation}
        onChange={handlers.changeAddress}
        errors={draft.addressLocationErrors}
        hideUnitFields={showBuilderFields && builderConfig.hideUnitFields}
        projectNameRequired={!derived.addressValidationOptions.projectNameOptional}
      />
    </PostPropertyStepCard>
  );
}
