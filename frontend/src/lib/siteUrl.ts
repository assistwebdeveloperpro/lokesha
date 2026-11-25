const DEFAULT_SITE_URL = "http://192.168.1.20:3001";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/+$/, "");

export const SITE_NAME = "Lokesha";

export const buildSiteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
