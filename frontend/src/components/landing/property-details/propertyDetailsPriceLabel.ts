import {
  hasPropertyPriceRange,
  type PropertyListPriceFields,
} from "@/components/user/dashboard/manage-properties/managePropertiesShared";

export function propertyDetailsHeroPriceLabel(item: PropertyListPriceFields): string {
  const isRent = item.listingType === "rent-lease";
  if (hasPropertyPriceRange(item)) {
    return isRent ? "Rent" : "Price";
  }
  return isRent ? "Rent" : "Price";
}
