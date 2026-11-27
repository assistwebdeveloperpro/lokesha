import type { ComponentType } from "react";
import { Building2, LayoutDashboard, LayoutTemplate, Package, Users } from "lucide-react";

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
      { label: "Our Listings", href: "/backend/properties/our-listings" },
      { label: "Manage Properties", href: "/backend/properties/manage-properties" },
      { label: "Review Properties", href: "/backend/properties/review-properties" },
    ],
  },
  { label: "Leads", href: "/backend/leads", icon: Users },
  {
    label: "Homepage Management",
    href: "/backend/landing-page-sections/limelight-projects",
    icon: LayoutTemplate,
    children: [
      { label: "Limelight Projects", href: "/backend/landing-page-sections/limelight-projects" },
      { label: "Featured Projects", href: "/backend/landing-page-sections/featured-projects" },
      { label: "Iconic Projects", href: "/backend/landing-page-sections/iconic-projects" },
      { label: "Popular Projects", href: "/backend/landing-page-sections/popular-projects" },
      { label: "Newly Launched", href: "/backend/landing-page-sections/newly-launched-projects" },
    ],
  },
  {
    label: "Subscription Manage...",
    href: "/backend/subscription-packages",
    icon: Package,
    children: [
      { label: "Packages", href: "/backend/subscription-packages" },
      { label: "Users", href: "/backend/subscription-users" },
      { label: "Transactions", href: "/backend/subscription-transactions" },
      { label: "Reports", href: "/backend/subscription-reports" },
      { label: "Invoice Settings", href: "/backend/subscription-settings" },
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
