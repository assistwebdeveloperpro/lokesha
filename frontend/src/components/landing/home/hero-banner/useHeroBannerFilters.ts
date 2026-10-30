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
  ALL_INDIA_LABEL,
  storeCity,
} from "@/components/shared/layout/city-selector/citySelector.shared";
import { useHeaderCity } from "@/components/shared/layout/city-selector/useHeaderCity";
import { buildLandingUrl } from "@/lib/property-search-url/buildLandingUrl";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { SEARCH_ERROR_MESSAGE } from "@/lib/property-search-url/searchUrl.config";
import {
  AREA_RANGE,
  CATEGORIES,
  COMMERCIAL_TRANSACTION_OPTIONS,
  DEFAULT_TRANSACTION_OPTIONS,
  DEFAULT_BUDGET,
  NEW_PROJECTS_HREF,
  PG_BUDGET,
  PROPERTY_TYPES,
  categoryPropertyLabel,
  filterSectionsForCategory,
  type FilterSection,
  type PropertyCategory,
  type SearchTag,
  type SimpleDropdown,
  type TransactionType,
} from "./heroBanner.shared";
import { buildHeroSearchCriteria } from "./heroSearchCriteria";
import {
  getSearchSuggestions,
  resolveSearchTag,
} from "./heroSearchSuggestions";
import {
  appendSearchTag,
  searchTagKey,
  syncHeaderCityTag,
} from "./heroSearchTags";

const defaultPropertyTypes = (category: PropertyCategory) =>
  PROPERTY_TYPES[category as keyof typeof PROPERTY_TYPES] ?? [];

const defaultExpandedSection = (category: PropertyCategory): FilterSection =>
  category === "residential" || category === "pg-co-living" ? "budget" : "area";

export type HeroBannerInitialSelection = {
  initialCategory?: PropertyCategory;
  initialCity?: string;
  initialTransaction?: TransactionType;
};

export function useHeroBannerFilters({
  initialCategory = "residential",
  initialCity,
  initialTransaction = "buy",
}: HeroBannerInitialSelection = {}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] =
    useState<PropertyCategory>(initialCategory);
  const transactionOptions =
    activeCategory === "commercial"
      ? COMMERCIAL_TRANSACTION_OPTIONS
      : DEFAULT_TRANSACTION_OPTIONS;
  const [selectedTransaction, setTransaction] =
    useState<TransactionType>(initialTransaction);
  const transaction = transactionOptions.includes(selectedTransaction)
    ? selectedTransaction
    : "buy";
  const headerCity = useHeaderCity();
  const [searchText, setSearchText] = useState("");
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<SimpleDropdown | null>(
    null,
  );
  const [expandedSection, setExpandedSection] = useState<FilterSection | null>(
    defaultExpandedSection(initialCategory),
  );

  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    defaultPropertyTypes(initialCategory),
  );
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);
  const [selectedConstruction, setSelectedConstruction] = useState<string[]>([]);
  const [selectedSaleTypes, setSelectedSaleTypes] = useState<string[]>([]);
  const [selectedOccupancy, setSelectedOccupancy] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);

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
    if (
      selectedPropertyTypes.length === 0 ||
      selectedPropertyTypes.length === propertyTypeOptions.length
    ) {
      return `All ${categoryPropertyLabel(activeCategory)}`;
    }
    if (selectedPropertyTypes.length === 1) {
      return selectedPropertyTypes[0];
    }
    return `${selectedPropertyTypes.length} types selected`;
  }, [activeCategory, propertyTypeOptions, selectedPropertyTypes]);

  const resetFiltersForCategory = useCallback((category: PropertyCategory) => {
    setSelectedPropertyTypes(defaultPropertyTypes(category));
    setSelectedBedrooms([]);
    setSelectedConstruction([]);
    setSelectedSaleTypes([]);
    setSelectedOccupancy([]);
    setSelectedGender([]);
    setBudgetMin(DEFAULT_BUDGET.min);
    setBudgetMax(DEFAULT_BUDGET.max);
    setPgBudgetMin(PG_BUDGET.min);
    setPgBudgetMax(PG_BUDGET.max);
    setAreaMin(AREA_RANGE.min);
    setAreaMax(AREA_RANGE.max);
    setExpandedSection(defaultExpandedSection(category));
  }, []);

  useEffect(() => {
    if (initialCity) storeCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    if (activeCategory === "new-projects") return;
    const url = buildLandingUrl({
      category: activeCategory,
      cityName: headerCity === ALL_INDIA_LABEL ? null : headerCity,
      transaction: activeCategory === "pg-co-living" ? null : transaction,
    });
    window.history.replaceState(window.history.state, "", url);
  }, [activeCategory, headerCity, transaction]);

  useEffect(() => {
    setSearchTags((prev) =>
      syncHeaderCityTag(prev, headerCity === ALL_INDIA_LABEL ? null : headerCity),
    );
  }, [headerCity]);

  const selectedCity =
    searchTags.find((tag) => tag.kind === "city")?.label ?? null;

  const searchSuggestions = useMemo(
    () => getSearchSuggestions(searchText, selectedCity),
    [searchText, selectedCity],
  );

  const addSearchTag = useCallback((tag: SearchTag) => {
    setSearchTags((prev) => appendSearchTag(prev, tag));
    setSearchText("");
    setSearchError(null);
  }, []);

  const rejectSearchText = useCallback(() => {
    setSearchText("");
    setSearchError(SEARCH_ERROR_MESSAGE);
  }, []);

  const addTypedSearchTag = useCallback(() => {
    if (!searchText.trim()) return;
    const tag = resolveSearchTag(searchText, selectedCity);
    if (tag) addSearchTag(tag);
    else rejectSearchText();
  }, [addSearchTag, rejectSearchText, searchText, selectedCity]);

  const removeSearchTag = useCallback((tag: SearchTag) => {
    setSearchTags((prev) =>
      prev.filter((item) => searchTagKey(item) !== searchTagKey(tag)),
    );
  }, []);

  const handleSearchTextChange = useCallback((value: string) => {
    setSearchText(value);
    setSearchError(null);
  }, []);

  const submitSearch = () => {
    const pendingTag = resolveSearchTag(searchText, selectedCity);
    if (searchText.trim() && !pendingTag) {
      rejectSearchText();
      return;
    }
    const tags = pendingTag ? appendSearchTag(searchTags, pendingTag) : searchTags;

    if (tags.length === 0) {
      setSearchError(SEARCH_ERROR_MESSAGE);
      return;
    }

    const criteria = buildHeroSearchCriteria({
      category: activeCategory,
      transaction,
      searchTags: tags,
      propertyTypeOptions,
      selectedPropertyTypes,
      selectedBedrooms,
      selectedConstruction,
      selectedSaleTypes,
      selectedOccupancy,
      selectedGender,
      budgetMin,
      budgetMax,
      pgBudgetMin,
      pgBudgetMax,
      areaMin,
      areaMax,
    });
    if (!criteria) return;

    setSearchTags(tags);
    setSearchText("");
    setOpenDropdown(null);
    router.push(buildSearchUrl(criteria));
  };

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
    selectedSaleTypes,
    selectedOccupancy,
    selectedGender,
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
    expandedSection,
    setExpandedSection,
    selectedPropertyTypes,
    selectedBedrooms,
    setSelectedBedrooms,
    selectedConstruction,
    setSelectedConstruction,
    selectedSaleTypes,
    setSelectedSaleTypes,
    selectedOccupancy,
    setSelectedOccupancy,
    selectedGender,
    setSelectedGender,
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
