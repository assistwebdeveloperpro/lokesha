export const RECENT_SEARCHES_TITLE = "Recent Searches";

export const RECENT_SEARCHES_SUBTITLE = "Pick up where you left off";

export const RECENT_SEARCHES_SKELETON_COUNT = 6;

export const RECENT_SEARCHES_LIST_CLASS = "flex flex-col gap-3";

// Row and skeleton share one box so the layout never jumps
export const RECENT_SEARCH_ROW_CLASS = "flex min-h-[4.75rem] items-center gap-3 rounded-2xl border px-4 py-3 sm:px-5";

export const RECENT_SEARCHES_EMPTY_STATE = {
  title: "No recent searches yet",
  description: "Your latest searches will show up here so you can repeat them in one click.",
  action: "Start searching",
};

export const RECENT_SEARCHES_CLEAR_CONFIRM = {
  title: "Clear all recent searches?",
  description: "All your recent searches will be removed. This cannot be undone.",
};

export const RECENT_SEARCHES_LOAD_ERROR = "We could not load your recent searches. Please try again.";
export const RECENT_SEARCHES_DELETE_ERROR = "We could not remove this search. Please try again.";
export const RECENT_SEARCHES_CLEAR_ERROR = "We could not clear your recent searches. Please try again.";

export const getRecentSearchesCountLabel = (total: number) => `(${total})`;
