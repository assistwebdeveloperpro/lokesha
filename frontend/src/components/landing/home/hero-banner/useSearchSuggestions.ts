"use client";

import { useEffect, useMemo, useState } from "react";
import { getSearchSuggestions as getRemoteSearchSuggestions } from "@/services/propertySearch.service";
import {
  getSearchSuggestions,
  isSuggestionQuery,
  normalizeSuggestionText,
  type SearchSuggestionGroups,
} from "./heroSearchSuggestions";

const SUGGESTION_DEBOUNCE_MS = 250;

type FetchedSuggestions = {
  key: string;
  tags: Pick<SearchSuggestionGroups, "projects" | "builders">;
};

// City and locality come from local data, project and builder from the api.
export function useSearchSuggestions(
  searchText: string,
  selectedCity: string | null,
) {
  const [fetched, setFetched] = useState<FetchedSuggestions | null>(null);
  const suggestionKey = `${normalizeSuggestionText(searchText)}|${selectedCity ?? ""}`;

  useEffect(() => {
    if (!isSuggestionQuery(searchText)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      getRemoteSearchSuggestions(
        normalizeSuggestionText(searchText),
        selectedCity,
        controller.signal,
      )
        .then(({ projects, builders }) =>
          setFetched({
            key: suggestionKey,
            tags: {
              projects: projects.map((label) => ({ kind: "project", label })),
              builders: builders.map((label) => ({ kind: "builder", label })),
            },
          }),
        )
        .catch(() => undefined);
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchText, selectedCity, suggestionKey]);

  const searchSuggestions = useMemo(() => {
    const local = getSearchSuggestions(searchText, selectedCity);
    if (!isSuggestionQuery(searchText) || fetched?.key !== suggestionKey) {
      return local;
    }
    return { ...local, ...fetched.tags };
  }, [fetched, searchText, selectedCity, suggestionKey]);

  const fetchedTags = useMemo(
    () => [...searchSuggestions.projects, ...searchSuggestions.builders],
    [searchSuggestions],
  );

  return { searchSuggestions, fetchedTags };
}
