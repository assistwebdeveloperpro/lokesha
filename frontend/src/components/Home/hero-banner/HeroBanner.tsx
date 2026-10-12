"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

const HERO_DESCRIPTION =
  "A new home, a new office or any other property you need, its all here. Get started.";

const NEW_PROJECTS_HREF = "/new-projects";

const SCROLL_ROW_CLASS =
  "flex gap-2 overflow-x-auto scroll-smooth whitespace-nowrap [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:whitespace-normal";

const TAB_LIST_CLASS =
  "flex w-full min-w-0 flex-nowrap items-stretch overflow-x-auto whitespace-nowrap scroll-smooth pt-3 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

const CHIP_SELECTED =
  "border-navy-blue bg-sky-50 text-navy-blue shadow-sm ring-1 ring-sky-100";

const CHIP_DEFAULT =
  "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-slate-50";

const MENU_ITEM_ACTIVE = "bg-sky-50 text-navy-blue font-semibold";

const MENU_ITEM_DEFAULT =
  "text-slate-700 hover:bg-slate-50 hover:text-navy-blue";

const FILTER_TAB_ACTIVE =
  "-mb-px border-b-2 border-b-navy-blue text-navy-blue";

const FILTER_TAB_DEFAULT =
  "-mb-px border-b-2 border-b-transparent text-slate-700 hover:text-navy-blue";

const CATEGORY_TAB_DEFAULT =
  "-mb-px border-b-2 border-b-transparent text-slate-600 hover:text-navy-blue";

const BAR_CONTROL =
  "inline-flex h-12 w-full items-center justify-between gap-2 bg-white px-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50/80 lg:min-w-[5.5rem]";

type PropertyCategory =
  | "residential"
  | "commercial"
  | "new-projects"
  | "pg-co-living"
  | "plot"
  | "land";

type TransactionType = "buy" | "rent";
type LocationCity = "ahmedabad" | "gandhinagar";

type FilterSection =
  | "bedroom"
  | "budget"
  | "construction"
  | "area"
  | "occupancy";

type SimpleDropdown = "transaction" | "location" | "property-panel";

const CATEGORIES: {
  id: PropertyCategory;
  label: string;
  title: string;
  navigatesAway?: boolean;
}[] = [
  {
    id: "residential",
    label: "Residential",
    title: "Right Property, Right Now",
  },
  {
    id: "commercial",
    label: "Commercial",
    title: "Find space for every business need.",
  },
  {
    id: "new-projects",
    label: "New Projects",
    title: "New Projects",
    navigatesAway: true,
  },
  {
    id: "pg-co-living",
    label: "PG/Co-living",
    title: "Affordable PG Homes for Everyone.",
  },
  {
    id: "plot",
    label: "Plot",
    title: "Find Plot to Build Your Dream.",
  },
  {
    id: "land",
    label: "Land",
    title: "Find Land for Investment and Development.",
  },
];

const PROPERTY_TYPES: Record<
  Exclude<PropertyCategory, "new-projects" | "pg-co-living">,
  string[]
> = {
  residential: [
    "Flat/Apartment",
    "Bungalow/Villa",
    "Studio Apartment",
    "Weekend Homes",
    "Farm House",
    "Penthouse",
    "Duplex",
  ],
  commercial: [
    "Shop",
    "Office",
    "Showroom",
    "Cold Storage",
    "Industrial Shed",
    "Guest House",
    "Hotel/Resort",
    "Warehouse/Godown",
    "Co-working Space/Business Centre",
  ],
  plot: ["Residential Plot", "Industrial Plot", "Commercial Plot"],
  land: [
    "Agriculture Land",
    "Non-Agriculture Land",
    "Commercial Land",
    "Residential Land",
    "Industrial Land",
  ],
};

const BEDROOM_OPTIONS = [
  "+1BHK",
  "+2BHK",
  "+3BHK",
  "+4BHK",
  "+5BHK",
  "+6BHK",
  "+7BHK",
  "+8BHK",
  "+9BHK",
  "+10BHK",
];

const CONSTRUCTION_OPTIONS = [
  "Ready to Move",
  "Under Construction",
  "Pre Launch",
] as const;

const OCCUPANCY_OPTIONS = ["Single", "Double", "Triple", "Triple+"] as const;

const TRUST_ITEMS = [
  "Personal Property Manager",
  "Zero Brokerage",
  "Verified Property Listing",
] as const;

const RESIDENTIAL_BUDGET = { min: 500_000, max: 50_000_000_000 };
const DEFAULT_BUDGET = RESIDENTIAL_BUDGET;
const PG_BUDGET = { min: 1_000, max: 20_000 };
const AREA_RANGE = { min: 100, max: 50_000 };

function formatBudget(value: number, isPg: boolean): string {
  if (isPg) {
    return `₹${value.toLocaleString("en-IN")}`;
  }
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  }
  return `₹${(value / 100_000).toFixed(2)} Lac`;
}

function formatArea(value: number): string {
  return `${value.toLocaleString("en-IN")} sq ft`;
}

function categoryPropertyLabel(category: PropertyCategory): string {
  switch (category) {
    case "residential":
      return "Residential";
    case "commercial":
      return "Commercial";
    case "plot":
      return "Plot";
    case "land":
      return "Land";
    case "pg-co-living":
      return "PG";
    default:
      return "Property";
  }
}

function filterSectionsForCategory(
  category: PropertyCategory,
): FilterSection[] {
  switch (category) {
    case "residential":
      return ["bedroom", "budget", "construction"];
    case "pg-co-living":
      return ["budget", "occupancy"];
    case "commercial":
    case "plot":
    case "land":
      return ["budget", "area"];
    default:
      return [];
  }
}

function filterSectionLabel(section: FilterSection): string {
  switch (section) {
    case "bedroom":
      return "Bedroom";
    case "budget":
      return "Budget";
    case "construction":
      return "Construction Status";
    case "area":
      return "Area (sq ft)";
    case "occupancy":
      return "Occupancy";
  }
}

function filterSectionHasSelection(
  section: FilterSection,
  state: {
    isPg: boolean;
    selectedBedrooms: string[];
    selectedConstruction: string[];
    selectedOccupancy: string[];
    budgetMin: number;
    budgetMax: number;
    pgBudgetMin: number;
    pgBudgetMax: number;
    areaMin: number;
    areaMax: number;
  },
): boolean {
  switch (section) {
    case "bedroom":
      return state.selectedBedrooms.length > 0;
    case "construction":
      return state.selectedConstruction.length > 0;
    case "occupancy":
      return state.selectedOccupancy.length > 0;
    case "budget":
      if (state.isPg) {
        return (
          state.pgBudgetMin !== PG_BUDGET.min ||
          state.pgBudgetMax !== PG_BUDGET.max
        );
      }
      return (
        state.budgetMin !== DEFAULT_BUDGET.min ||
        state.budgetMax !== DEFAULT_BUDGET.max
      );
    case "area":
      return (
        state.areaMin !== AREA_RANGE.min || state.areaMax !== AREA_RANGE.max
      );
  }
}

type DualRangeProps = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
  formatValue: (value: number) => string;
  title: string;
  rangeLabel: string;
};

function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  formatValue,
  title,
  rangeLabel,
}: DualRangeProps) {
  const minId = useId();
  const maxId = useId();

  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500">{rangeLabel}</p>
      <div className="flex flex-wrap gap-2">
        <div className="min-w-30 flex-1 rounded-lg bg-navy-blue px-3 py-2 text-center text-xs font-semibold text-white shadow-sm">
          {formatValue(valueMin)}
        </div>
        <div className="min-w-30 flex-1 rounded-lg bg-navy-blue px-3 py-2 text-center text-xs font-semibold text-white shadow-sm">
          {formatValue(valueMax)}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor={minId} className="sr-only">
          Minimum value
        </label>
        <input
          id={minId}
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChangeMin(Math.min(next, valueMax));
          }}
          className="h-2 w-full cursor-pointer accent-[#12192b]"
        />
        <label htmlFor={maxId} className="sr-only">
          Maximum value
        </label>
        <input
          id={maxId}
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChangeMax(Math.max(next, valueMin));
          }}
          className="h-2 w-full cursor-pointer accent-[#12192b]"
        />
      </div>
    </div>
  );
}

export default function HeroBanner() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] =
    useState<PropertyCategory>("plot");
  const [transaction, setTransaction] = useState<TransactionType>("buy");
  const [location, setLocation] = useState<LocationCity>("gandhinagar");
  const [searchText, setSearchText] = useState("");
  const [openDropdown, setOpenDropdown] = useState<SimpleDropdown | null>(
    null,
  );
  const [expandedSection, setExpandedSection] = useState<FilterSection | null>(
    "area",
  );

  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    [],
  );
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);
  const [selectedConstruction, setSelectedConstruction] = useState<string[]>(
    [],
  );
  const [selectedOccupancy, setSelectedOccupancy] = useState<string[]>([]);

  const [budgetMin, setBudgetMin] = useState(DEFAULT_BUDGET.min);
  const [budgetMax, setBudgetMax] = useState(DEFAULT_BUDGET.max);
  const [pgBudgetMin, setPgBudgetMin] = useState(PG_BUDGET.min);
  const [pgBudgetMax, setPgBudgetMax] = useState(PG_BUDGET.max);
  const [areaMin, setAreaMin] = useState(AREA_RANGE.min);
  const [areaMax, setAreaMax] = useState(AREA_RANGE.max);

  const heroTitle =
    CATEGORIES.find((c) => c.id === activeCategory)?.title ??
    "Find Plot to Build Your Dream.";

  const hasPropertyChips =
    activeCategory !== "pg-co-living" && activeCategory !== "new-projects";

  const propertyTypeOptions = useMemo(() => {
    if (!hasPropertyChips) return [];
    return PROPERTY_TYPES[activeCategory as keyof typeof PROPERTY_TYPES] ?? [];
  }, [activeCategory, hasPropertyChips]);

  const filterSections = filterSectionsForCategory(activeCategory);

  const propertySelectorLabel = useMemo(() => {
    if (activeCategory === "pg-co-living") {
      return "Filters";
    }
    if (selectedPropertyTypes.length === 0) {
      return `All ${categoryPropertyLabel(activeCategory)}`;
    }
    if (selectedPropertyTypes.length === 1) {
      return selectedPropertyTypes[0];
    }
    return `${selectedPropertyTypes.length} types selected`;
  }, [activeCategory, selectedPropertyTypes]);

  const resetFiltersForCategory = useCallback((category: PropertyCategory) => {
    setSelectedPropertyTypes([]);
    setSelectedBedrooms([]);
    setSelectedConstruction([]);
    setSelectedOccupancy([]);
    setBudgetMin(DEFAULT_BUDGET.min);
    setBudgetMax(DEFAULT_BUDGET.max);
    setPgBudgetMin(PG_BUDGET.min);
    setPgBudgetMax(PG_BUDGET.max);
    setAreaMin(AREA_RANGE.min);
    setAreaMax(AREA_RANGE.max);
    setExpandedSection(
      category === "residential"
        ? "budget"
        : category === "pg-co-living"
          ? "budget"
          : "area",
    );
  }, []);

  const handleCategorySelect = (category: PropertyCategory) => {
    const meta = CATEGORIES.find((c) => c.id === category);
    if (meta?.navigatesAway) {
      router.push(NEW_PROJECTS_HREF);
      return;
    }
    setActiveCategory(category);
    resetFiltersForCategory(category);
    setOpenDropdown(null);
  };

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleFromList = (
    value: string,
    setter: Dispatch<SetStateAction<string[]>>,
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const closeDropdowns = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        closeDropdowns();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDropdowns();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeDropdowns]);

  const isPg = activeCategory === "pg-co-living";
  const isWideFilterPanel =
    activeCategory === "residential" || activeCategory === "commercial";

  const filterChipRowClass = isWideFilterPanel
    ? "flex w-full flex-wrap gap-2"
    : SCROLL_ROW_CLASS;

  const filterSelectionState = {
    isPg,
    selectedBedrooms,
    selectedConstruction,
    selectedOccupancy,
    budgetMin,
    budgetMax,
    pgBudgetMin,
    pgBudgetMax,
    areaMin,
    areaMax,
  };

  return (
    <section
      className="relative flex min-h-155 w-full flex-col justify-center bg-cover bg-center bg-no-repeat px-4 py-12 sm:min-h-165 sm:px-6 sm:py-14 lg:min-h-170 lg:py-16"
      style={{
        backgroundImage:
          "url(/assets/images/homepage/hero-banner.png)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-slate-900/40"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-5 text-center sm:mb-6">
          <h1 className="font-display text-2xl font-bold leading-snug text-white drop-shadow-md sm:text-3xl md:text-[2rem]">
            {heroTitle}
          </h1>
          {activeCategory !== "new-projects" && (
            <p className="mx-auto mt-2 max-w-2xl text-xs md:text-sm font-semibold text-white sm:text-sm">
              {HERO_DESCRIPTION}
            </p>
          )}
        </div>

        <div ref={panelRef} className="relative overflow-visible">
          <div
            className="pointer-events-none absolute inset-0 top-3 rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/90"
            aria-hidden
          />
          <div className="relative">
          <div
            className={`${TAB_LIST_CLASS} border-b border-slate-200`}
            role="tablist"
            aria-label="Property categories"
          >
            {CATEGORIES.map((category, index) => {
              const isActive = activeCategory === category.id;
              return (
                <Fragment key={category.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`relative min-w-max flex-1 shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-center text-[0.9375rem] font-semibold transition ${FOCUS_RING} ${
                      index < CATEGORIES.length - 1
                        ? "border-r border-slate-200"
                        : ""
                    } ${isActive ? FILTER_TAB_ACTIVE : CATEGORY_TAB_DEFAULT}`}
                  >
                    {category.id === "new-projects" ? (
                      <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                        <span className="new-projects-badge inline-flex items-center whitespace-nowrap rounded bg-amber-400 px-1.5 py-0.75 text-[10px] font-bold uppercase leading-none tracking-wide text-slate-900">
                          New
                        </span>
                      </span>
                    ) : null}
                    {category.label}
                  </button>
                </Fragment>
              );
            })}
          </div>

          <div className="overflow-visible p-4 sm:p-5">
            <div className="flex flex-col overflow-visible rounded-lg border border-slate-300 lg:flex-row lg:items-stretch">
              <div className="relative flex min-w-0 flex-1 flex-col overflow-visible lg:flex-row lg:items-stretch">
              <div className="relative lg:border-r lg:border-slate-300">
                  <button
                    type="button"
                    aria-expanded={openDropdown === "transaction"}
                    aria-haspopup="listbox"
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === "transaction" ? null : "transaction",
                      )
                    }
                    className={`${BAR_CONTROL} border-b border-slate-300 lg:border-b-0 ${FOCUS_RING}`}
                  >
                    {transaction === "buy" ? "Buy" : "Rent"}
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </button>
                  {openDropdown === "transaction" && (
                    <ul
                      role="listbox"
                      className="absolute left-0 top-full z-40 mt-1 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    >
                      {(["buy", "rent"] as const).map((option) => (
                        <li key={option}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={transaction === option}
                            onClick={() => {
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

              <div className="relative lg:border-r lg:border-slate-300">
                  <button
                    type="button"
                    aria-expanded={openDropdown === "location"}
                    aria-haspopup="listbox"
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === "location" ? null : "location",
                      )
                    }
                    className={`${BAR_CONTROL} min-w-36 border-b border-slate-300 lg:border-b-0 ${FOCUS_RING}`}
                  >
                    {location === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </button>
                  {openDropdown === "location" && (
                    <ul
                      role="listbox"
                      className="absolute left-0 top-full z-40 mt-1 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
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
                            onClick={() => {
                              setLocation(value);
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

              <div className="relative min-w-0 flex-1 border-b border-slate-300 lg:border-b-0 lg:border-r lg:border-slate-300">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Locality, Project, Developer"
                  className={`h-12 w-full border-0 bg-white py-2 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:bg-slate-50/50 focus-visible:outline-none ${FOCUS_RING}`}
                />
              </div>

              <div className="relative min-w-34 border-b border-slate-300 lg:border-b-0 lg:border-r lg:border-slate-300">
                  <button
                    type="button"
                    aria-expanded={openDropdown === "property-panel"}
                    aria-haspopup="dialog"
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === "property-panel" ? null : "property-panel",
                      )
                    }
                    className={`${BAR_CONTROL} lg:min-w-38 ${FOCUS_RING}`}
                  >
                    <span className="truncate">{propertySelectorLabel}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </button>
              </div>

            {openDropdown === "property-panel" && (
                    <div
                      role="dialog"
                      aria-label="Property filters"
                      className={`absolute top-full z-50 mt-2 max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-2xl ${
                        isWideFilterPanel
                          ? "left-0 right-0 w-full"
                          : "left-0 w-full sm:left-auto sm:right-0 sm:w-[min(100%,36rem)]"
                      }`}
                    >
                      {hasPropertyChips && (
                        <div
                          className={`${filterChipRowClass} pb-3`}
                          aria-label="Property types"
                        >
                          {propertyTypeOptions.map((type) => {
                            const selected = selectedPropertyTypes.includes(type);
                            return (
                              <button
                                key={type}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => togglePropertyType(type)}
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${FOCUS_RING} ${
                                  selected ? CHIP_SELECTED : CHIP_DEFAULT
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div
                        className={`${filterChipRowClass} border-t border-slate-100 pt-3`}
                      >
                        {filterSections.map((section) => {
                          const isExpanded = expandedSection === section;
                          const hasSelection = filterSectionHasSelection(
                            section,
                            filterSelectionState,
                          );
                          const isFilterTabActive = isExpanded || hasSelection;
                          return (
                            <button
                              key={section}
                              type="button"
                              aria-expanded={isExpanded}
                              onClick={() =>
                                setExpandedSection((prev) =>
                                  prev === section ? null : section,
                                )
                              }
                              className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold ${FOCUS_RING} ${
                                isFilterTabActive
                                  ? FILTER_TAB_ACTIVE
                                  : FILTER_TAB_DEFAULT
                              }`}
                            >
                              {filterSectionLabel(section)}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" aria-hidden />
                              ) : (
                                <ChevronDown className="h-4 w-4" aria-hidden />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {expandedSection === "bedroom" && (
                        <div
                          className={`${filterChipRowClass} mt-3 border-t border-slate-100 pt-3`}
                        >
                          {BEDROOM_OPTIONS.map((bedroom) => {
                            const selected = selectedBedrooms.includes(bedroom);
                            return (
                              <button
                                key={bedroom}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  toggleFromList(bedroom, setSelectedBedrooms)
                                }
                                className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                                  selected ? CHIP_SELECTED : CHIP_DEFAULT
                                }`}
                              >
                                {bedroom}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {expandedSection === "construction" && (
                        <div
                          className={`${filterChipRowClass} mt-3 border-t border-slate-100 pt-3`}
                        >
                          {CONSTRUCTION_OPTIONS.map((status) => {
                            const selected =
                              selectedConstruction.includes(status);
                            return (
                              <button
                                key={status}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  toggleFromList(status, setSelectedConstruction)
                                }
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                                  selected ? CHIP_SELECTED : CHIP_DEFAULT
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {expandedSection === "occupancy" && (
                        <div
                          className={`${SCROLL_ROW_CLASS} mt-3 border-t border-slate-100 pt-3`}
                        >
                          {OCCUPANCY_OPTIONS.map((option) => {
                            const selected = selectedOccupancy.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  toggleFromList(option, setSelectedOccupancy)
                                }
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                                  selected ? CHIP_SELECTED : CHIP_DEFAULT
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {expandedSection === "budget" && (
                        <DualRangeSlider
                          min={isPg ? PG_BUDGET.min : DEFAULT_BUDGET.min}
                          max={isPg ? PG_BUDGET.max : DEFAULT_BUDGET.max}
                          valueMin={isPg ? pgBudgetMin : budgetMin}
                          valueMax={isPg ? pgBudgetMax : budgetMax}
                          onChangeMin={
                            isPg ? setPgBudgetMin : setBudgetMin
                          }
                          onChangeMax={
                            isPg ? setPgBudgetMax : setBudgetMax
                          }
                          formatValue={(v) => formatBudget(v, isPg)}
                          title="Select Budget Range"
                          rangeLabel={
                            isPg
                              ? `${formatBudget(pgBudgetMin, true)} - ${formatBudget(pgBudgetMax, true)}`
                              : `${formatBudget(budgetMin, false)} - ${formatBudget(budgetMax, false)}`
                          }
                        />
                      )}

                      {expandedSection === "area" && (
                        <DualRangeSlider
                          min={AREA_RANGE.min}
                          max={AREA_RANGE.max}
                          valueMin={areaMin}
                          valueMax={areaMax}
                          onChangeMin={setAreaMin}
                          onChangeMax={setAreaMax}
                          formatValue={formatArea}
                          title="Select Area Range"
                          rangeLabel={`${formatArea(areaMin)} - ${formatArea(areaMax)}`}
                        />
                      )}
                    </div>
                  )}
              </div>

              <div className="flex min-h-12 shrink-0">
                <button
                  type="button"
                  aria-label="AI assisted search"
                  className={`inline-flex h-12 flex-1 items-center justify-center gap-1 border-b border-slate-300 bg-sky-50/90 px-4 text-navy-blue transition hover:bg-sky-100 lg:flex-none lg:border-b-0 lg:border-r lg:border-slate-300 ${FOCUS_RING}`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                  <span className="text-xs font-bold leading-none">AI</span>
                </button>

                <button
                  type="button"
                  className={`inline-flex h-12 flex-1 items-center justify-center bg-linear-to-r-navy-blue px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-95 sm:px-10 lg:flex-none lg:rounded-r-[7px] ${FOCUS_RING}`}
                >
                  Search
                </button>
              </div>
            </div>

            <ul className="mt-4 flex flex-col items-center gap-2.5 sm:mt-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 sm:text-sm"
                >
                  <span className="inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <Check
                      className="h-2.5 w-2.5 text-white"
                      strokeWidth={3}
                      aria-hidden
                    />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
