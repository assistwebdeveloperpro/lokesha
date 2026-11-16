"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { SearchTag } from "@/components/landing/home/hero-banner/heroBanner.shared";
import {
  getSearchSuggestions,
  resolveSearchTag,
} from "@/components/landing/home/hero-banner/heroSearchSuggestions";
import {
  appendSearchTag,
  searchTagKey,
} from "@/components/landing/home/hero-banner/heroSearchTags";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { normalizeSearchCriteria } from "@/lib/property-search-url/normalizeSearchCriteria";
import { SEARCH_ERROR_MESSAGE } from "@/lib/property-search-url/searchUrl.config";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";

const tagsFromCriteria = (criteria: PropertySearchCriteria): SearchTag[] => [
  ...(criteria.cityName
    ? [{ kind: "city", label: criteria.cityName } as const]
    : []),
  ...criteria.localities.map((label) => ({ kind: "locality", label }) as const),
  ...criteria.projects.map((label) => ({ kind: "project", label }) as const),
];

const tagLabels = (tags: SearchTag[], kind: SearchTag["kind"]) =>
  tags.filter((tag) => tag.kind === kind).map((tag) => tag.label);

export function useHeaderSearch(criteria: PropertySearchCriteria) {
  const router = useRouter();
  const criteriaTags = useMemo(() => tagsFromCriteria(criteria), [criteria]);
  const criteriaKey = criteriaTags.map(searchTagKey).join("|");

  const [searchTags, setSearchTags] = useState<SearchTag[]>(criteriaTags);
  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Tags follow the url, adjusted while rendering instead of in an effect
  const [syncedKey, setSyncedKey] = useState(criteriaKey);
  if (syncedKey !== criteriaKey) {
    setSyncedKey(criteriaKey);
    setSearchTags(criteriaTags);
    setSearchText("");
    setSearchError(null);
  }

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

    const next = normalizeSearchCriteria({
      ...criteria,
      cityName: tagLabels(tags, "city")[0],
      localities: tagLabels(tags, "locality"),
      projects: tagLabels(tags, "project"),
      page: 1,
    });
    setSearchTags(tags);
    setSearchText("");
    router.push(buildSearchUrl(next), { scroll: false });
  };

  return {
    searchText,
    searchTags,
    searchError,
    searchSuggestions,
    handleSearchTextChange,
    addSearchTag,
    addTypedSearchTag,
    removeSearchTag,
    submitSearch,
  };
}
