export const HEADER_CONTACT = {
  email: "sales@lokesha.com",
  phoneDisplay: "+91 93274 94799",
  phoneHref: "+919327494799",
} as const;

export const MAIN_NAV_ITEMS = [
  { label: "Buy", href: "#" },
  { label: "Rent", href: "#" },
  { label: "Sell", href: "#" },
  { label: "Home Loans", href: "#" },
  { label: "Home Interiors", href: "#" },
  { label: "Lokesha Advice", href: "#", badge: "NEW" as const },
  { label: "Help", href: "#" },
];

export type HeaderMenuLink = {
  label: string;
  href: string;
  badge?: "NEW";
};

export const GUEST_ACTIVITY_LINKS: HeaderMenuLink[] = [
  { label: "Requested Properties", href: "#", badge: "NEW" },
  { label: "Lokesha Diary", href: "#", badge: "NEW" },
  { label: "Contacted Properties", href: "#" },
  { label: "Viewed Properties", href: "#" },
  { label: "Shortlisted Properties", href: "#" },
  { label: "Searches", href: "#" },
];

export const GUEST_SECONDARY_LINKS: HeaderMenuLink[] = [
  { label: "Recommendations", href: "#" },
  { label: "My Profile", href: "/user/profile/account-details" },
];

export const LOGGED_IN_PROFILE_LINK: HeaderMenuLink = {
  label: "My Profile",
  href: "/user/profile/account-details",
};

export const LOGGED_IN_PREMIUM_LINK: HeaderMenuLink = {
  label: "Lokesha Prime",
  href: "#",
  badge: "NEW",
};

export const LOGGED_IN_ACTIVITY_LINKS: HeaderMenuLink[] = [
  { label: "My Dashboard", href: "/user/dashboard" },
  { label: "Manage Properties", href: "/user/properties/manage-properties" },
  { label: "Manage Alerts", href: "/user/property-alerts" },
  { label: "Manage Subscriptions", href: "/user/subscription/subscribed-services" },
  { label: "PG Dashboard", href: "#" },
];
