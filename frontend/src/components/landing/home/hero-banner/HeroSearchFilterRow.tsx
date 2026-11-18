"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { ChevronDown, MapPin, Search, Sparkles, X } from "lucide-react";
import { HeroSearchHintsDropdown } from "./HeroSearchHintsDropdown";
import {
  BAR_CONTROL,
  BAR_HEIGHT,
  FOCUS_RING,
  MENU_ITEM_ACTIVE,
  MENU_ITEM_DEFAULT,
  TRANSACTION_LABELS,
  type SimpleDropdown,
} from "./heroBanner.shared";
import { HeroPropertyFilterPanel } from "./HeroPropertyFilterPanel";
import { searchTagKey } from "./heroSearchTags";
import type { HeroBannerFilters } from "./useHeroBannerFilters";

type HeroSearchFilterRowProps = HeroBannerFilters;

export function HeroSearchFilterRow(filters: HeroSearchFilterRowProps) {
  const {
    transaction,
    transactionOptions,
    setTransaction,
    searchText,
    handleSearchTextChange,
    searchTags,
    searchError,
    searchSuggestions,
    addSearchTag,
    addTypedSearchTag,
    removeSearchTag,
    submitSearch,
    openDropdown,
    setOpenDropdown,
    propertySelectorLabel,
    isPg,
  } = filters;

  const [searchHintsRequested, setSearchHintsOpen] = useState(false);
  // Hints give way to any open filter dropdown
  const searchHintsOpen = searchHintsRequested && openDropdown === null;

  useEffect(() => {
    if (!searchHintsRequested) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchHintsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [searchHintsRequested]);

  const toggleDropdown = (event: MouseEvent, key: SimpleDropdown) => {
    event.stopPropagation();
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const chevronClass = (open: boolean) =>
    `h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
      open ? "rotate-180" : ""
    }`;

  const segmentDivider = (
    <div className="w-px shrink-0 self-stretch bg-slate-300" aria-hidden />
  );

  return (
    <div className="flex flex-row items-stretch overflow-visible rounded-lg border border-slate-300 bg-white">
      <div className="relative flex min-w-0 flex-1 flex-row items-stretch overflow-visible">
        {!isPg && (
          <>
            <div
              className={`relative shrink-0 ${
                openDropdown === "transaction" ? "z-50" : ""
              }`}
            >
              <button
                type="button"
                aria-expanded={openDropdown === "transaction"}
                aria-haspopup="listbox"
                onClick={(event) => toggleDropdown(event, "transaction")}
                className={`${BAR_CONTROL} rounded-l-[7px] ${FOCUS_RING}`}
              >
                <span className="min-w-0 flex-1 truncate text-left">
                  {TRANSACTION_LABELS[transaction]}
                </span>
                <ChevronDown
                  className={chevronClass(openDropdown === "transaction")}
                  aria-hidden
                />
              </button>
              {openDropdown === "transaction" && (
                <ul
                  role="listbox"
                  className="absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                >
                  {transactionOptions.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={transaction === option}
                        onClick={(event) => {
                          event.stopPropagation();
                          setTransaction(option);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm font-medium focus-visible:outline-none ${
                          transaction === option
                            ? MENU_ITEM_ACTIVE
                            : MENU_ITEM_DEFAULT
                        }`}
                      >
                        {TRANSACTION_LABELS[option]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {segmentDivider}
          </>
        )}

        <div
          className={`relative flex min-w-0 flex-1 items-stretch ${
            searchHintsOpen ? "z-50" : ""
          } ${BAR_HEIGHT}`}
        >
          <MapPin
            className="pointer-events-none absolute left-3.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-sky-600 lg:block"
            aria-hidden
          />
          <div
            className={`${BAR_HEIGHT} flex w-full items-center gap-1.5 overflow-hidden bg-white py-2 pl-2 pr-2 scrollbar-none lg:overflow-x-auto lg:pl-10 lg:pr-3 focus-within:bg-slate-50/50 ${
              isPg ? "rounded-l-[7px]" : ""
            }`}
          >
            {searchTags.map((tag) => (
              <span
                key={searchTagKey(tag)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-200 bg-sky-50 py-1 pl-2 pr-1 text-xs font-medium text-navy-blue lg:pl-2.5 lg:text-sm"
              >
                {tag.label}
                <button
                  type="button"
                  aria-label={`Remove ${tag.label}`}
                  onClick={() => removeSearchTag(tag)}
                  className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-full hover:bg-sky-100 ${FOCUS_RING}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={searchText}
              onChange={(e) => handleSearchTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTypedSearchTag();
                } else if (
                  e.key === "Backspace" &&
                  !searchText &&
                  searchTags.length > 0
                ) {
                  removeSearchTag(searchTags[searchTags.length - 1]);
                }
              }}
              onFocus={() => {
                setOpenDropdown(null);
                setSearchHintsOpen(true);
              }}
              onBlur={() => setSearchHintsOpen(false)}
              placeholder={
                searchTags.length === 0
                  ? "Enter City, Locality, Project Name"
                  : "Add more"
              }
              role="combobox"
              aria-expanded={searchHintsOpen}
              aria-controls="hero-search-hints"
              aria-invalid={searchError !== null}
              aria-describedby={searchError ? "hero-search-error" : undefined}
              className="h-full min-w-10 flex-1 border-0 bg-transparent px-1 text-xs text-slate-800 lg:min-w-24 lg:px-0 lg:text-sm placeholder:text-slate-400 focus-visible:outline-none"
            />
          </div>
          {searchHintsOpen && !searchError && (
            <div id="hero-search-hints">
              <HeroSearchHintsDropdown
                searchText={searchText}
                suggestions={searchSuggestions}
                onSelect={addSearchTag}
              />
            </div>
          )}
          {searchError && (
            <p
              id="hero-search-error"
              role="alert"
              className="absolute left-0 top-full z-10 mt-1.5 text-xs font-medium text-red-500"
            >
              {searchError}
            </p>
          )}
        </div>

        <div className="hidden lg:flex">{segmentDivider}</div>

        <div
          className={`relative hidden min-w-44 lg:block ${
            openDropdown === "property-panel" ? "z-50" : ""
          }`}
        >
          <button
            type="button"
            aria-expanded={openDropdown === "property-panel"}
            aria-haspopup="dialog"
            onClick={(event) => toggleDropdown(event, "property-panel")}
            className={`${BAR_CONTROL} lg:min-w-44 ${FOCUS_RING}`}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {propertySelectorLabel}
            </span>
            <ChevronDown
              className={chevronClass(openDropdown === "property-panel")}
              aria-hidden
            />
          </button>
          {openDropdown === "property-panel" && (
            <HeroPropertyFilterPanel {...filters} />
          )}
        </div>
      </div>

      {segmentDivider}

      <div className={`flex shrink-0 items-stretch self-stretch ${BAR_HEIGHT}`}>
        <button
          type="button"
          aria-label="AI assisted search"
          className={`inline-flex ${BAR_HEIGHT} items-center justify-center gap-1 bg-sky-50/90 px-3 text-navy-blue transition hover:bg-sky-100 lg:px-4 ${FOCUS_RING}`}
        >
          <Sparkles className="h-4 w-4 text-sky-600 lg:h-3.5 lg:w-3.5" aria-hidden />
          <span className="hidden text-xs font-bold leading-none lg:inline">
            AI
          </span>
        </button>

        <div className="w-px shrink-0 self-stretch bg-slate-300" aria-hidden />

        <button
          type="button"
          aria-label="Search"
          onClick={submitSearch}
          className={`inline-flex ${BAR_HEIGHT} items-center justify-center rounded-r-[7px] bg-linear-to-r-navy-blue px-4 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-95 hover:cursor-pointer lg:px-10 ${FOCUS_RING}`}
        >
          <Search className="h-4 w-4 lg:hidden" aria-hidden />
          <span className="hidden lg:inline">Search</span>
        </button>
      </div>
    </div>
  );
}
