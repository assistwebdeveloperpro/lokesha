"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { FilterToggleChip } from "../search-filter-bar/SearchFilterDropdown";
import {
  FOCUS_RING,
  SCROLLBAR_NAVY_BLUE,
  formatAreaNumber,
} from "../../home/hero-banner/heroBanner.shared";
import { AREA_BOUNDS } from "../searchFilterOptions";
import { AREA_FILTER_STEPS } from "../search-filter-bar/areaOptions";
import { RangeBoundFilterPanel } from "../search-filter-bar/RangeBoundFilterPanel";
import {
  FALLBACK_AMENITY_OPTIONS,
  FALLBACK_FURNISHING_OPTIONS,
} from "./moreFilterFallbackOptions";
import {
  buildMoreFilterNav,
  patchChipValues,
  readChipValues,
  type MoreFilterBlock,
  type MoreFilterChipBlock,
  type MoreFilterNavItem,
  type MoreFiltersDraft,
} from "./moreFilterNav";

type MoreFiltersPanelProps = {
  criteria: PropertySearchCriteria;
  draft: MoreFiltersDraft;
  onChange: (next: MoreFiltersDraft) => void;
  onApply: (next: MoreFiltersDraft) => void;
  onClose: () => void;
  resultCountLabel?: string;
};

function toggleChip(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function MoreFilterCustomDropdown({
  value,
  placeholder,
  options,
  onChange,
  useCustomMenu,
}: {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  useCustomMenu: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!useCustomMenu) {
    return (
      <div className="relative w-full max-w-md">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white py-2.5 pl-4 pr-11 text-sm font-semibold shadow-sm transition hover:border-slate-400 hover:bg-slate-50/80 ${FOCUS_RING} ${
            value ? "text-slate-900" : "text-slate-500"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-300 bg-white py-2.5 pl-4 pr-3 text-left text-sm font-semibold shadow-sm transition hover:border-slate-400 hover:bg-slate-50/80 ${FOCUS_RING} ${
          value ? "text-slate-900" : "text-slate-500"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-30 overflow-hidden rounded-md border border-slate-300 bg-white shadow-lg">
          <ul role="listbox" className={`${SCROLLBAR_NAVY_BLUE} max-h-60 overflow-y-auto py-1`}>
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition hover:bg-slate-50 ${FOCUS_RING} ${
                !value ? "bg-sky-50 text-navy-blue" : "text-slate-800"
              }`}
            >
              {placeholder}
              {!value ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
            </button>
          </li>
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition hover:bg-slate-50 ${FOCUS_RING} ${
                    selected ? "bg-sky-50 text-navy-blue" : "text-slate-800"
                  }`}
                >
                  {option.label}
                  {selected ? (
                    <Check className="h-4 w-4 shrink-0" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ChipBlock({
  block,
  draft,
  options,
  onChange,
}: {
  block: MoreFilterChipBlock;
  draft: MoreFiltersDraft;
  options: { value: string; label: string }[];
  onChange: (next: MoreFiltersDraft) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const selected = readChipValues(draft, block.field);
  const visible = expanded
    ? [...options, ...(block.extendedOptions ?? [])]
    : options;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((option) => (
        <FilterToggleChip
          key={option.value}
          label={option.label}
          tone="light"
          selected={selected.includes(option.value)}
          onToggle={() =>
            onChange(
              patchChipValues(
                draft,
                block.field,
                toggleChip(selected, option.value),
              ),
            )
          }
        />
      ))}
      {block.extendedOptions && block.extendedOptions.length > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`rounded-md border border-slate-300 bg-transparent px-3 py-1.5 text-sm font-medium text-slate-800 hover:border-slate-400 ${FOCUS_RING}`}
        >
          {expanded ? "Less" : "+ More"}
        </button>
      ) : null}
    </div>
  );
}

function NavSection({
  item,
  draft,
  optionMap,
  onChange,
  sectionRef,
}: {
  item: MoreFilterNavItem;
  draft: MoreFiltersDraft;
  optionMap: Record<string, { value: string; label: string }[]>;
  onChange: (next: MoreFiltersDraft) => void;
  sectionRef: (node: HTMLDivElement | null) => void;
}) {
  const compactSection =
    item.blocks.length === 1 && item.blocks[0]?.type === "toggle";

  return (
    <div
      ref={sectionRef}
      id={`more-filter-${item.id}`}
      className={`border-b border-slate-100 last:border-b-0 ${
        compactSection ? "py-2" : "py-4"
      }`}
    >
      <p className="text-sm font-bold text-slate-900">{item.label}</p>
      <div className={compactSection ? "mt-1.5" : "mt-3 space-y-3"}>
        {item.blocks.map((block, index) => (
          <BlockRenderer
            key={`${item.id}-${index}`}
            block={block}
            draft={draft}
            optionMap={optionMap}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

function BlockRenderer({
  block,
  draft,
  optionMap,
  onChange,
}: {
  block: MoreFilterBlock;
  draft: MoreFiltersDraft;
  optionMap: Record<string, { value: string; label: string }[]>;
  onChange: (next: MoreFiltersDraft) => void;
}) {
  if (block.type === "area") {
    return (
      <div className="w-full max-w-md">
        <RangeBoundFilterPanel
          title=""
          bounds={AREA_BOUNDS}
          valueMin={draft.areaMin}
          valueMax={draft.areaMax}
          steps={AREA_FILTER_STEPS}
          formatValue={formatAreaNumber}
          minFieldLabel="Minimum area"
          maxFieldLabel="Maximum area"
          onCommit={(areaMin, areaMax) =>
            onChange({ ...draft, areaMin, areaMax })
          }
        />
      </div>
    );
  }

  if (block.type === "select") {
    const value = draft.more[block.field];
    return (
      <MoreFilterCustomDropdown
        value={value}
        placeholder={block.placeholder}
        options={block.options}
        useCustomMenu={block.field === "postedSince"}
        onChange={(next) =>
          onChange({
            ...draft,
            more: { ...draft.more, [block.field]: next },
          })
        }
      />
    );
  }

  if (block.type === "toggle") {
    const checked = Boolean(draft.more[block.field]);
    return (
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 accent-navy-blue"
          checked={checked}
          onChange={() =>
            onChange({
              ...draft,
              more: {
                ...draft.more,
                [block.field]: checked ? undefined : true,
              },
            })
          }
        />
        {block.label}
      </label>
    );
  }

  const options =
    block.field === "amenities"
      ? optionMap.amenities
      : block.field === "furnishingItems"
        ? optionMap.furnishingItems
        : block.options;

  if (options.length === 0) return null;

  return (
    <ChipBlock block={block} draft={draft} options={options} onChange={onChange} />
  );
}

export function MoreFiltersPanel({
  criteria,
  draft,
  onChange,
  onApply,
  onClose,
  resultCountLabel = "View Properties",
}: MoreFiltersPanelProps) {
  const navItems = useMemo(
    () => buildMoreFilterNav(criteria.category, criteria.transaction),
    [criteria.category, criteria.transaction],
  );
  const [activeId, setActiveId] = useState(navItems[0]?.id ?? "");
  const [navSyncHeight, setNavSyncHeight] = useState<number | undefined>();
  const navRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLDivElement>());

  const optionMap = useMemo(
    () => ({
      amenities: FALLBACK_AMENITY_OPTIONS,
      furnishingItems: FALLBACK_FURNISHING_OPTIONS,
    }),
    [],
  );

  useEffect(() => {
    if (!navItems.some((item) => item.id === activeId)) {
      setActiveId(navItems[0]?.id ?? "");
    }
  }, [navItems, activeId]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const syncHeight = () => {
      setNavSyncHeight(nav.offsetHeight);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(nav);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, [navItems]);

  const scrollTo = (id: string) => {
    setActiveId(id);
    const root = scrollRef.current;
    const section = sectionRefs.current.get(id);
    if (!root || !section) return;
    const top =
      section.getBoundingClientRect().top -
      root.getBoundingClientRect().top +
      root.scrollTop;
    root.scrollTo({ top, behavior: "smooth" });
  };

  const clearAll = () => {
    onChange({
      more: { ...EMPTY_MORE_FILTERS },
      constructionStatuses: [],
      areaMin: undefined,
      areaMax: undefined,
    });
  };

  if (navItems.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <div className="grid max-h-[min(calc(88vh-20px),calc(44rem-20px))] grid-cols-[minmax(6.75rem,30%)_1fr] items-start overflow-hidden sm:grid-cols-[minmax(9rem,28%)_1fr] md:grid-cols-[minmax(11rem,25%)_1fr]">
        <nav
          ref={navRef}
          aria-label="More filter categories"
          className={`${SCROLLBAR_NAVY_BLUE} max-h-[min(calc(88vh-20px),calc(44rem-20px))] overflow-y-auto overscroll-contain border-r border-slate-200 bg-slate-50/90`}
        >
          {navItems.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => scrollTo(item.id)}
                className={`block w-full cursor-pointer border-b border-slate-200 px-2.5 py-2.5 text-left text-xs transition last:border-b-0 sm:px-4 sm:py-3 sm:text-sm ${
                  active
                    ? "bg-navy-blue font-bold text-white"
                    : "font-semibold text-slate-800 hover:bg-white hover:text-navy-blue"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          ref={scrollRef}
          style={
            navSyncHeight !== undefined
              ? { maxHeight: navSyncHeight }
              : undefined
          }
          className={`${SCROLLBAR_NAVY_BLUE} min-h-0 min-w-0 overflow-y-auto overscroll-contain px-3 py-2 sm:px-4 md:px-6`}
        >
          {navItems.map((item) => (
            <NavSection
              key={item.id}
              item={item}
              draft={draft}
              optionMap={optionMap}
              onChange={onChange}
              sectionRef={(node) => {
                if (node) sectionRefs.current.set(item.id, node);
                else sectionRefs.current.delete(item.id);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={clearAll}
          className={`cursor-pointer text-sm font-bold text-slate-600 hover:text-navy-blue ${FOCUS_RING}`}
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
          className={`cursor-pointer rounded-md bg-navy-blue px-4 py-2 text-sm font-bold text-white hover:bg-navy-blue/90 ${FOCUS_RING}`}
        >
          {resultCountLabel}
        </button>
      </div>
    </div>
  );
}
