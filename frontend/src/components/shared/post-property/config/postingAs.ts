export type PostingAsId = "buyer_owner_tenant" | "agent" | "builder";

export const POSTING_AS_OPTIONS: { value: PostingAsId; label: string }[] = [
  { value: "buyer_owner_tenant", label: "Owner/Buyer/Tenant" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
];

export function isPostingAsId(value: string): value is PostingAsId {
  return POSTING_AS_OPTIONS.some((option) => option.value === value);
}
