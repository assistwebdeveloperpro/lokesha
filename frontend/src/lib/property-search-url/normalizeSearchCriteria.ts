import { EMPTY_MORE_FILTERS } from "./moreFilters.types";
import type { PropertySearchCriteria } from "./searchUrl.types";

export function normalizeSearchCriteria(
  criteria: PropertySearchCriteria,
): PropertySearchCriteria {
  return {
    ...criteria,
    localities: criteria.localities ?? [],
    projects: criteria.projects ?? [],
    bedrooms: criteria.bedrooms ?? [],
    propertyTypes: criteria.propertyTypes ?? [],
    constructionStatuses: criteria.constructionStatuses ?? [],
    saleTypes: criteria.saleTypes ?? [],
    occupancies: criteria.occupancies ?? [],
    genders: criteria.genders ?? [],
    postedBy: criteria.postedBy ?? [],
    more: { ...EMPTY_MORE_FILTERS, ...criteria.more },
  };
}
