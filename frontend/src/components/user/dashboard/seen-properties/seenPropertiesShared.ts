import { SAVED_PAGE_SIZE } from "../saved-properties/savedPropertiesShared";

// Same page size as the saved grid, so the shared grid and skeleton line up
export const SEEN_PAGE_SIZE = SAVED_PAGE_SIZE;

export const SEEN_EMPTY_STATE = {
  title: "No recently viewed properties",
  description: "Properties you open will show up here so you can find them again quickly.",
};

export function getLastPage(total: number, pageSize: number = SEEN_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
