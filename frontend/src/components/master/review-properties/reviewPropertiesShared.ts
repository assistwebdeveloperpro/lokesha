import type { ReviewStatus } from "@/services/propertyReview.service";

export const PAGE_SIZE = 12;

export const REVIEW_EMPTY_STATES: Record<
  ReviewStatus,
  { title: string; description: string }
> = {
  pending: {
    title: "Nothing in the queue",
    description: "No properties are waiting for review. New submissions will appear here.",
  },
  published: {
    title: "No published listings",
    description: "Properties you approve will show up in this list.",
  },
  rejected: {
    title: "No rejected listings",
    description: "Properties declined during review will be listed here.",
  },
  closed: {
    title: "No closed listings",
    description: "Closed properties will appear here when owners mark them inactive.",
  },
};
