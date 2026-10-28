import { showsConstructionProgress } from "@/components/master/post-property/postPropertyProjectDetails";
import { BuilderMediaBlocks } from "../builder/BuilderFormBlocks";
import {
  PROJECT_PHOTO_CATEGORY_IDS,
  type PhotoCategoryId,
} from "../config/postPropertyForm.shared";
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
  const { draft, derived, layout, subForms, handlers, mediaUploader, getMediaUploader } = form;
  const { showBuilderFields, isMultiSubType, activeTabId, builderConfig } = derived;
  const { propertyType, listingType, existingMedia } = draft;

  const builderExtraCategoryIds: PhotoCategoryId[] | undefined =
    showBuilderFields &&
    builderConfig.showConstructionProgress &&
    showsConstructionProgress(draft.projectDetails.projectType)
      ? ["construction-progress"]
      : undefined;

  const isProjectCategory = (category?: string) =>
    PROJECT_PHOTO_CATEGORY_IDS.includes(category as PhotoCategoryId);

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
          uploader={mediaUploader}
        />
      );
    }

    if (showBuilderFields && isMultiSubType) {
      return (
        <>
          <PhotosVideosField
            key={`${propertyType}-project`}
            parts="photos"
            title="Project Photos"
            description="Main photo and photos that cover the entire project, shown for every sub type"
            propertyType={propertyType}
            listingType={listingType}
            subType={subForms.firstTabId}
            onlyCategoryIds={PROJECT_PHOTO_CATEGORY_IDS}
            values={subForms.getPhotos(subForms.firstTabId)}
            onChange={(next) => subForms.changePhotos(subForms.firstTabId, next)}
            error={subForms.photosErrors[subForms.firstTabId]}
            existingMedia={existingMedia.filter(({ category }) => isProjectCategory(category))}
            onRemoveExisting={handlers.removeExistingMedia}
            uploader={mediaUploader}
          />
          <PhotosVideosField
            key={`${propertyType}-brochure`}
            parts="brochure"
            propertyType={propertyType}
            listingType={listingType}
            subType={subForms.firstTabId}
            values={subForms.getPhotos(subForms.firstTabId)}
            onChange={(next) => subForms.changePhotos(subForms.firstTabId, next)}
            uploader={mediaUploader}
          />
          <BuilderMediaBlocks form={form} />
          <SubTypeDetailsTabs
            tabs={subForms.tabs}
            activeId={activeTabId}
            onActiveChange={subForms.setActiveId}
            errorIds={subForms.errorIds.photos}
            title="Photos for each sub type"
            description="Optionally open each tab and upload photos for that sub type."
          >
            <PhotosVideosField
              key={`${propertyType}-${activeTabId}`}
              parts="photos"
              propertyType={propertyType}
              listingType={listingType}
              subType={activeTabId}
              excludedCategoryIds={
                activeTabId === subForms.firstTabId
                  ? [...BUILDER_EXCLUDED_CATEGORY_IDS, ...PROJECT_PHOTO_CATEGORY_IDS]
                  : BUILDER_EXCLUDED_CATEGORY_IDS
              }
              extraCategoryIds={builderExtraCategoryIds}
              values={subForms.getPhotos(activeTabId)}
              onChange={(next) => subForms.changePhotos(activeTabId, next)}
              error={
                activeTabId === subForms.firstTabId
                  ? undefined
                  : subForms.photosErrors[activeTabId]
              }
              existingMedia={
                activeTabId === subForms.firstTabId
                  ? existingMedia.filter(({ category }) => !isProjectCategory(category))
                  : []
              }
              onRemoveExisting={handlers.removeExistingMedia}
              uploader={getMediaUploader(activeTabId)}
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
        uploader={mediaUploader}
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
