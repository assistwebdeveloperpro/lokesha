export const STRIP_LIMIT = 15;

export const STRIP_LABEL = "Recent Searches:";

export const STRIP_WRAPPER_CLASS = "relative mx-auto mt-4 w-full max-w-5xl";

export const STRIP_ROW_CLASS = "flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4";

export const STRIP_LABEL_CLASS = "shrink-0 whitespace-nowrap text-sm font-bold sm:text-sm text-white drop-shadow";

export const STRIP_LIST_CLASS =
  "flex snap-x gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden";

// Card and skeleton share one size so the layout never jumps
export const STRIP_CARD_SIZE_CLASS = "h-10 shrink-0 snap-start rounded-lg lg:h-12";

export const STRIP_SKELETON_CARD_CLASS = "w-36 lg:w-40";

export const STRIP_CARD_CLASS = `${STRIP_CARD_SIZE_CLASS} flex items-center whitespace-nowrap bg-white lg:w-40 lg:whitespace-normal px-3 text-sm lg:text-xs font-medium leading-snug text-slate-800 shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400`;

export const STRIP_ARROW_CLASS =
  "absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition ";

export const STRIP_SKELETON_COUNT = 4;
