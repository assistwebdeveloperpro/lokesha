import { showsConstructionProgress } from "@/components/master/post-property/postPropertyProjectDetails";
import { BuilderMediaBlocks } from "../builder/BuilderFormBlocks";
import type { PhotoCategoryId } from "../config/postPropertyForm.shared";
import PostPropertyStepCard from "../components/PostPropertyStepCard";
import SubTypeDetailsTabs from "../step-2-property-details/SubTypeDetailsTabs";
import type { PostPropertyForm } from "../hooks/usePostPropertyForm";
import PhotosVideosField from "./PhotosVideosField";

// Builder uploads these project wide, outside the photo categories
const BUILDER_EXCLUDED_CATEGORY_IDS: PhotoCategoryId[] = [
  "brochure-images",
  "cluster-plan",
  "elevation",
];

export default function PhotosVideosStep({ form }: { form: PostPropertyForm }) {
  const { draft, derived, layout, subForms, handlers } = form;
  const { showBuilderFields, isMultiSubType, activeTabId, builderConfig } = derived;
  const { propertyType, listingType, existingMedia } = draft;
  const { existingBrochureName } = derived;

  const builderExtraCategoryIds: PhotoCategoryId[] | undefined =
    showBuilderFields &&
    builderConfig.showConstructionProgress &&
    showsConstructionProgress(draft.projectDetails.projectType)
      ? ["construction-progress"]
      : undefined;

  const renderPhotoFields = () => {
    if (showBuilderFields && isMultiSubType && layout.sharedPhotos) {
      return (
        <PhotosVideosField
          key={`${propertyType}-shared`}
          propertyType={propertyType}
          listingType={listingType}
          subType={subForms.firstTabId}
          excludedCategoryIds={BUILDER_EXCLUDED_CATEGORY_IDS}
          extraCategoryIds={builderExtraCategoryIds}
          values={subForms.getPhotos(subForms.firstTabId)}
          onChange={(next) => subForms.changePhotos(subForms.firstTabId, next)}
          error={subForms.photosErrors[subForms.firstTabId]}
          existingMedia={existingMedia}
          onRemoveExisting={handlers.removeExistingMedia}
          existingBrochureName={existingBrochureName}
        />
      );
    }

    if (showBuilderFields && isMultiSubType) {
      return (
        <>
          <PhotosVideosField
            key={`${propertyType}-brochure`}
            parts="brochure"
            propertyType={propertyType}
            listingType={listingType}
            subType={subForms.firstTabId}
            values={subForms.getPhotos(subForms.firstTabId)}
            onChange={(next) => subForms.changePhotos(subForms.firstTabId, next)}
            existingBrochureName={existingBrochureName}
          />
          <BuilderMediaBlocks form={form} />
          <SubTypeDetailsTabs
            tabs={subForms.tabs}
            activeId={activeTabId}
            onActiveChange={subForms.setActiveId}
            errorIds={subForms.errorIds.photos}
          >
            <PhotosVideosField
              key={`${propertyType}-${activeTabId}`}
              parts="photos"
              propertyType={propertyType}
              listingType={listingType}
              subType={activeTabId}
              excludedCategoryIds={BUILDER_EXCLUDED_CATEGORY_IDS}
              extraCategoryIds={builderExtraCategoryIds}
              values={subForms.getPhotos(activeTabId)}
              onChange={(next) => subForms.changePhotos(activeTabId, next)}
              error={subForms.photosErrors[activeTabId]}
              existingMedia={activeTabId === subForms.firstTabId ? existingMedia : []}
              onRemoveExisting={handlers.removeExistingMedia}
            />
          </SubTypeDetailsTabs>
        </>
      );
    }

    return (
      <PhotosVideosField
        key={`${propertyType}-${derived.propertySubType}`}
        propertyType={propertyType}
        listingType={listingType}
        subType={derived.propertySubType}
        excludedCategoryIds={showBuilderFields ? BUILDER_EXCLUDED_CATEGORY_IDS : undefined}
        extraCategoryIds={builderExtraCategoryIds}
        values={draft.photosVideos}
        onChange={handlers.changePhotos}
        error={draft.photosError}
        existingMedia={existingMedia}
        onRemoveExisting={handlers.removeExistingMedia}
        existingBrochureName={existingBrochureName}
      />
    );
  };

  return (
    <PostPropertyStepCard
      title="Add Photos & Videos"
      description="Step 4 of 5 - Upload photos to attract more buyers"
      actionLabel="Continue"
      onAction={handlers.submitPhotos}
      onBack={handlers.goBack}
    >
      {renderPhotoFields()}
      {isMultiSubType && !layout.sharedPhotos ? null : <BuilderMediaBlocks form={form} />}
    </PostPropertyStepCard>
  );
}
