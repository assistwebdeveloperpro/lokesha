import type { Role } from "@/services/auth.service";

export type PostingAsId = "buyer_owner_tenant" | "agent" | "builder";

export const POSTING_AS_OPTIONS: { value: PostingAsId; label: string }[] = [
  { value: "buyer_owner_tenant", label: "Owner/Buyer/Tenant" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
];

export function isPostingAsId(value: string): value is PostingAsId {
  return POSTING_AS_OPTIONS.some((option) => option.value === value);
}

// Owner and agent posts keep amenities optional; builder listings do not
export function resolveOptionalAmenities(options: {
  role: Role | null;
  isStaff: boolean;
  postingAs: PostingAsId | "";
  isBuilderPost: boolean;
  isOwnerAgentListing?: boolean;
}): boolean {
  if (options.isBuilderPost) {
    return false;
  }
  if (options.isOwnerAgentListing) {
    return true;
  }
  if (options.role === "buyer_owner_tenant" || options.role === "agent") {
    return true;
  }
  if (
    options.isStaff &&
    (options.postingAs === "buyer_owner_tenant" || options.postingAs === "agent")
  ) {
    return true;
  }
  return false;
}
