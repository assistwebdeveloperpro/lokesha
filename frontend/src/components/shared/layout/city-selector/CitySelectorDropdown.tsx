"use client";

import { ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import {
  useLayoutEffect,
  useMemo,
  useState,
  type MouseEventHandler,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { filterIndianCities } from "@/data/indianCities";
import {
  ALL_INDIA_LABEL,
  POPULAR_CITIES,
  getCityPanelPlacement,
  type CityPanelPlacement,
  type CitySelectorView,
} from "./citySelector.shared";

type CitySelectorDropdownProps = {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
  variant?: "desktop" | "mobile";
  triggerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
};

export default function CitySelectorDropdown({
  selectedCity,
  onSelectCity,
  onClose,
  variant = "desktop",
  triggerRef,
  panelRef,
  onMouseEnter,
  onMouseLeave,
}: CitySelectorDropdownProps) {
  const [view, setView] = useState<CitySelectorView>("popular");
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState<CityPanelPlacement | null>(null);
  const isMobile = variant === "mobile";

  const isSearching = search.trim().length > 0;
  const showAllCities = view === "all" || isSearching;
  const allMatches = useMemo(() => filterIndianCities(search), [search]);

  useLayoutEffect(() => {
    const updatePlacement = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        onClose();
        return;
      }
      setPlacement(getCityPanelPlacement(rect, isMobile));
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    window.visualViewport?.addEventListener("resize", updatePlacement);
    window.visualViewport?.addEventListener("scroll", updatePlacement);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
      window.visualViewport?.removeEventListener("resize", updatePlacement);
      window.visualViewport?.removeEventListener("scroll", updatePlacement);
    };
  }, [isMobile, onClose, triggerRef]);

  const handleSelect = (city: string) => {
    onSelectCity(city);
    onClose();
  };

  const handleAllIndia = () => {
    onSelectCity(ALL_INDIA_LABEL);
    onClose();
  };

  if (!placement) return null;

  return createPortal(
    <>
      {isMobile && (
        <button
          type="button"
          aria-label="Close city selector"
          className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/30"
          style={{ top: placement.backdropTop }}
          onClick={onClose}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-label="Select city"
        aria-modal={isMobile}
        className="fixed z-[60] flex flex-col pt-2.5"
        style={{
          top: placement.top,
          left: placement.left,
          width: placement.width,
          maxHeight: placement.maxHeight,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3 overflow-hidden" aria-hidden>
          <div
            className="absolute top-[3px] h-3.5 w-3.5 rotate-45 border-l border-t border-slate-200 bg-white"
            style={{ left: placement.caretLeft }}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
          <div className={`shrink-0 border-b border-slate-200 ${isMobile ? "px-3 py-2.5" : "px-4 py-3"}`}>
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for city"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-200 focus:outline-none focus:ring-0 sm:text-sm"
                autoFocus
              />
            </label>
          </div>

          <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${isMobile ? "px-3 py-3" : "px-4 py-4"}`}>
            {!showAllCities ? (
              <>
                <h3 className="mb-3 text-sm font-bold text-slate-900">Popular cities</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {POPULAR_CITIES.map((city) => {
                    const isSelected = selectedCity === city.name;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleSelect(city.name)}
                        className={`flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs font-semibold transition hover:border-sky-300 hover:bg-slate-50 ${
                          isSelected
                            ? "border-navy-blue text-navy-blue ring-1 ring-sky-100"
                            : "border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="relative h-7 w-7 shrink-0">
                          <Image
                            src={city.imageSrc}
                            alt=""
                            fill
                            className="object-contain"
                            sizes="28px"
                          />
                        </span>
                        <span className="truncate">{city.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  {isSearching ? "Search results" : "All cities"}
                </h3>
                <div className={`grid gap-x-6 gap-y-0.5 ${isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                  {allMatches.map((city) => {
                    const isSelected = selectedCity === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSelect(city)}
                        className={`cursor-pointer truncate py-2 text-left text-sm transition hover:text-sky-700 ${
                          isSelected ? "font-semibold text-navy-blue" : "text-slate-700"
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
                {allMatches.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-500">No cities found</p>
                )}
              </>
            )}
          </div>

          <div
            className={`flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 text-sm font-light ${
              isMobile ? "px-3 py-2.5" : "px-4 py-3"
            }`}
          >
            <button
              type="button"
              onClick={handleAllIndia}
              className={`cursor-pointer transition hover:text-sky-700 ${
                selectedCity === ALL_INDIA_LABEL ? "text-navy-blue" : "text-slate-800"
              }`}
            >
              {ALL_INDIA_LABEL}
            </button>
            <button
              type="button"
              onClick={() => {
                setView((current) => (current === "popular" ? "all" : "popular"));
                setSearch("");
              }}
              className="inline-flex cursor-pointer items-center gap-0.5 text-slate-800 transition hover:text-sky-700"
            >
              {view === "popular" ? "View all cities" : "View popular cities"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
