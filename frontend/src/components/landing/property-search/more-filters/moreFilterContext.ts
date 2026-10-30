import { CATEGORY_ID_BY_SLUG } from "@/lib/property-search-url/searchUrl.config";
import type {
  CategorySlug,
  PropertySearchCriteria,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";
import { toUrlSegment } from "@/lib/property-search-url/slug";
import {
  getFormConfig,
  type SaleFormConfig,
} from "@/components/shared/post-property/config/postPropertySaleConfig";
import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  isRentListing,
  type ListingTypeId,
  type PropertyTypeId,
} from "@/components/shared/post-property/config/postPropertyForm.shared";
import { getCategoryFilters, sameValue } from "../searchFilterOptions";

export type MoreFilterContext = {
  propertyTypeId: PropertyTypeId;
  listingTypeId: ListingTypeId;
  subTypeIds: string[];
  isRent: boolean;
  formConfigs: SaleFormConfig[];
};

export function listingTypeFromTransaction(
  transaction: TransactionSlug,
): ListingTypeId {
  return transaction === "property-for-sale" ? "sale" : "rent-lease";
}

export function urlPropertyTypeToSubTypeId(
  propertyTypeId: PropertyTypeId,
  urlValue: string,
): string | undefined {
  const subTypes = SUB_TYPES_BY_PROPERTY_TYPE[propertyTypeId] ?? [];
  return subTypes.find((item) => sameValue(toUrlSegment(item.label), urlValue))
    ?.id;
}

export function resolveSearchSubTypeIds(
  criteria: PropertySearchCriteria,
): string[] {
  const propertyTypeId = CATEGORY_ID_BY_SLUG[
    criteria.category
  ] as PropertyTypeId;
  const allSubTypes = (SUB_TYPES_BY_PROPERTY_TYPE[propertyTypeId] ?? []).map(
    (item) => item.id,
  );

  if (propertyTypeId === "pg-co-living") {
    return allSubTypes.length > 0 ? [allSubTypes[0]] : [];
  }

  const { propertyTypeOptions } = getCategoryFilters(criteria.category);
  const allUrlValues = propertyTypeOptions.map((option) => option.value);
  const selectedUrlValues =
    criteria.propertyTypes.length > 0 ? criteria.propertyTypes : allUrlValues;

  const ids = selectedUrlValues
    .map((value) => urlPropertyTypeToSubTypeId(propertyTypeId, value))
    .filter((id): id is string => Boolean(id));

  return ids.length > 0 ? [...new Set(ids)] : allSubTypes;
}

export function buildMoreFilterContext(
  criteria: PropertySearchCriteria,
): MoreFilterContext {
  const propertyTypeId = CATEGORY_ID_BY_SLUG[
    criteria.category
  ] as PropertyTypeId;
  const listingTypeId = listingTypeFromTransaction(criteria.transaction);
  const subTypeIds = resolveSearchSubTypeIds(criteria);
  const isRent = isRentListing(listingTypeId);

  const formConfigs = subTypeIds
    .map((subTypeId) =>
      getFormConfig(listingTypeId, propertyTypeId, subTypeId, false),
    )
    .filter((config): config is SaleFormConfig => config !== null);

  return {
    propertyTypeId,
    listingTypeId,
    subTypeIds,
    isRent,
    formConfigs,
  };
}

export function primarySubTypeId(context: MoreFilterContext): string | undefined {
  return context.subTypeIds.length === 1 ? context.subTypeIds[0] : undefined;
}
