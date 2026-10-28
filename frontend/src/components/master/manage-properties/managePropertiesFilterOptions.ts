import type { ListingStatusFilter } from "./useManageProperties";

export type ListedByRoleFilter =
  | ""
  | "buyer_owner_tenant"
  | "agent"
  | "builder"
  | "lokesha_staff"
  | "admin";

export const MANAGE_ROLE_FILTER_OPTIONS: { value: ListedByRoleFilter; label: string }[] = [
  { value: "", label: "All roles" },
  { value: "buyer_owner_tenant", label: "Buyer" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
  { value: "lokesha_staff", label: "Lokesha Staff" },
  { value: "admin", label: "Admin" },
];

export const MANAGE_STATUS_FILTER_OPTIONS: { value: ListingStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
];
