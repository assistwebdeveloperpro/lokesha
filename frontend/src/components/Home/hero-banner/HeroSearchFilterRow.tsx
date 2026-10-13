"use client";

import type { MouseEvent } from "react";
import { ChevronDown, Search, Sparkles } from "lucide-react";
import {
  BAR_CONTROL,
  BAR_HEIGHT,
  FOCUS_RING,
  MENU_ITEM_ACTIVE,
  MENU_ITEM_DEFAULT,
  type LocationCity,
  type SimpleDropdown,
} from "./heroBanner.shared";
import { HeroPropertyFilterPanel } from "./HeroPropertyFilterPanel";
import type { HeroBannerFilters } from "./useHeroBannerFilters";

type HeroSearchFilterRowProps = HeroBannerFilters;

export function HeroSearchFilterRow(filters: HeroSearchFilterRowProps) {
  const {
    transaction,
    setTransaction,
    location,
    setLocation,
    searchText,
    setSearchText,
    openDropdown,
    setOpenDropdown,
    propertySelectorLabel,
  } = filters;

  const toggleDropdown = (event: MouseEvent, key: SimpleDropdown) => {
    event.stopPropagation();
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const chevronClass = (open: boolean) =>
    `h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
      open ? "rotate-180" : ""
    }`;

  const segmentDivider = (
    <>
      <div
        className="h-px shrink-0 bg-slate-300 lg:hidden"
        aria-hidden
      />
      <div
        className="hidden w-px shrink-0 self-stretch bg-slate-300 lg:block"
        aria-hidden
      />
    </>
  );

  return (
    <div className="flex flex-col overflow-visible rounded-lg border border-slate-300 bg-white lg:flex-row lg:items-stretch">
      <div className="relative flex min-w-0 flex-1 flex-col overflow-visible lg:flex-row lg:items-stretch">
        <div
          className={`relative ${
            openDropdown === "transaction" ? "z-50" : ""
          }`}
        >
          <button
            type="button"
            aria-expanded={openDropdown === "transaction"}
            aria-haspopup="listbox"
            onClick={(event) => toggleDropdown(event, "transaction")}
            className={`${BAR_CONTROL} rounded-tl-lg rounded-tr-lg lg:rounded-none lg:rounded-l-[7px] ${FOCUS_RING}`}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {transaction === "buy" ? "Buy" : "Rent"}
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
              {(["buy", "rent"] as const).map((option) => (
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
                    {option === "buy" ? "Buy" : "Rent"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {segmentDivider}

        <div
          className={`relative ${
            openDropdown === "location" ? "z-50" : ""
          }`}
        >
          <button
            type="button"
            aria-expanded={openDropdown === "location"}
            aria-haspopup="listbox"
            onClick={(event) => toggleDropdown(event, "location")}
            className={`${BAR_CONTROL} min-w-36 ${FOCUS_RING}`}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {location === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}
            </span>
            <ChevronDown
              className={chevronClass(openDropdown === "location")}
              aria-hidden
            />
          </button>
          {openDropdown === "location" && (
            <ul
              role="listbox"
              className="absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              {(
                [
                  ["ahmedabad", "Ahmedabad"],
                  ["gandhinagar", "Gandhinagar"],
                ] as const
              ).map(([value, label]) => (
                <li key={value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={location === value}
                    onClick={(event) => {
                      event.stopPropagation();
                      setLocation(value as LocationCity);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm font-medium focus-visible:outline-none ${
                      location === value
                        ? MENU_ITEM_ACTIVE
                        : MENU_ITEM_DEFAULT
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {segmentDivider}

        <div className={`relative flex min-w-0 flex-1 items-stretch ${BAR_HEIGHT}`}>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Locality, Project, Developer"
            className={`${BAR_HEIGHT} w-full border-0 bg-white py-2 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:bg-slate-50/50 focus-visible:outline-none ${FOCUS_RING}`}
          />
        </div>

        {segmentDivider}

        <div
          className={`relative min-w-40 lg:min-w-44 ${
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

      <div className={`flex w-full shrink-0 items-stretch self-stretch lg:w-auto ${BAR_HEIGHT}`}>
        <button
          type="button"
          aria-label="AI assisted search"
          className={`inline-flex ${BAR_HEIGHT} flex-1 items-center justify-center gap-1 rounded-bl-lg bg-sky-50/90 px-4 text-navy-blue transition hover:bg-sky-100 lg:flex-none lg:rounded-none ${FOCUS_RING}`}
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-600" aria-hidden />
          <span className="text-xs font-bold leading-none">AI</span>
        </button>

        <div className="w-px shrink-0 self-stretch bg-slate-300" aria-hidden />

        <button
          type="button"
          className={`inline-flex ${BAR_HEIGHT} flex-1 items-center justify-center rounded-br-lg bg-linear-to-r-navy-blue px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-95 hover:cursor-pointer sm:px-10 lg:flex-none lg:rounded-none lg:rounded-r-[7px] ${FOCUS_RING}`}
        >
          Search
        </button>
      </div>
    </div>
  );
}
