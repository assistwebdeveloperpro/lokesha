import {
  getPhotoCategories,
  type AmenitiesValues,
  type ListingTypeId,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import {
  AMENITY_SECTION_FIELDS,
  COMMON_SECTION_FIELDS,
  getBuilderAmenitiesConfig,
  getBuilderDetailsConfig,
  getCommonAmenitySections,
  getCommonDetailSections,
  getFormConfig,
  type CommonDetailSections,
} from "../config/postPropertySaleConfig";

type LayoutInput = {
  propertyType: PropertyTypeId;
  listingType: ListingTypeId;
  propertySubTypes: string[];
  builder: boolean;
};

const NO_COMMON_SECTIONS: CommonDetailSections = { transaction: false, floors: false };

// Decides which blocks a builder asks once for all sub types and which stay per sub type tab
export function getSubTypeLayout({
  propertyType,
  listingType,
  propertySubTypes,
  builder,
}: LayoutInput) {
  const isBuilderMulti = builder && propertySubTypes.length > 1;

  const detailConfigs = propertySubTypes.map((id) =>
    getBuilderDetailsConfig(propertyType, id),
  );
  const commonSections: CommonDetailSections = isBuilderMulti
    ? getCommonDetailSections(detailConfigs)
    : NO_COMMON_SECTIONS;
  const commonDetailsFields = [
    ...(commonSections.transaction ? COMMON_SECTION_FIELDS.transaction : []),
    ...(commonSections.floors ? COMMON_SECTION_FIELDS.floors : []),
  ];

  const amenitySections = isBuilderMulti
    ? getCommonAmenitySections(
        propertySubTypes.map((id) => getBuilderAmenitiesConfig(propertyType, id)),
      )
    : { common: [], perSubType: [] };
  const commonAmenitiesFields = amenitySections.common.flatMap(
    (section) => AMENITY_SECTION_FIELDS[section],
  ) as Array<keyof AmenitiesValues>;

  // Same photo categories for every sub type means one shared photo set
  const sharedPhotos =
    isBuilderMulti &&
    new Set(
      propertySubTypes.map((id) =>
        getPhotoCategories(propertyType, { listingType, subType: id })
          .map((category) => category.id)
          .join(","),
      ),
    ).size === 1;

  const priceInclusionFlags = propertySubTypes.map(
    (id) => getFormConfig("sale", propertyType, id, true)?.pricing.priceInclusion ?? true,
  );
  const sharedPricing = priceInclusionFlags.every((flag) => flag === priceInclusionFlags[0]);

  return {
    isBuilderMulti,
    commonSections,
    commonDetailsCfg: detailConfigs[0],
    commonDetailsFields,
    amenitySections,
    commonAmenitiesFields,
    sharedPhotos,
    priceInclusionFlags,
    sharedPricing,
  };
}

export type SubTypeLayout = ReturnType<typeof getSubTypeLayout>;
