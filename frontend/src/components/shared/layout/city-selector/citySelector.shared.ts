export const CITY_STORAGE_KEY = "lokesha-selected-city";

export const ALL_INDIA_LABEL = "All India";

export const DEFAULT_SELECTED_CITY = "Ahmedabad";

export type PopularCity = {
  id: string;
  name: string;
  imageSrc: string;
};

export const POPULAR_CITIES: PopularCity[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    imageSrc: "/assets/images/popular_city_images/mumbai.svg",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    imageSrc: "/assets/images/popular_city_images/bengaluru.svg",
  },
  {
    id: "pune",
    name: "Pune",
    imageSrc: "/assets/images/popular_city_images/pune.svg",
  },
  {
    id: "chennai",
    name: "Chennai",
    imageSrc: "/assets/images/popular_city_images/chennai.svg",
  },
  {
    id: "kolkata",
    name: "Kolkata",
    imageSrc: "/assets/images/popular_city_images/kolkata.svg",
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    imageSrc: "/assets/images/popular_city_images/ahmedabad.svg",
  },
  {
    id: "delhi",
    name: "Delhi",
    imageSrc: "/assets/images/popular_city_images/new_delhi.svg",
  },
  {
    id: "noida",
    name: "Noida",
    imageSrc: "/assets/images/popular_city_images/noida.svg",
  },
  {
    id: "gurgaon",
    name: "Gurgaon",
    imageSrc: "/assets/images/popular_city_images/gurgaon.svg",
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    imageSrc: "/assets/images/popular_city_images/hyderabad.svg",
  },
  {
    id: "gandhinagar",
    name: "Gandhinagar",
    imageSrc: "/assets/images/popular_city_images/gandhinagar.svg",
  },
];

export type CitySelectorView = "popular" | "all";

export const CITY_PANEL_MAX_WIDTH = 512;
export const CITY_PANEL_GUTTER = 12;

export type CityPanelPlacement = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  caretLeft: number;
  backdropTop: number;
};

function preferredAlignOffset(isMobile: boolean, viewportWidth: number) {
  if (isMobile) return 0;
  if (viewportWidth >= 1280) return 40;
  if (viewportWidth >= 1024) return 32;
  return 16;
}

export function getCityPanelPlacement(
  trigger: DOMRect,
  isMobile: boolean,
): CityPanelPlacement {
  const visual = window.visualViewport;
  const viewportWidth = window.innerWidth;
  const visualBottom = visual ? visual.offsetTop + visual.height : window.innerHeight;
  const usableBottom = Math.min(window.innerHeight, visualBottom);
  const gutter = isMobile ? 10 : 16;
  const width = Math.min(CITY_PANEL_MAX_WIDTH, Math.max(0, viewportWidth - gutter * 2));
  const alignOffset = preferredAlignOffset(isMobile, viewportWidth);
  const minLeft = gutter;
  const maxLeft = Math.max(minLeft, viewportWidth - gutter - width);
  const left = Math.min(Math.max(trigger.left - alignOffset, minLeft), maxLeft);
  const top = trigger.bottom;
  const caretLeft = Math.min(
    Math.max(16, trigger.left + trigger.width / 2 - left - 7),
    Math.max(16, width - 24),
  );

  return {
    top,
    left,
    width,
    maxHeight: Math.max(220, usableBottom - top - gutter),
    caretLeft,
    backdropTop: trigger.bottom,
  };
}
