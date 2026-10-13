"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  AREA_RANGE,
  CATEGORIES,
  DEFAULT_BUDGET,
  NEW_PROJECTS_HREF,
  PG_BUDGET,
  PROPERTY_TYPES,
  categoryPropertyLabel,
  filterSectionsForCategory,
  type FilterSection,
  type LocationCity,
  type PropertyCategory,
  type SimpleDropdown,
  type TransactionType,
} from "./heroBanner.shared";

export function useHeroBannerFilters() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] =
    useState<PropertyCategory>("residential");
  const [transaction, setTransaction] = useState<TransactionType>("buy");
  const [location, setLocation] = useState<LocationCity>("gandhinagar");
  const [searchText, setSearchText] = useState("");
  const [openDropdown, setOpenDropdown] = useState<SimpleDropdown | null>(
    null,
  );
  const [expandedSection, setExpandedSection] = useState<FilterSection | null>(
    "budget",
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
    "Right Property, Right Now";

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
    const handleClickOutside = (event: MouseEvent) => {
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
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeDropdowns]);

  const isPg = activeCategory === "pg-co-living";

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

  return {
    panelRef,
    activeCategory,
    transaction,
    setTransaction,
    location,
    setLocation,
    searchText,
    setSearchText,
    openDropdown,
    setOpenDropdown,
    expandedSection,
    setExpandedSection,
    selectedPropertyTypes,
    selectedBedrooms,
    setSelectedBedrooms,
    selectedConstruction,
    setSelectedConstruction,
    selectedOccupancy,
    setSelectedOccupancy,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    pgBudgetMin,
    setPgBudgetMin,
    pgBudgetMax,
    setPgBudgetMax,
    areaMin,
    setAreaMin,
    areaMax,
    setAreaMax,
    heroTitle,
    hasPropertyChips,
    propertyTypeOptions,
    filterSections,
    propertySelectorLabel,
    handleCategorySelect,
    togglePropertyType,
    toggleFromList,
    isPg,
    filterSelectionState,
  };
}

export type HeroBannerFilters = ReturnType<typeof useHeroBannerFilters>;
