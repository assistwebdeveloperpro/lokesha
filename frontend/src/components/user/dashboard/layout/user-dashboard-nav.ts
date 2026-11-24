import type { ComponentType } from "react";
import {
  Building2,
  ChartColumn,
  CircleUserRound,
  ContactRound,
  Eye,
  FolderKanban,
  Heart,
  History,
  House,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  PackageCheck,
  PhoneCall,
  Receipt,
  ReceiptText,
  ShieldCheck,
  SquarePlus,
  UserRound,
  Users,
} from "lucide-react";
import type { Role } from "@/services/auth.service";

export type UserDashboardNavChild = {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
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
    label: "My Activity",
    href: "/user/activities/shortlisted-properties",
    icon: ContactRound,
    children: [
      { label: "Shortlisted Properties", href: "/user/activities/shortlisted-properties", icon: Heart },
      { label: "Contacted Properties", href: "/user/activities/contacted-properties", icon: PhoneCall },
      { label: "Seen Properties", href: "/user/activities/seen-properties", icon: Eye },
      { label: "Recent Searches", href: "/user/activities/recent-searches", icon: History },
    ],
  },
  {
    label: "Properties",
    href: "/user/properties/manage-properties",
    icon: Building2,
    children: [
      { label: "Post New Properties", href: "/user/properties/post-new-properties", icon: SquarePlus },
      { label: "Manage Properties", href: "/user/properties/manage-properties", icon: House },
      { label: "Manage Projects", href: "/user/properties/manage-projects", icon: FolderKanban },

    ],
  },
  { label: "Leads", href: "/user/leads", icon: Users },
  {
    label: "Profile",
    href: "/user/profile/account-details",
    icon: CircleUserRound,
    children: [
      { label: "Profile Details", href: "/user/profile/account-details", icon: UserRound },
      { label: "Manage RERA Details", href: "/user/profile/manage-rera-details", icon: ShieldCheck },
      { label: "Edit Login Details", href: "/user/profile/edit-login-details", icon: KeyRound },
      { label: "Saved Messages", href: "/user/profile/saved-messages", icon: MessageSquare },
    ],
  },
  {
    label: "Subscription",
    href: "/user/subscription/subscribed-services",
    icon: Receipt,
    children: [
      { label: "Subscribed Services", href: "/user/subscription/subscribed-services", icon: PackageCheck },
      { label: "Order History", href: "/user/subscription/order-history", icon: ReceiptText },
      { label: "My Package Usage", href: "/user/subscription/package-usage", icon: ChartColumn },

    ],
  },
];

export const BUYER_OWNER_HOME = "/user/profile/account-details";

const BUYER_OWNER_PROFILE_HREFS = new Set([
  BUYER_OWNER_HOME,
  "/user/profile/edit-login-details",
  "/user/profile/saved-messages",
]);

const BUYER_OWNER_RESTRICTED_ROUTE_PREFIXES: string[] = [];

function isBuyerOwner(role: Role | null): boolean {
  return role === "buyer_owner_tenant";
}

function isStaff(role: Role | null): boolean {
  return role === "lokesha_staff";
}

function isSubscriptionRoute(pathname: string): boolean {
  return pathname === "/user/subscription" || pathname.startsWith("/user/subscription/");
}

function hasFullProfileAccess(role: Role | null): boolean {
  return role === "agent" || role === "builder";
}

function isBuyerOwnerRestrictedRoute(pathname: string): boolean {
  return BUYER_OWNER_RESTRICTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getDefaultUserDashboardRoute(): string {
  return "/user/dashboard";
}

export function isUserDashboardRouteAllowed(pathname: string, role: Role | null): boolean {
  if (isStaff(role) && isSubscriptionRoute(pathname)) {
    return false;
  }

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
  return userDashboardNavItems
    .filter((item) => !(isStaff(role) && item.label === "Subscription"))
    .map((item) => {
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
