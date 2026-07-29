import type { ComponentType } from "react";
import {
  Bell,
  Building2,
  CircleUserRound,
  ContactRound,
  LayoutDashboard,
  Receipt,
} from "lucide-react";

export type UserDashboardNavChild = {
  label: string;
  href: string;
};

export type UserDashboardNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: UserDashboardNavChild[];
};

export const userDashboardNavItems: UserDashboardNavItem[] = [
  { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  {
    label: "Contacts",
    href: "/user/contacts/active-buyers",
    icon: ContactRound,
    children: [
      { label: "View Responses", href: "/user/contacts/responses" },
      { label: "My Bonus Leads", href: "/user/contacts/bonus-leads" },
      { label: "Most Active Buyers", href: "/user/contacts/active-buyers" },
      { label: "Property Contacts Made", href: "/user/contacts/property-contacts" },
      { label: "Requirement Contacts Made", href: "/user/contacts/requirement-contacts" },
      { label: "Company Contacts Made", href: "/user/contacts/company-contacts" },
    ],
  },
  {
    label: "Properties",
    href: "/user/properties/manage-properties",
    icon: Building2,
    children: [
      { label: "Manage Properties", href: "/user/properties/manage-properties" },
      { label: "Manage Projects", href: "/user/properties/manage-projects" },
      { label: "Post New Properties", href: "/user/properties/post-new-properties" },
      { label: "Locality Reviews", href: "/user/properties/locality-reviews" },
    ],
  },
  { label: "Property Alerts", href: "/user/property-alerts", icon: Bell },  
  {
    label: "Profile",
    href: "/user/profile/account-details",
    icon: CircleUserRound,
    children: [
      { label: "Profile Details", href: "/user/profile/account-details" },
      { label: "Edit Company Details", href: "/user/profile/edit-company-details" },
      { label: "Edit Office Details", href: "/user/profile/edit-office-details" },
      { label: "Manage RERA Details", href: "/user/profile/manage-rera-details" },
      { label: "Edit Login Details", href: "/user/profile/edit-login-details" },
      { label: "Change Password", href: "/user/profile/change-password" },
      { label: "Manage Profile Photos", href: "/user/profile/manage-profile-photos" },
      { label: "Saved Messages", href: "/user/profile/saved-messages" },
    ],
  },
  {
    label: "Subscription",
    href: "/user/subscription/subscribed-services",
    icon: Receipt,
    children: [
      { label: "Subscribed Services", href: "/user/subscription/subscribed-services" },
      { label: "Order History", href: "/user/subscription/order-history" },
      { label: "My Package Usage", href: "/user/subscription/package-usage" },

    ],
  },
];

export function getActiveNavLabel(pathname: string): string {
  const childMatch = userDashboardNavItems
    .flatMap((item) => item.children ?? [{ label: item.label, href: item.href }])
    .filter((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (childMatch) return childMatch.label;

  const topMatch = userDashboardNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return topMatch?.label ?? "Dashboard";
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveSectionHref(pathname: string): string | null {
  const activeSection = userDashboardNavItems.find((item) =>
    item.children?.some((child) => isNavItemActive(pathname, child.href))
  );

  return activeSection?.href ?? null;
}
