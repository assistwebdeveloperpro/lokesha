export const POSTED_BY_SEARCH_VALUES = [
  "buyer_owner_tenant",
  "agent",
  "builder",
] as const;

export type PostedBySearchValue = (typeof POSTED_BY_SEARCH_VALUES)[number];

const POSTED_BY_ALIASES: Record<string, PostedBySearchValue> = {
  owner: "buyer_owner_tenant",
  buyer_owner_tenant: "buyer_owner_tenant",
  agent: "agent",
  builder: "builder",
};

export function normalizePostedBySegment(segment: string): PostedBySearchValue | undefined {
  const key = segment.trim().toLowerCase().replace(/-/g, "_");
  return POSTED_BY_ALIASES[key];
}

export function parsePostedByParam(value: string | undefined): PostedBySearchValue[] {
  const roles = new Set<PostedBySearchValue>();
  for (const part of (value ?? "").split(",")) {
    const role = normalizePostedBySegment(part);
    if (role) roles.add(role);
  }
  return [...roles];
}

export function formatPostedByParam(role: string): string {
  return role === "buyer_owner_tenant" ? "owner" : role;
}
