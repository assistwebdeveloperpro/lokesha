import {
  hasPropertyPriceRange,
  type PropertyListPriceFields,
} from "@/components/user/dashboard/manage-properties/managePropertiesShared";

export function propertyDetailsHeroPriceLabel(item: PropertyListPriceFields): string {
  const isRent = item.listingType === "rent-lease";
  if (hasPropertyPriceRange(item)) {
    return isRent ? "Rent Range" : "Price Range";
  }
  return isRent ? "Rent" : "Expected Price";
}
