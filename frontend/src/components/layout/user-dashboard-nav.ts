import type { ComponentType } from "react";
import {
  Bell,
  Building2,
  CircleUserRound,
  ContactRound,
  LayoutDashboard,
  Receipt,
} from "lucide-react";
import type { Role } from "@/services/auth.service";

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

export const BUYER_OWNER_HOME = "/user/profile/account-details";

const BUYER_OWNER_PROFILE_HREFS = new Set([
  BUYER_OWNER_HOME,
  "/user/profile/edit-login-details",
  "/user/profile/change-password",
  "/user/profile/saved-messages",
]);

const BUYER_OWNER_RESTRICTED_ROUTE_PREFIXES = [
  "/user/dashboard",
  "/user/contacts",
  "/user/properties",
];

function isBuyerOwner(role: Role | null): boolean {
  return role === "buyer" || role === "owner";
}

function hasFullProfileAccess(role: Role | null): boolean {
  return role === "agent" || role === "builder";
}

function isBuyerOwnerRestrictedRoute(pathname: string): boolean {
  return BUYER_OWNER_RESTRICTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getDefaultUserDashboardRoute(role: Role | null): string {
  return isBuyerOwner(role) ? BUYER_OWNER_HOME : "/user/dashboard";
}

export function isUserDashboardRouteAllowed(pathname: string, role: Role | null): boolean {
  if (!isBuyerOwner(role)) {
    return true;
  }

  return !isBuyerOwnerRestrictedRoute(pathname);
}

export function isProfileRouteAllowed(pathname: string, role: Role | null): boolean {
  if (!pathname.startsWith("/user/profile/")) {
    return true;
  }

  if (hasFullProfileAccess(role)) {
    return true;
  }

  return BUYER_OWNER_PROFILE_HREFS.has(pathname);
}

export function getRestrictedNavRedirect(
  href: string,
  role: Role | null
): string | null {
  if (isBuyerOwner(role) && isBuyerOwnerRestrictedRoute(href)) {
    return BUYER_OWNER_HOME;
  }

  return null;
}

export function getUserDashboardNavItems(role: Role | null): UserDashboardNavItem[] {
  return userDashboardNavItems.map((item) => {
    if (!hasFullProfileAccess(role) && item.label === "Profile" && item.children) {
      return {
        ...item,
        children: item.children.filter((child) =>
          BUYER_OWNER_PROFILE_HREFS.has(child.href)
        ),
      };
    }

    return item;
  });
}

export function getActiveNavLabel(pathname: string, role: Role | null = null): string {
  const navItems = getUserDashboardNavItems(role);
  const childMatch = navItems
    .flatMap((item) => item.children ?? [{ label: item.label, href: item.href }])
    .filter((entry) => isNavItemActive(pathname, entry.href, role))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (childMatch) return childMatch.label;

  const topMatch = navItems.find((item) => isNavItemActive(pathname, item.href, role));

  return topMatch?.label ?? "Dashboard";
}

export function isNavItemActive(
  pathname: string,
  href: string,
  role: Role | null = null
): boolean {
  if (isBuyerOwner(role) && isBuyerOwnerRestrictedRoute(href)) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveSectionHref(pathname: string, role: Role | null = null): string | null {
  const navItems = getUserDashboardNavItems(role);
  const activeSection = navItems.find((item) => {
    if (isBuyerOwner(role) && isBuyerOwnerRestrictedRoute(item.href)) {
      return false;
    }

    return item.children?.some((child) => isNavItemActive(pathname, child.href, role));
  });

  return activeSection?.href ?? null;
}
