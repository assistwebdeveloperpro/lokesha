"use client";

import { useId, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { HeroSearchHintsDropdown } from "@/components/landing/home/hero-banner/HeroSearchHintsDropdown";
import { searchTagKey } from "@/components/landing/home/hero-banner/heroSearchTags";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { useHeaderSearch } from "./useHeaderSearch";

type PropertySearchHeaderSearchProps = {
  criteria: PropertySearchCriteria;
};

export function PropertySearchHeaderSearch({
  criteria,
}: PropertySearchHeaderSearchProps) {
  const {
    searchText,
    searchTags,
    searchError,
    searchSuggestions,
    handleSearchTextChange,
    addSearchTag,
    addTypedSearchTag,
    removeSearchTag,
    submitSearch,
  } = useHeaderSearch(criteria);
  const [hintsRequested, setHintsRequested] = useState(false);
  const hintsId = useId();
  const errorId = useId();
  const hintsOpen = hintsRequested && !searchError;

  return (
    <div className="relative">
      <div className="flex h-10 items-stretch overflow-visible rounded-lg bg-white shadow-sm">
        <div className="relative flex min-w-0 flex-1 items-center">
          <MapPin
            className="pointer-events-none absolute left-3 h-4 w-4 text-sky-600"
            aria-hidden
          />
          <div className="flex h-full w-full items-center gap-1.5 overflow-x-auto py-1 pl-9 pr-2 scrollbar-none">
            {searchTags.map((tag) => (
              <span
                key={searchTagKey(tag)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-200 bg-sky-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-navy-blue"
              >
                {tag.label}
                <button
                  type="button"
                  aria-label={`Remove ${tag.label}`}
                  onClick={() => removeSearchTag(tag)}
                  className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full hover:bg-sky-100"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={searchText}
              onChange={(event) => handleSearchTextChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (searchText.trim()) addTypedSearchTag();
                  else submitSearch();
                } else if (
                  event.key === "Backspace" &&
                  !searchText &&
                  searchTags.length > 0
                ) {
                  removeSearchTag(searchTags[searchTags.length - 1]);
                }
              }}
              onFocus={() => setHintsRequested(true)}
              onBlur={() => setHintsRequested(false)}
              placeholder={
                searchTags.length === 0
                  ? "Enter City, Locality, Project, Developer Name"
                  : "Add more"
              }
              role="combobox"
              aria-expanded={hintsOpen}
              aria-controls={hintsId}
              aria-invalid={searchError !== null}
              aria-describedby={searchError ? errorId : undefined}
              className="h-full min-w-24 flex-1 border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={submitSearch}
          aria-label="Search"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-r-lg bg-sky-600 px-4 text-white transition hover:bg-sky-700 focus-visible:outline-none"
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {hintsOpen && (
        <div id={hintsId}>
          <HeroSearchHintsDropdown
            searchText={searchText}
            suggestions={searchSuggestions}
            onSelect={addSearchTag}
          />
        </div>
      )}
      {searchError && (
        <p
          id={errorId}
          role="alert"
          className="absolute left-0 top-full z-10 mt-1 rounded bg-white px-2 py-0.5 text-xs font-medium text-red-500 shadow"
        >
          {searchError}
        </p>
      )}
    </div>
  );
}
