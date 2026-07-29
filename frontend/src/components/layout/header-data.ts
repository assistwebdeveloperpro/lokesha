export const MAIN_NAV_ITEMS = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Sell", href: "/sell" },
  { label: "Home Loans", href: "/home-loans" },
  { label: "Home Interiors", href: "/home-interiors" },
  { label: "Lokesha Advice", href: "/advice", badge: "NEW" as const },
  { label: "Help", href: "/help" },
];

export type HeaderMenuLink = {
  label: string;
  href: string;
  badge?: "NEW";
};

export const GUEST_ACTIVITY_LINKS: HeaderMenuLink[] = [
  { label: "Requested Properties", href: "/requested-properties", badge: "NEW" },
  { label: "Lokesha Diary", href: "/lokesha-diary", badge: "NEW" },
  { label: "Contacted Properties", href: "/contacted-properties" },
  { label: "Viewed Properties", href: "/viewed-properties" },
  { label: "Shortlisted Properties", href: "/shortlisted-properties" },
  { label: "Searches", href: "/searches" },
];

export const GUEST_SECONDARY_LINKS: HeaderMenuLink[] = [
  { label: "Recommendations", href: "/recommendations" },
  { label: "My Profile", href: "/user/profile/account-details" },
];

export const LOGGED_IN_PROFILE_LINK: HeaderMenuLink = {
  label: "My Profile",
  href: "/user/profile/account-details",
};

export const LOGGED_IN_PREMIUM_LINK: HeaderMenuLink = {
  label: "Lokesha Prime",
  href: "/lokesha-prime",
  badge: "NEW",
};

export const LOGGED_IN_ACTIVITY_LINKS: HeaderMenuLink[] = [
  { label: "View Responses", href: "/user/contacts/responses" },
  { label: "Manage Properties", href: "/user/properties/manage-properties" },
  { label: "Manage Alerts", href: "/user/property-alerts" },
  { label: "Manage Subscriptions", href: "/user/subscription/subscribed-services" },
  { label: "PG Dashboard", href: "/pg-dashboard" },
];
