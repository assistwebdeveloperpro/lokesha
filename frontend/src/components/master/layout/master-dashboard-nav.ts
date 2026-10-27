import type { ComponentType } from "react";
import { Building2, LayoutDashboard } from "lucide-react";

export type MasterDashboardNavChild = {
  label: string;
  href: string;
};

export type MasterDashboardNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: MasterDashboardNavChild[];
};

export const MASTER_DEFAULT_ROUTE = "/backend/dashboard";

export const masterDashboardNavItems: MasterDashboardNavItem[] = [
  { label: "Dashboard", href: "/backend/dashboard", icon: LayoutDashboard },
  {
    label: "Properties",
    href: MASTER_DEFAULT_ROUTE,
    icon: Building2,
    children: [
      { label: "Post Property", href: "/backend/properties/post-property" },
      { label: "Manage Properties", href: "/backend/properties/manage-properties" },
      { label: "Review Properties", href: "/backend/properties/review-properties" },
    ],
  },
];

export function isMasterNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getMasterActiveSectionHref(pathname: string): string | null {
  const section = masterDashboardNavItems.find((item) =>
    item.children?.some((child) => isMasterNavItemActive(pathname, child.href)),
  );

  return section?.href ?? null;
}

export function getMasterActiveNavLabel(pathname: string): string {
  const match = masterDashboardNavItems
    .flatMap((item) => item.children ?? [{ label: item.label, href: item.href }])
    .find((entry) => isMasterNavItemActive(pathname, entry.href));

  return match?.label ?? "Post Property";
}
